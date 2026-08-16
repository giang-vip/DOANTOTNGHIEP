import { useState, useEffect } from 'react';
import { Student, ClassSection } from '../../../models';

export function getClassStatus(startDateStr?: string, endDateStr?: string, compareDateStr?: string) {
  if (!startDateStr || !endDateStr) return 'ongoing';

  const compareDate = compareDateStr ? new Date(compareDateStr) : new Date();
  compareDate.setHours(0, 0, 0, 0);

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDateStr);
  end.setHours(23, 59, 59, 999);

  if (compareDate < start) return 'not_started';
  if (compareDate > end) return 'ended';
  return 'ongoing';
}

import { studentApi } from '../../../api/services/studentApi';

export function useScheduleViewModel(studentProfile: Student) {
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await studentApi.getStudentClasses(0, 100);
        const allClasses = (res as any)?.content || [];
        // Bỏ lọc bằng 'ongoing' theo ngày hiện tại, để cho phép xem toàn bộ thời khóa biểu
        setEnrolledClasses(allClasses);
      } catch (err) {
        console.error('Lỗi khi tải lịch học:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();

    window.addEventListener('REFRESH_STUDENT_DATA', fetchClasses);
    return () => window.removeEventListener('REFRESH_STUDENT_DATA', fetchClasses);
  }, []);

  // State controls
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'ongoing' | 'ended'>('all');

  // Period slot mapping to real clock time labels
  const getTimeLabel = (start: number, end: number) => {
    const times: Record<number, string> = {
      1: '07:00',
      2: '08:35',
      3: '08:45',
      4: '10:20',
      5: '10:30',
      6: '12:05',
      7: '13:00',
      8: '14:35',
      9: '14:45',
      10: '16:20',
      11: '16:30',
      12: '18:05'
    };
    return `${times[start] || '07:00'} - ${times[end] || '12:05'}`;
  };

  // Convert HTML date to dayOfWeek number (Monday is 2, Sunday is not standard but say 1)
  const getDayOfWeekFromDate = (dateStr: string): number => {
    const date = new Date(dateStr);
    const jsDay = date.getDay(); // 0 is Sunday, 1 is Monday, 2 is Tuesday...
    if (jsDay === 0) return 8; // Simulated Sunday as 8 or can map as needed
    return jsDay + 1; // JS 1 (Mon) becomes 2, JS 6 (Sat) becomes 7
  };

  // Filter classes based on status filter
  const getFilteredClasses = (classList: ClassSection[], compareDateStr?: string) => {
    return classList.filter(cls => {
      const status = getClassStatus(cls.startDate, cls.endDate, compareDateStr);
      if (statusFilter === 'all') return true;
      return status === statusFilter;
    });
  };

  return {
    enrolledClasses,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    getTimeLabel,
    getDayOfWeekFromDate,
    getFilteredClasses,
    getClassStatus
  };
}
