import { useState, useEffect } from 'react';
import { studentApi } from '../../../api/services/studentApi';
import { Student, ClassSection } from '../../../models';

export function useRegistrationViewModel(studentProfile: Student) {
  const [registrationPeriod, setRegistrationPeriod] = useState<any>({ isOpen: false });
  const [availableClasses, setAvailableClasses] = useState<ClassSection[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassSection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<number | 'ALL'>('ALL');
  const [subjectTypeFilter, setSubjectTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const getFilteredCurriculum = () => {
    let filtered = availableClasses;
    
    // B1. Khởi tạo danh sách môn học từ Khung chương trình (Curriculum)
    const subjectsMap: Record<number, any> = {};
    
    curriculum.forEach(subj => {
      subjectsMap[subj.subjectId] = {
        subjectId: subj.subjectId,
        subjectCode: subj.subjectCode,
        subjectName: subj.subjectName,
        credits: subj.credits,
        semesterIndex: subj.semesterIndex || 1,
        type: subj.subjectType || 'COMPULSORY',
        classes: []
      };
    });

    // B2. Ánh xạ các lớp học đang mở vào danh sách môn học (chỉ map vào những môn có trong Khung chương trình)
    filtered.forEach(cls => {
      if (subjectsMap[cls.subjectId]) {
        subjectsMap[cls.subjectId].classes.push(cls);
      }
    });

    // B3. Convert sang Flat Array
    let flatList = Object.values(subjectsMap);

    // B4. Lọc
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      flatList = flatList.filter(subj => 
        subj.subjectName?.toLowerCase().includes(lowerSearch) || 
        subj.subjectCode?.toLowerCase().includes(lowerSearch) ||
        subj.classes.some((c: any) => c.sectionCode.toLowerCase().includes(lowerSearch))
      );
    }

    if (subjectTypeFilter) {
      flatList = flatList.filter(subj => subj.type === subjectTypeFilter);
    }

    if (semesterFilter !== 'ALL') {
      flatList = flatList.filter(subj => subj.semesterIndex === semesterFilter);
    }

    // B5. Sắp xếp theo học kỳ tăng dần, rồi đến loại môn, rồi đến tên môn
    flatList.sort((a, b) => {
      if (a.semesterIndex !== b.semesterIndex) {
        return a.semesterIndex - b.semesterIndex;
      }
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }
      return (a.subjectName || '').localeCompare(b.subjectName || '');
    });

    return flatList;
  };

  const filteredCurriculum = getFilteredCurriculum();

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

      // 2. Fetch student curriculum
      let currList: any[] = [];
      try {
        const currRes = await studentApi.getStudentCurriculum();
        currList = (currRes as any) || [];
        setCurriculum(currList);
      } catch (err) {
        console.warn('Lỗi lấy khung chương trình:', err);
      }

      // 3. Fetch available classes matching search
      const availableRes = await studentApi.getAvailableClasses('', undefined, 0, 100);
      let availList = (availableRes as any)?.content || [];
      
      // Strict filtering by Semester (Major/Dept is already filtered by backend)
      availList = availList.filter((cls: ClassSection) => {
        if (currentPeriod.semesterId && cls.semesterId) {
          if (cls.semesterId !== currentPeriod.semesterId) return false;
        }
        return true;
      });
      
      setAvailableClasses(availList);

      // 4. Fetch enrolled classes
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
  }, []);

  const checkScheduleConflict = (newCls: ClassSection): { conflict: boolean; message?: string } => {
    const conflict = enrolledClasses.find(c => {
      if (c.weekday !== newCls.weekday) return false;
      
      if (c.startDate && c.endDate && newCls.startDate && newCls.endDate) {
        const start1 = new Date(c.startDate).getTime();
        const end1 = new Date(c.endDate).getTime();
        const start2 = new Date(newCls.startDate).getTime();
        const end2 = new Date(newCls.endDate).getTime();
        
        const maxStart = Math.max(start1, start2);
        const minEnd = Math.min(end1, end2);
        if (maxStart > minEnd) return false; 
      }

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
        return maxStart < minEnd; 
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

    const maxCap = cls.capacity || 40;
    if ((cls as any).studentIds && (cls as any).studentIds.length >= maxCap) {
      onError('Lớp học phần đã đạt sĩ số tối đa!');
      return;
    }

    if (studentProfile.majorId && cls.majorId && studentProfile.majorId !== cls.majorId) {
      onError('Không thể đăng ký lớp này vì nó không thuộc ngành của bạn.');
      return;
    }

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
      onError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.');
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
      onError(err.message || err.response?.data?.message || 'Có lỗi xảy ra khi hủy đăng ký.');
    }
  };

  return {
    registrationPeriod,
    isWindowActive,
    filteredCurriculum,
    availableClasses,
    enrolledClasses,
    searchTerm,
    setSearchTerm,
    handleEnroll,
    handleDrop,
    checkScheduleConflict,
    loading,
    setSemesterFilter,
    semesterFilter,
    subjectTypeFilter,
    setSubjectTypeFilter
  };
}
