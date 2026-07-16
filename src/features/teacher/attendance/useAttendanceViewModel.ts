import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { ClassSection, AttendanceSession, AttendanceRecord, Student, AttendanceStatus } from '../../../types';

export function useAttendanceViewModel(teacherId: string) {
  const {
    classes,
    students,
    attendanceSessions,
    attendanceRecords,
    addAttendanceSession,
    updateAttendanceSession,
    updateAttendanceRecords
  } = useStore();

  const myClasses = classes.filter(c => c.teacherId === teacherId);

  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [sessionTitle, setSessionTitle] = useState('Buổi học hôm nay');
  const [expireMinutes, setExpireMinutes] = useState(15);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Set default class
  useEffect(() => {
    if (myClasses.length > 0 && !selectedClass) {
      setSelectedClass(myClasses[0]);
    }
  }, [classes]);

  // Set default session when class changes
  useEffect(() => {
    if (selectedClass) {
      const classSessions = attendanceSessions.filter(s => s.classId === selectedClass.id);
      if (classSessions.length > 0) {
        setSelectedSession(classSessions[classSessions.length - 1]); // default to latest
      } else {
        setSelectedSession(null);
      }
    }
  }, [selectedClass, attendanceSessions]);

  // Real-time Countdown timer for active open sessions
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (selectedSession && selectedSession.status === 'open') {
      // Compute expiry based on created time
      const createdTime = new Date(selectedSession.createdAt).getTime();
      // Store dynamic expirations using custom mock limit or 15 mins
      const durationMs = expireMinutes * 60 * 1000;
      const expiryTime = createdTime + durationMs;

      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
        
        if (diff <= 0) {
          // Auto close session
          updateAttendanceSession(selectedSession.id, { status: 'closed' });
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
  }, [selectedSession, expireMinutes, attendanceSessions]);

  const classSessions = selectedClass
    ? attendanceSessions.filter(s => s.classId === selectedClass.id)
    : [];

  const currentRecords = selectedSession
    ? attendanceRecords.filter(r => r.sessionId === selectedSession.id)
    : [];

  const classStudents = selectedClass
    ? students.filter(s => selectedClass.studentIds.includes(s.id) && s.status === 'active')
    : [];

  // Calculate attendance ratios for each student in the selected class
  const getStudentStats = (studentId: string) => {
    // Get all completed/closed sessions for this class (or all sessions)
    const classSessionIds = classSessions.map(s => s.id);
    const records = attendanceRecords.filter(r => r.classId === selectedClass?.id && r.studentId === studentId && classSessionIds.includes(r.sessionId));
    
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;

    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return { total, present, late, absent, rate };
  };

  const handleCreateSession = (title: string, date: string, status: 'open' | 'closed', onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;

    const session = addAttendanceSession({
      classId: selectedClass.id,
      date: date,
      title: title,
      status: status
    });

    setSelectedSession(session);
    onSuccess(`Đã tạo phiên học "${title}" thành công!`);
  };

  const handleReopenSession = (sessionId: string, onSuccess: (msg: string) => void) => {
    updateAttendanceSession(sessionId, { status: 'open', createdAt: new Date().toISOString() });
    
    // Auto select the reopened session
    const reopenedSes = attendanceSessions.find(s => s.id === sessionId);
    if (reopenedSes) {
      setSelectedSession({ ...reopenedSes, status: 'open', createdAt: new Date().toISOString() });
    }
    
    onSuccess('Đã mở lại phiên điểm danh thành công!');
  };

  const handleUpdateRecordStatus = (studentId: string, name: string, status: AttendanceStatus) => {
    if (!selectedSession) return;

    updateAttendanceRecords([
      {
        sessionId: selectedSession.id,
        classId: selectedSession.classId,
        studentId,
        studentName: name,
        status,
        noted: ''
      }
    ]);
  };

  const handleForceCloseSession = (onSuccess: (msg: string) => void) => {
    if (!selectedSession) return;
    updateAttendanceSession(selectedSession.id, { status: 'closed' });
    
    // Keep UI in sync
    setSelectedSession(prev => prev ? { ...prev, status: 'closed' } : null);
    setTimeRemaining(null);
    onSuccess('Đã đóng phiên điểm danh thủ công thành công!');
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    sessions: classSessions,
    selectedSession,
    setSelectedSession,
    sessionTitle,
    setSessionTitle,
    expireMinutes,
    setExpireMinutes,
    timeRemaining,
    records: currentRecords,
    classStudents,
    getStudentStats,
    createSession: handleCreateSession,
    reopenSession: handleReopenSession,
    updateRecordStatus: handleUpdateRecordStatus,
    forceCloseSession: handleForceCloseSession,
    updateAttendanceRecords
  };
}
