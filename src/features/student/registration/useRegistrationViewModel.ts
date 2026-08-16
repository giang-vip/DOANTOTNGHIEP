import { useState, useEffect } from 'react';
import { studentApi } from '../../../api/services/studentApi';
import { Student, ClassSection } from '../../../models';

export function useRegistrationViewModel(studentProfile: Student) {
  const [registrationPeriod, setRegistrationPeriod] = useState<any>({ isOpen: false });
  const [availableClasses, setAvailableClasses] = useState<ClassSection[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassSection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Fake list of all subjects in the major for demonstration since BE lacks /student/subjects API
  const allMajorSubjectsMock = [
    { id: 101, name: 'Toán cao cấp 1' },
    { id: 102, name: 'Vật lý đại cương' },
    { id: 103, name: 'Lập trình C++' },
    { id: 104, name: 'Lập trình Java' },
    { id: 105, name: 'Cấu trúc dữ liệu và giải thuật' },
    { id: 106, name: 'Cơ sở dữ liệu' },
    { id: 107, name: 'Mạng máy tính' },
    { id: 108, name: 'Phát triển ứng dụng Web' },
    { id: 109, name: 'An toàn thông tin' },
    { id: 110, name: 'Đồ án tốt nghiệp' }
  ];

  // Group classes by subject, ensuring ALL major subjects are shown
  const groupedSubjects = allMajorSubjectsMock.map(subject => {
    const classes = availableClasses.filter(c => c.subjectName === subject.name || c.subjectId === subject.id);
    return {
      subjectId: subject.id,
      subjectName: subject.name,
      classes: classes
    };
  });

  // Include any other subjects that came from API but aren't in mock (just in case)
  availableClasses.forEach(cls => {
    if (!groupedSubjects.find(g => g.subjectId === cls.subjectId)) {
      groupedSubjects.push({
        subjectId: cls.subjectId,
        subjectName: cls.subjectName || 'Không xác định',
        classes: availableClasses.filter(c => c.subjectId === cls.subjectId)
      });
    }
  });

  const isRegistrationWindowOpen = () => {
    if (!registrationPeriod.isOpen) return false;
    if (!registrationPeriod.startDate || !registrationPeriod.endDate) return true;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(registrationPeriod.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(registrationPeriod.endDate);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
  };

  const isWindowActive = isRegistrationWindowOpen();

  const loadData = async () => {
    try {
      setLoading(true);
      // 1. Fetch current registration period
      let currentPeriod: any = { isOpen: false };
      try {
        const periodRes = await studentApi.getCurrentRegistrationPeriod();
        if (periodRes) {
          currentPeriod = (periodRes as any);
        }
      } catch (err) {
        console.warn('Lỗi lấy kỳ đăng ký hoặc không có kỳ đăng ký mở:', err);
      }
      setRegistrationPeriod(currentPeriod);

      // 2. Fetch available classes matching search
      const availableRes = await studentApi.getAvailableClasses(searchTerm, undefined, 0, 100);
      let availList = (availableRes as any)?.content || [];
      
      // Strict filtering by Major and Semester
      availList = availList.filter((cls: ClassSection) => {
        // Must belong to student's major
        if (studentProfile.majorId && cls.majorId && cls.majorId !== studentProfile.majorId) {
          return false;
        }
        // Must belong to the current registration semester (if known)
        if (currentPeriod.semesterId && cls.semesterId) {
          if (cls.semesterId !== currentPeriod.semesterId) return false;
        }
        return true;
      });
      
      setAvailableClasses(availList);

      // 3. Fetch enrolled classes
      const enrolledRes = await studentApi.getStudentClasses(0, 100);
      let enrolledList = (enrolledRes as any)?.content || [];
      // Lọc danh sách đăng ký: Chỉ hiển thị môn của kỳ đăng ký hiện tại
      if (currentPeriod.semesterId) {
        enrolledList = enrolledList.filter((c: any) => c.semesterId === currentPeriod.semesterId);
      }
      setEnrolledClasses(enrolledList);

    } catch (err) {
      console.error('Lỗi khi tải dữ liệu đăng ký môn:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  // Schedule conflict detection (Local validation for smooth UX, backed by BE checks)
  const checkScheduleConflict = (newCls: ClassSection): { conflict: boolean; message?: string } => {
    const conflict = enrolledClasses.find(c => {
      if (c.weekday !== newCls.weekday) return false;
      
      // Date range overlap check
      if (c.startDate && c.endDate && newCls.startDate && newCls.endDate) {
        const start1 = new Date(c.startDate).getTime();
        const end1 = new Date(c.endDate).getTime();
        const start2 = new Date(newCls.startDate).getTime();
        const end2 = new Date(newCls.endDate).getTime();
        
        const maxStart = Math.max(start1, start2);
        const minEnd = Math.min(end1, end2);
        if (maxStart > minEnd) return false; // No overlap in dates
      }

      // Time slot overlap check
      if (c.startTime && c.endTime && newCls.startTime && newCls.endTime) {
        const timeToSec = (tStr: string) => {
          const [h, m] = tStr.split(':').map(Number);
          return h * 3600 + m * 60;
        };
        const start1 = timeToSec(c.startTime);
        const end1 = timeToSec(c.endTime);
        const start2 = timeToSec(newCls.startTime);
        const end2 = timeToSec(newCls.endTime);
        
        const maxStart = Math.max(start1, start2);
        const minEnd = Math.min(end1, end2);
        return maxStart < minEnd; // Overlap in time slots
      }

      return false;
    });

    if (conflict) {
      return {
        conflict: true,
        message: `Trùng lịch học! Học phần này xung đột giờ lên lớp với học phần "${conflict.subjectName}" (Thứ ${conflict.weekday}, ${conflict.startTime}-${conflict.endTime}).`
      };
    }

    return { conflict: false };
  };

  const handleEnroll = async (cls: ClassSection, onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!isWindowActive) {
      onError('Cổng đăng ký học phần hiện tại đang đóng!');
      return;
    }

    // Capacity Check
    const maxCap = cls.capacity || 40;
    if (cls.studentIds && cls.studentIds.length >= maxCap) {
      onError('Lớp học phần đã đạt sĩ số tối đa!');
      return;
    }

    // Major membership check
    if (studentProfile.majorId && cls.majorId && studentProfile.majorId !== cls.majorId) {
      onError('Không thể đăng ký lớp này vì nó không thuộc ngành của bạn.');
      return;
    }

    // Schedule conflict Check
    const scheduleCheck = checkScheduleConflict(cls);
    if (scheduleCheck.conflict) {
      onError(scheduleCheck.message || '');
      return;
    }

    try {
      await studentApi.enrollClass(Number(cls.id));
      await loadData();
      window.dispatchEvent(new CustomEvent('REFRESH_STUDENT_DATA'));
      onSuccess(`Đăng ký thành công lớp học phần "${cls.subjectName}"!`);
    } catch (err: any) {
      console.error('Lỗi đăng ký học phần:', err);
      onError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.');
    }
  };

  const handleDrop = async (cls: ClassSection, onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!isWindowActive) {
      onError('Không thể hủy đăng ký vì thời gian mở đăng ký đã khóa!');
      return;
    }

    if (!cls.id) {
      onError('Không tìm thấy mã lớp học phần để hủy.');
      return;
    }

    try {
      await studentApi.dropClass(Number(cls.id));
      await loadData();
      window.dispatchEvent(new CustomEvent('REFRESH_STUDENT_DATA'));
      onSuccess(`Đã rút đăng ký học phần "${cls.subjectName}" thành công.`);
    } catch (err: any) {
      console.error('Lỗi hủy đăng ký học phần:', err);
      onError(err.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký.');
    }
  };

  return {
    registrationPeriod,
    isWindowActive,
    availableClasses,
    enrolledClasses,
    searchTerm,
    setSearchTerm,
    handleEnroll,
    handleDrop,
    checkScheduleConflict,
    loading,
    groupedSubjects
  };
}
