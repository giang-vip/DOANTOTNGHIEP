import { useState, useEffect } from 'react';
import { studentApi } from '../../../../api/services/studentApi';
import { ClassSection, AttendanceSession, AttendanceRecord } from '../../../../models';

export function useAttendanceViewModel(
  selectedClass: ClassSection,
  triggerToast: (msg: string, type: 'success' | 'danger') => void
) {
  const [activeRollCallSessions, setActiveRollCallSessions] = useState<AttendanceSession[]>([]);
  const [classSessions, setClassSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const recordsRes = await studentApi.getMyAttendance(Number(selectedClass.id));
        const rawRecords = (recordsRes as any) || [];
        
        // Map into AttendanceRecord
        const mappedRecords: AttendanceRecord[] = rawRecords.map((r: any) => ({
          id: r.id,
          attendanceSessionId: r.attendanceSessionId,
          sessionId: r.attendanceSessionId, // For compatibility
          classId: selectedClass.id,
          studentId: r.enrollmentId,
          status: r.status,
          noted: r.note,
          updatedAt: r.checkedAt
        }));
        
        setAttendanceRecords(mappedRecords);

        // Derive sessions from records
        const uniqueSessions = new Map<number, AttendanceSession>();
        rawRecords.forEach((r: any) => {
          if (!uniqueSessions.has(r.attendanceSessionId)) {
            uniqueSessions.set(r.attendanceSessionId, {
              id: r.attendanceSessionId,
              classId: selectedClass.id,
              date: r.sessionDate,
              title: r.sessionTitle,
              status: r.sessionStatus === 'OPEN' ? 'open' : 'closed',
              sessionDate: r.sessionDate,
              sessionTitle: r.sessionTitle,
              sessionStatus: r.sessionStatus
            });
          }
        });
        
        const sessionsList = Array.from(uniqueSessions.values());
        setClassSessions(sessionsList);

        // Active sessions are OPEN sessions
        const active = sessionsList.filter(s => s.status === 'open');
        setActiveRollCallSessions(active);
        
      } catch (err) {
        console.error('Lỗi khi tải điểm danh:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedClass.id]);

  const hasCheckedIn = (sessionId: number) => {
    return attendanceRecords.some(
      r => Number(r.attendanceSessionId) === sessionId && 
      (r.status?.toUpperCase() === 'PRESENT' || r.status?.toUpperCase() === 'LATE')
    );
  };

  const checkIn = async (session: AttendanceSession) => {
    if (hasCheckedIn(Number(session.id))) {
      triggerToast('Bạn đã điểm danh thành công cho ca học này rồi.', 'success');
      return;
    }
    try {
      await studentApi.checkIn(Number(selectedClass.id), Number(session.id));
      triggerToast('Điểm danh thành công!', 'success');
      
      // Refresh after check-in
      const recordsRes = await studentApi.getMyAttendance(Number(selectedClass.id));
      const rawRecords = (recordsRes as any) || [];
      const mappedRecords: AttendanceRecord[] = rawRecords.map((r: any) => ({
        id: r.id,
        attendanceSessionId: r.attendanceSessionId,
        sessionId: r.attendanceSessionId,
        classId: selectedClass.id,
        studentId: r.enrollmentId,
        status: r.status,
        noted: r.note,
        updatedAt: r.checkedAt
      }));
      setAttendanceRecords(mappedRecords);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Có lỗi khi điểm danh.', 'danger');
    }
  };

  return {
    activeRollCallSessions,
    classSessions,
    attendanceRecords,
    loading,
    hasCheckedIn,
    checkIn
  };
}
