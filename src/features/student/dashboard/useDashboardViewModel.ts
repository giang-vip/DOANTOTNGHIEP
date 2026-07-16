import { useState } from 'react';
import { useStore } from '../../../models/store';
import { Student } from '../../../types';
import { useStudentAcademicStats } from '../../../hooks/useStudentAcademicStats';

export function useDashboardViewModel(studentProfile: Student) {
  const { classes, assignments, submissions, notifications } = useStore();
  const { cumulativeGpa } = useStudentAcademicStats(studentProfile.id);

  // Enrolled classes
  const enrolledClasses = classes.filter(c => c.studentIds.includes(studentProfile.id));

  // Accumulated credits
  const totalCredits = enrolledClasses.reduce((sum, c) => sum + c.credits, 0);

  // Filter homework assignments for enrolled classes
  const enrolledClassIds = enrolledClasses.map(c => c.id);
  const classAssignments = assignments.filter(a => enrolledClassIds.includes(a.classId));

  // Determine which are pending (not yet submitted)
  const studentSubmissions = submissions.filter(s => s.studentId === studentProfile.id);
  const submittedAsmIds = studentSubmissions.map(s => s.assignmentId);
  const pendingAssignments = classAssignments.filter(a => !submittedAsmIds.includes(a.id));

  // Filter school/class announcements targeting 'all' or this student's specific class IDs
  const feedAnnouncements = notifications.filter(
    n => n.recipientGroup === 'all' || (n.recipientGroup === 'class' && enrolledClassIds.includes(n.classId || ''))
  );

  return {
    gpa: cumulativeGpa,
    accumulatedCredits: totalCredits,
    enrolledClassesCount: enrolledClasses.length,
    pendingAsmsCount: pendingAssignments.length,
    announcements: feedAnnouncements
  };
}
