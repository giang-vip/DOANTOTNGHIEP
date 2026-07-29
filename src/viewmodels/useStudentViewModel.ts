/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useStore } from '../models/store';
import { getConsistentStudentClasses } from '../utils/studentClassUtils';
import {
  ClassSection,
  LearningMaterial,
  Assignment,
  Submission,
  GradeRecord,
  SystemNotification
} from '../types';

export function useStudentViewModel(studentId: string) {
  const store = useStore();

  const {
    classes,
    students,
    subjects,
    registrationPeriod,
    materials,
    assignments,
    quizQuestions,
    submissions,
    grades,
    notifications,
    enrollStudentInClass,
    dropStudentFromClass,
    addSubmission,
    saveQuizAnswers
  } = store;

  // 1. Get current student details
  const currentStudent = students.find(s => s.id === studentId);

  // 2. Get registered classes, filtered to remain consistent with the student's major
  const enrolledClasses = currentStudent
    ? getConsistentStudentClasses(classes, currentStudent)
    : classes.filter(c => c.studentIds.includes(studentId));

  // 3. Get list of available classes for registration
  const availableClasses = currentStudent
    ? classes.filter(c => !currentStudent.majorId || !c.majorId || c.majorId === currentStudent.majorId)
    : classes; // Display all for registration if student data is unavailable

  // 4. Check if registration is open
  const isRegistrationOpen = (): boolean => {
    if (!registrationPeriod.isOpen) return false;
    const now = new Date();
    const start = new Date(registrationPeriod.startDate);
    const end = new Date(registrationPeriod.endDate + 'T23:59:59');
    return now >= start && now <= end;
  };

  // 5. Enroll in a class with robust conflict checking!
  const registerClass = (classId: string): { success: boolean; message: string } => {
    if (!isRegistrationOpen()) {
      return { success: false, message: 'Thời gian đăng ký học phần chưa bắt đầu hoặc đã kết thúc.' };
    }

    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) {
      return { success: false, message: 'Lớp học phần không tồn tại.' };
    }

    // Check if already registered
    if (targetClass.studentIds.includes(studentId)) {
      return { success: false, message: 'Bạn đã đăng ký lớp học phần này rồi.' };
    }

    // Check capacity
    if (targetClass.studentIds.length >= targetClass.capacity) {
      return { success: false, message: 'Lớp học phần đã đủ sỹ số (đầy).' };
    }

    // Check schedule overlap conflict!
    // Format of target schedule: e.g., "Thứ Hai (07:00 - 09:30)" -> dayOfWeek is targetClass.dayOfWeek, timeSlot is targetClass.timeSlot
    const scheduleOverlap = enrolledClasses.some(c => {
      if (c.dayOfWeek !== targetClass.dayOfWeek) return false;
      
      // Parse timeSlot ranges "07:00 - 09:30"
      const parseMinutes = (timeStr: string) => {
        const [h, m] = timeStr.trim().split(':').map(Number);
        return h * 60 + m;
      };

      const [startTarget, endTarget] = targetClass.timeSlot.split('-').map(parseMinutes);
      const [startCurrent, endCurrent] = c.timeSlot.split('-').map(parseMinutes);

      // Overlap condition: startA < endB && startB < endA
      return startTarget < endCurrent && startCurrent < endTarget;
    });

    if (scheduleOverlap) {
      return {
        success: false,
        message: 'Trùng lịch học! Lớp học phần này bị trùng lịch với một môn học bạn đã đăng ký.'
      };
    }

    // Enroll
    const enrolled = enrollStudentInClass(studentId, classId);
    if (enrolled) {
      return { success: true, message: 'Đăng ký học phần thành công.' };
    }

    return { success: false, message: 'Không thể đăng ký học phần này.' };
  };

  // 6. Unregister from a class
  const unregisterClass = (classId: string): { success: boolean; message: string } => {
    if (!isRegistrationOpen()) {
      return { success: false, message: 'Thời gian hủy đăng ký học phần đã kết thúc.' };
    }

    const dropped = dropStudentFromClass(studentId, classId);
    if (dropped) {
      return { success: true, message: 'Hủy đăng ký học phần thành công.' };
    }
    return { success: false, message: 'Không thể hủy đăng ký lớp học phần này.' };
  };

  // 7. Get student notifications (global, for students, or targeted for registered classes)
  const getStudentNotifications = (): SystemNotification[] => {
    const enrolledClassIds = enrolledClasses.map(c => c.id);
    return notifications.filter(n => {
      if (n.recipientGroup === 'all') return true;
      if (n.recipientGroup === 'students') return true;
      if (n.recipientGroup === 'class' && n.classId && enrolledClassIds.includes(n.classId)) return true;
      return false;
    });
  };

  // 8. Get materials for enrolled classes
  const getEnrolledMaterials = (): LearningMaterial[] => {
    const enrolledClassIds = enrolledClasses.map(c => c.id);
    return materials.filter(m => enrolledClassIds.includes(m.classId));
  };

  // 9. Get assignments for enrolled classes
  const getEnrolledAssignments = (): Assignment[] => {
    const enrolledClassIds = enrolledClasses.map(c => c.id);
    return assignments.filter(a => enrolledClassIds.includes(a.classId));
  };

  // Get student's submission for an assignment
  const getStudentSubmission = (assignmentId: string): Submission | undefined => {
    return submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
  };

  const getQuizQuestionsForAssignment = (assignmentId: string) => {
    return quizQuestions.filter(q => q.assignmentId === assignmentId).sort((a, b) => a.order - b.order);
  };

  const submitQuizAnswers = (assignmentId: string, classId: string, answers: { questionId: string; selectedChoice: 'A' | 'B' | 'C' | 'D' | null }[]) => {
    addSubmission({
      assignmentId,
      classId,
      studentId,
      studentName: currentStudent?.name || 'Sinh viên',
      content: 'Bài trắc nghiệm',
      fileName: undefined,
      fileUrl: undefined
    });

    const savedSubmissions = JSON.parse(localStorage.getItem('hn_submissions') || '[]') as Submission[];
    const createdSubmission = savedSubmissions
      .filter((s: Submission) => s.assignmentId === assignmentId && s.studentId === studentId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

    if (createdSubmission) {
      saveQuizAnswers(createdSubmission.id, answers);
    }

    return createdSubmission;
  };

  // Submit an assignment
  const submitAssignmentForm = (assignmentId: string, classId: string, content: string, fileName?: string) => {
    const currentSub = getStudentSubmission(assignmentId);
    if (currentSub) {
      // Edit existing submission in local storage
      const savedSubs = JSON.parse(localStorage.getItem('hn_submissions') || '[]');
      const updatedSubs = savedSubs.map((s: Submission) => {
        if (s.id === currentSub.id) {
          return {
            ...s,
            content,
            fileName: fileName || s.fileName,
            submittedAt: new Date().toISOString()
          };
        }
        return s;
      });
      localStorage.setItem('hn_submissions', JSON.stringify(updatedSubs));
      // Trigger update via window reload or direct state update (done naturally since it re-reads storage or store state)
      // For now, reload window is easiest, or call store methods. Since store does not have updateSubmission, we can implement it or trigger via reload.
      // Let's reload window or just use standard refresh, let's trigger reload for local storage synchronization!
      window.location.reload();
    } else {
      addSubmission({
        assignmentId,
        classId,
        studentId,
        studentName: currentStudent?.name || 'Sinh viên',
        content,
        fileName,
        fileUrl: fileName ? '#' : undefined
      });
    }
  };

  // 10. Grade Card & GPA calculations
  const getGradesList = (): (GradeRecord & { className: string; credits: number })[] => {
    const classGrades: (GradeRecord & { className: string; credits: number })[] = [];
    
    enrolledClasses.forEach(cls => {
      const gRecord = grades.find(g => g.classId === cls.id && g.studentId === studentId);
      if (gRecord) {
        classGrades.push({
          ...gRecord,
          className: cls.subjectName,
          credits: cls.credits
        });
      }
    });

    return classGrades;
  };

  // Calculate cumulative GPA
  const calculateGPA = () => {
    const list = getGradesList();
    let totalPoints = 0;
    let totalWeightedCredits = 0;
    let totalEnrolledCredits = 0;

    const gradeToPoint = (score: number): number => {
      if (score >= 8.5) return 4.0; // A
      if (score >= 8.0) return 3.5; // B+
      if (score >= 7.0) return 3.0; // B
      if (score >= 6.5) return 2.5; // C+
      if (score >= 5.5) return 2.0; // C
      if (score >= 5.0) return 1.5; // D+
      if (score >= 4.0) return 1.0; // D
      return 0.0; // F
    };

    list.forEach(g => {
      // Calculate final score = 10% progress + 30% mid + 60% end
      const progress = g.progressScore ?? 0;
      const mid = g.midScore ?? 0;
      const end = g.endScore ?? 0;
      
      const finalScore = Math.round((progress * 0.1 + mid * 0.3 + end * 0.6) * 10) / 10;
      const point = gradeToPoint(finalScore);

      totalPoints += point * g.credits;
      totalWeightedCredits += g.credits;
      totalEnrolledCredits += g.credits;
    });

    const calculatedGPA = totalWeightedCredits > 0 ? Math.round((totalPoints / totalWeightedCredits) * 100) / 100 : currentStudent?.gpa || 0.0;
    const earnedCredits = list.filter(g => {
      const f = (g.progressScore ?? 0) * 0.1 + (g.midScore ?? 0) * 0.3 + (g.endScore ?? 0) * 0.6;
      return f >= 4.0;
    }).reduce((sum, g) => sum + g.credits, 0);

    return {
      gpa: calculatedGPA,
      totalCredits: earnedCredits > 0 ? earnedCredits : currentStudent?.totalCredits || 0
    };
  };

  return {
    currentStudent,
    enrolledClasses,
    availableClasses,
    registrationPeriod,
    isRegistrationOpen: isRegistrationOpen(),
    getStudentNotifications,
    getEnrolledMaterials,
    getEnrolledAssignments,
    getStudentSubmission,
    getQuizQuestionsForAssignment,
    submitQuizAnswers,

    registerClass,
    unregisterClass,
    submitAssignment: submitAssignmentForm,
    gradesList: getGradesList(),
    academicProgress: calculateGPA()
  };
}
