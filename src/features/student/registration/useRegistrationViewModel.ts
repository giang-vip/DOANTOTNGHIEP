import { useState } from 'react';
import { useStore } from '../../../models/store';
import { Student, ClassSection } from '../../../types';
import { getConsistentStudentClasses } from '../../../utils/studentClassUtils';

export function useRegistrationViewModel(studentProfile: Student) {
  const {
    classes,
    registrationPeriod,
    enrollStudentInClass,
    dropStudentFromClass
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');

  // Check if current date is within the registration window or if status is open
  const isRegistrationWindowOpen = () => {
    // If registration is manually closed by admin, it's closed
    if (!registrationPeriod.isOpen) return false;

    // If there is no date range, and it is manually open, then it is open
    if (!registrationPeriod.startDate || !registrationPeriod.endDate) return true;

    // If there is a date range, today must be within that date range (inclusive of start and end days)
    const now = new Date();
    const start = new Date(registrationPeriod.startDate + 'T00:00:00');
    const end = new Date(registrationPeriod.endDate + 'T23:59:59');
    return now >= start && now <= end;
  };

  const isWindowActive = isRegistrationWindowOpen();

  // Enrolled class sections that also match the student's major
  const enrolledClasses = getConsistentStudentClasses(classes, studentProfile);

  // All available classes matching search and student's major
  const availableClasses = classes.filter((c) => {
    const classMatchesMajor = !studentProfile.majorId || !c.majorId || c.majorId === studentProfile.majorId;
    const matchesSearch = c.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    return classMatchesMajor && matchesSearch;
  });

  // Checks course prerequisites
  // For demonstration:
  // INT102 (Advanced Web) requires INT101 (Intro to IT)
  // MAT102 (Advanced Math) requires MAT101 (Calculus)
  const checkPrerequisites = (cls: ClassSection): { passed: boolean; message?: string } => {
    const subjId = cls.id.split('_')[0]; // e.g. "INT102" from "INT102_01"
    
    if (subjId === 'INT102') {
      const completedOrEnrolledIntro = enrolledClasses.some(c => c.id.startsWith('INT101'));
      if (!completedOrEnrolledIntro) {
        return {
          passed: false,
          message: 'Học phần nâng cao INT102 yêu cầu bạn phải đăng ký học phần tiên quyết INT101 trước!'
        };
      }
    }

    if (subjId === 'MAT102') {
      const completedOrEnrolledMath = enrolledClasses.some(c => c.id.startsWith('MAT101'));
      if (!completedOrEnrolledMath) {
        return {
          passed: false,
          message: 'Học phần nâng cao MAT102 yêu cầu bạn phải đăng ký học phần tiên quyết MAT101 trước!'
        };
      }
    }

    return { passed: true };
  };

  // Schedule conflict detection
  const checkScheduleConflict = (newCls: ClassSection): { conflict: boolean; message?: string } => {
    const conflict = enrolledClasses.find(c => {
      if (c.dayOfWeek !== newCls.dayOfWeek) return false;
      // Overlap calculation: max of starts <= min of ends
      const maxStart = Math.max(c.periodStart, newCls.periodStart);
      const minEnd = Math.min(c.periodEnd, newCls.periodEnd);
      return maxStart <= minEnd;
    });

    if (conflict) {
      return {
        conflict: true,
        message: `Trùng lịch học! Học phần này xung đột giờ lên lớp với học phần "${conflict.subjectName}" (Thứ ${conflict.dayOfWeek}, Tiết ${conflict.periodStart}-${conflict.periodEnd} vs Tiết ${newCls.periodStart}-${newCls.periodEnd}).`
      };
    }

    return { conflict: false };
  };

  const handleEnroll = (cls: ClassSection, onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!isWindowActive) {
      onError('Cổng đăng ký học phần hiện tại đang đóng!');
      return;
    }

    // Capacity Check
    const maxCap = cls.capacity || 40;
    if (cls.studentIds.length >= maxCap) {
      onError('Lớp học phần đã đạt sĩ số tối đa!');
      return;
    }

    // Prerequisite Check
    const preCheck = checkPrerequisites(cls);
    if (!preCheck.passed) {
      onError(preCheck.message || '');
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

    const success = enrollStudentInClass(studentProfile.id, cls.id);
    if (success) {
      onSuccess(`Đăng ký thành công lớp học phần "${cls.subjectName}"!`);
    } else {
      onError('Lỗi bất định khi đăng ký học phần.');
    }
  };

  const handleDrop = (cls: ClassSection, onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!isWindowActive) {
      onError('Không thể hủy đăng ký vì thời gian mở đăng ký đã khóa!');
      return;
    }

    const success = dropStudentFromClass(studentProfile.id, cls.id);
    if (success) {
      onSuccess(`Đã rút đăng ký học phần "${cls.subjectName}" thành công.`);
    } else {
      onError('Lỗi bất định khi hủy đăng ký.');
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
    checkScheduleConflict
  };
}
