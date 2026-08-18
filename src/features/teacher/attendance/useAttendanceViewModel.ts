import { useState, useEffect } from 'react';
import { teacherApi } from '../../../api/services/teacherApi';

/**
 * ViewModel cho trang "Điểm danh học viên" (Teacher Attendance).
 * Kết nối API điểm danh thực tế với cơ chế auto-load thống kê đầy đủ.
 */
export function useAttendanceViewModel(teacherId: string) {
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  
  // Tích lũy tất cả records của mọi phiên để tính thống kê chuyên cần
  const [allSessionsRecords, setAllSessionsRecords] = useState<any[]>([]);

  const [sessionTitle, setSessionTitle] = useState('Buổi học hôm nay');
  const [expireMinutes, setExpireMinutes] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  const getClassId = (cls: any): number => {
    return Number(cls.id);
  };

  // 1. Fetch danh sách lớp của GV
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const res: any = await teacherApi.getMyClasses();
        const items = res.content || res || [];
        setMyClasses(items);
        if (items.length > 0 && !selectedClass) {
          setSelectedClass(items[0]);
        }
      } catch (err) {
        console.error('Lỗi lấy lớp học:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [teacherId]);

  // 2. Khi đổi lớp: Fetch danh sách phiên điểm danh + danh sách SV
  useEffect(() => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);

    const fetchClassData = async () => {
      try {
        setIsLoadingSessions(true);
        const sesRes: any = await teacherApi.getAttendanceSessions(classId);
        const sessionsList = (sesRes.content || sesRes || []).map((s: any) => ({
          ...s,
          status: s.status ? s.status.toLowerCase() : 'closed'
        }));
        setSessions(sessionsList);
        
        if (sessionsList.length > 0) {
          setSelectedSession(sessionsList[0]); // Mặc định chọn phiên mới nhất
        } else {
          setSelectedSession(null);
          setRecords([]);
        }
        
        // Gọi song song nạp tất cả records để làm báo cáo thống kê
        fetchAllSessionsRecords(sessionsList);
      } catch (err) {
        console.error('Lỗi lấy phiên điểm danh:', err);
      } finally {
        setIsLoadingSessions(false);
      }

      try {
        const studentRes: any = await teacherApi.getClassStudents(classId);
        const enrollments = studentRes.content || studentRes || [];
        // Map EnrollmentResponse -> Student format
        const mappedStudents = enrollments.map((e: any) => ({
          id: e.studentCode, // Dùng studentCode làm khóa chính cho khớp UI
          name: e.studentName || 'Học viên',
          status: 'active'
        }));
        setClassStudents(mappedStudents);
      } catch (err) {
        console.error('Lỗi lấy danh sách sinh viên:', err);
      }
    };

    fetchClassData();
  }, [selectedClass]);

  // Nạp tất cả record của các phiên để tính tỷ lệ chuyên cần
  const fetchAllSessionsRecords = async (sessionsList: any[]) => {
    try {
      const promises = sessionsList.map(s => teacherApi.getAttendanceRecords(s.id));
      const results = await Promise.all(promises);
      const accumulated: any[] = [];
      results.forEach((recordsList: any, idx) => {
        const ses = sessionsList[idx];
        if (Array.isArray(recordsList)) {
          recordsList.forEach((r: any) => {
            accumulated.push({
              sessionId: String(ses.id),
              studentId: r.studentCode,
              status: r.status.toLowerCase()
            });
          });
        }
      });
      // Lọc trùng lặp do lỗi dữ liệu cũ trong backend
      const uniqueAccumulated: any[] = [];
      const seen = new Set<string>();
      accumulated.forEach(r => {
        const key = `${r.sessionId}-${r.studentId}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueAccumulated.push(r);
        }
      });
      setAllSessionsRecords(uniqueAccumulated);
    } catch (err) {
      console.error('Lỗi nạp thống kê điểm danh:', err);
    }
  };

  const fetchRecordsForSession = async (sessionId: number | string) => {
    try {
      setIsLoadingRecords(true);
      const res: any = await teacherApi.getAttendanceRecords(Number(sessionId));
      const mapped = (res || []).map((r: any) => ({
        id: String(r.id),
        sessionId: String(r.attendanceSessionId),
        studentId: r.studentCode,
        studentName: r.studentName,
        status: r.status.toLowerCase(), // 'present' | 'absent' | 'late'
        note: r.note || ''
      }));
      const uniqueMapped: any[] = [];
      const seenRecords = new Set<string>();
      mapped.forEach((r: any) => {
        if (!seenRecords.has(r.studentId)) {
          seenRecords.add(r.studentId);
          uniqueMapped.push(r);
        }
      });
      
      setRecords(uniqueMapped);
    } catch (err) {
      console.error('Lỗi lấy danh sách điểm danh:', err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // 3. Khi đổi phiên điểm danh: Load danh sách records tương ứng
  useEffect(() => {
    if (!selectedSession) {
      setRecords([]);
      return;
    }
    fetchRecordsForSession(selectedSession.id);
  }, [selectedSession]);

  const [reopenTimestamps, setReopenTimestamps] = useState<Record<string, number>>({});

  // 4. Đếm ngược thời gian cho phiên đang Mở (Open)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (selectedSession && selectedSession.status === 'open') {
      const parseDateSafe = (val: any) => {
        if (!val) return new Date();
        if (Array.isArray(val)) {
          const [y, m, d, hr, min, sec] = val;
          return new Date(y, m - 1, d, hr || 0, min || 0, sec || 0);
        }
        return new Date(val);
      };

      const createdDate = parseDateSafe(selectedSession.createdAt);
      const createdTime = isNaN(createdDate.getTime()) ? Date.now() : createdDate.getTime();
      
      // Sử dụng thời gian mở lại nếu có, nếu không dùng thời gian tạo gốc
      const baseTime = reopenTimestamps[selectedSession.id] || createdTime;
      const durationMs = expireMinutes * 60 * 1000;
      const expiryTime = baseTime + durationMs;
      
      let alreadyClosing = false;

      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
        
        if (isNaN(expiryTime)) {
          setTimeRemaining(null);
          return;
        }

        if (diff <= 0) {
          // Chỉ tự động đóng nếu baseTime không quá cũ (ví dụ: phiên tạo từ hôm qua thì không tự đóng ngay khi mở lên)
          const timeSinceBase = now - baseTime;
          if (timeSinceBase > durationMs && timeSinceBase < durationMs + 2000) {
             if (!alreadyClosing) {
                alreadyClosing = true;
                handleForceCloseSession(() => {});
             }
          }
          setTimeRemaining(0);
        } else {
          setTimeRemaining(diff);
        }
      };

      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setTimeRemaining(null);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedSession, expireMinutes, reopenTimestamps]);

  // Tính thống kê chuyên cần cho từng học viên
  const getStudentStats = (studentId: string) => {
    const studentRecords = allSessionsRecords.filter(r => r.studentId === studentId);
    const total = studentRecords.length;
    const present = studentRecords.filter(r => r.status === 'present').length;
    const late = studentRecords.filter(r => r.status === 'late').length;
    const absent = studentRecords.filter(r => r.status === 'absent').length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { total, present, late, absent, rate };
  };

  // Tạo phiên điểm danh mới
  const handleCreateSession = async (title: string, date: string, status: 'open' | 'closed', onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;
    try {
      const classId = getClassId(selectedClass);
      const res: any = await teacherApi.createAttendanceSession(classId, {
        title,
        sessionDate: date,
        status: status.toUpperCase()
      });

      // Reload danh sách phiên học
      const sesRes: any = await teacherApi.getAttendanceSessions(classId);
      const sessionsList = (sesRes.content || sesRes || []).map((s: any) => ({
        ...s,
        status: s.status ? s.status.toLowerCase() : 'closed'
      }));
      setSessions(sessionsList);
      
      const newSession = sessionsList.find((s: any) => s.id === res.id) || {
        ...res,
        status: res.status ? res.status.toLowerCase() : 'closed'
      };
      setSelectedSession(newSession);
      fetchAllSessionsRecords(sessionsList);

      onSuccess(`Đã tạo phiên điểm danh "${title}" thành công!`);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Mở lại phiên điểm danh
  const handleReopenSession = async (sessionId: string | number, onSuccess: (msg: string) => void) => {
    try {
      await teacherApi.updateAttendanceSessionStatus(Number(sessionId), 'OPEN');
      setReopenTimestamps(prev => ({ ...prev, [String(sessionId)]: Date.now() }));
      
      if (selectedClass) {
        const classId = getClassId(selectedClass);
        const sesRes: any = await teacherApi.getAttendanceSessions(classId);
        const sessionsList = (sesRes.content || sesRes || []).map((s: any) => ({
          ...s,
          status: s.status ? s.status.toLowerCase() : 'closed'
        }));
        setSessions(sessionsList);
        const updated = sessionsList.find((s: any) => s.id === sessionId);
        if (updated) setSelectedSession(updated);
      }
      onSuccess('Đã mở lại phiên điểm danh thành công!');
    } catch (err) {
      console.error(err);
    }
  };

  // Chấm điểm danh thủ công từng sinh viên
  const handleUpdateRecordStatus = async (studentId: string, name: string, status: string) => {
    if (!selectedSession) return;
    const record = records.find(r => r.studentId === studentId);
    if (!record) return;

    try {
      // Chỉ cập nhật state nội bộ (Local state) - API call sẽ được thực hiện khi bấm Lưu
      setRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status: status.toLowerCase() } : r));
      setAllSessionsRecords(prev => prev.map(r => (r.sessionId === String(selectedSession.id) && r.studentId === studentId) ? { ...r, status: status.toLowerCase() } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveBulkAttendance = async (localAttendance: Record<string, string>, onSuccess: () => void, onError: () => void) => {
    if (!selectedSession) return;
    try {
      setIsLoadingRecords(true);
      const updatePromises = Object.entries(localAttendance).map(([studentId, status]) => {
        const record = records.find(r => r.studentId === studentId);
        if (record) {
          return teacherApi.updateAttendanceRecord(Number(record.id), { status: status.toUpperCase() });
        }
        return Promise.resolve();
      });
      await Promise.all(updatePromises);
      
      // Reload lại data ngay lập tức để đồng bộ hóa số liệu UI
      await fetchRecordsForSession(selectedSession.id);
      if (sessions.length > 0) {
        await fetchAllSessionsRecords(sessions);
      }
      
      onSuccess();
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Đóng phiên điểm danh
  const handleForceCloseSession = async (onSuccess: (msg: string) => void) => {
    if (!selectedSession) return;
    try {
      await teacherApi.updateAttendanceSessionStatus(Number(selectedSession.id), 'CLOSED');
      setSelectedSession(prev => prev ? { ...prev, status: 'closed' } : null);
      
      // Update in sessions list
      setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, status: 'closed' } : s));
      setTimeRemaining(null);
      onSuccess('Đã đóng phiên điểm danh thành công!');
    } catch (err) {
      console.error(err);
    }
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    sessions,
    selectedSession,
    setSelectedSession,
    sessionTitle,
    setSessionTitle,
    expireMinutes,
    setExpireMinutes,
    timeRemaining,
    records,
    classStudents,
    getStudentStats,
    createSession: handleCreateSession,
    reopenSession: handleReopenSession,
    updateRecordStatus: handleUpdateRecordStatus,
    saveBulkAttendance: handleSaveBulkAttendance,
    forceCloseSession: handleForceCloseSession
  };
}
