import { useState, useEffect } from 'react';
import { studentApi } from '../../../../api/services/studentApi';
import { ClassSection, Student } from '../../../../models';

export function useClassSelectionViewModel(studentProfile: Student) {
  const [enrolledClasses, setEnrolledClasses] = useState<ClassSection[]>([]);
  const [classPendingMap, setClassPendingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await studentApi.getStudentClasses(0, 100);
        const classes = (res as any)?.content || [];
        setEnrolledClasses(classes);

        // Fetch pending assignments for all classes concurrently
        const pendingMap: Record<string, boolean> = {};
        await Promise.all(
          classes.map(async (cls: ClassSection) => {
            try {
              const asmsRes = await studentApi.getAssignments(Number(cls.id), 0, 100);
              const asms = (asmsRes as any)?.content || [];
              const hasPending = asms.some((a: any) => !a.submissionStatus);
              pendingMap[String(cls.id)] = hasPending;
            } catch (err) {
              pendingMap[String(cls.id)] = false;
            }
          })
        );
        setClassPendingMap(pendingMap);
      } catch (err) {
        console.error('Error fetching student classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    window.addEventListener('REFRESH_STUDENT_DATA', fetchData);
    return () => window.removeEventListener('REFRESH_STUDENT_DATA', fetchData);
  }, [studentProfile.id]);

  return {
    enrolledClasses,
    classPendingMap,
    loading
  };
}
