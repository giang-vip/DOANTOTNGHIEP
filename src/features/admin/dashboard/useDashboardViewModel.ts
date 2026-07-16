import { useStore } from '../../../models/store';
import { RegistrationPeriod } from '../../../types';

export function useDashboardViewModel() {
  const {
    students,
    teachers,
    classes,
    attendanceRecords,
    registrationPeriod,
    updateRegistrationPeriod,
    notifications,
    addNotification
  } = useStore();

  const totalStudents = students.filter(s => s.status === 'active').length;
  const totalTeachers = teachers.filter(t => t.status === 'active').length;
  const totalClasses = classes.length;

  // Calculate average attendance rate
  const activeRecords = attendanceRecords;
  const totalRecordsCount = activeRecords.length;
  const presentCount = activeRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const attendanceRate = totalRecordsCount > 0 ? Math.round((presentCount / totalRecordsCount) * 100) : 100;

  // Create chart data for departments
  const departmentStats = teachers.reduce((acc: Record<string, number>, t) => {
    if (t.status === 'active') {
      acc[t.department] = (acc[t.department] || 0) + 1;
    }
    return acc;
  }, {});

  const teacherChartData = Object.entries(departmentStats).map(([name, value]) => ({
    name,
    value
  }));

  // Create attendance by day chart data
  const attendanceByClass = classes.map(cls => {
    const classRecords = attendanceRecords.filter(r => r.classId === cls.id);
    const totalClassRecs = classRecords.length;
    const presentClassRecs = classRecords.filter(r => r.status === 'present' || r.status === 'late').length;
    const rate = totalClassRecs > 0 ? Math.round((presentClassRecs / totalClassRecs) * 100) : 100;
    return {
      name: cls.id,
      rate
    };
  }).slice(0, 6);

  const handleUpdateRegistration = (startDate: string, endDate: string, isOpen: boolean) => {
    updateRegistrationPeriod({ startDate, endDate, isOpen });
  };

  const handleToggleRegistration = () => {
    updateRegistrationPeriod({
      ...registrationPeriod,
      isOpen: !registrationPeriod.isOpen
    });
  };

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalClasses,
      attendanceRate
    },
    registrationPeriod,
    updateRegistration: handleUpdateRegistration,
    toggleRegistration: handleToggleRegistration,
    teacherChartData,
    attendanceChartData: attendanceByClass,
    recentNotifications: notifications.slice(0, 4)
  };
}
