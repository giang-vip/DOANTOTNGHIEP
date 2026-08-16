import { useState, useEffect } from 'react';
import { Student, ClassSection } from '../../../../models';
import { studentApi } from '../../../../api/services/studentApi';

export function useClassDetailViewModel(studentProfile: Student, selectedClass: ClassSection) {
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'attendance'>('materials');
  const [enrolledClasses, setEnrolledClasses] = useState<ClassSection[]>([]);
  
  // Pending dot map for assignments tab
  const [hasPendingAssignments, setHasPendingAssignments] = useState(false);
  const [hasOpenAttendance, setHasOpenAttendance] = useState(false);

  useEffect(() => {
    // Fetch enrolled classes to check if class is ended or ongoing
    studentApi.getStudentClasses(0, 100).then((res: any) => {
      setEnrolledClasses(res.content || []);
    }).catch(console.error);

    // Initial check for pending assignments
    studentApi.getAssignments(Number(selectedClass.id), 0, 100).then((res: any) => {
      const asms = res.content || [];
      setHasPendingAssignments(asms.some((a: any) => !a.submissionStatus));
    }).catch(console.error);

    // Initial check for open attendance sessions
    studentApi.getMyAttendance(Number(selectedClass.id)).then((res: any) => {
      const records = res || [];
      const hasOpen = records.some((r: any) => r.sessionStatus === 'OPEN' && r.status !== 'PRESENT');
      setHasOpenAttendance(hasOpen);
    }).catch(console.error);
  }, [selectedClass.id]);

  const refreshPendingState = async () => {
    try {
      const res = await studentApi.getAssignments(Number(selectedClass.id), 0, 100);
      const asms = (res as any)?.content || [];
      setHasPendingAssignments(asms.some((a: any) => !a.submissionStatus));
    } catch (err) {}
  };

  return {
    activeTab,
    setActiveTab,
    enrolledClasses,
    hasPendingAssignments,
    hasOpenAttendance,
    refreshPendingState
  };
}
