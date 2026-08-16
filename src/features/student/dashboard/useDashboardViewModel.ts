import { useState, useEffect } from 'react';
import { studentApi } from '../../../api/services/studentApi';
import { Student } from '../../../models';
import { useStudentAcademicStats } from '../../../hooks/useStudentAcademicStats';

export function useDashboardViewModel(studentProfile: Student) {
  const [classesList, setClassesList] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [pendingAsmsCount, setPendingAsmsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const classesRes = await studentApi.getStudentClasses(0, 100);
        const classesData = (classesRes as any)?.content || [];
        setClassesList(classesData);

        const annRes = await studentApi.getStudentAnnouncements(0, 100);
        setAnnouncementsList((annRes as any)?.content || []);

        const gradesRes = await studentApi.getMyGrades(undefined, 0, 100);
        const gradesData = (gradesRes as any)?.content || [];
        setGradesList(gradesData);

        let totalPending = 0;
        for (const cls of classesData) {
          const asmRes = await studentApi.getAssignments(cls.id, 0, 100);
          const asms = (asmRes as any)?.content || [];
          const pending = asms.filter((a: any) => !a.submissionStatus);
          totalPending += pending.length;
        }
        setPendingAsmsCount(totalPending);

      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedGrades = gradesList.filter(g => g.finalScore !== null);
  const totalCredits = completedGrades.reduce((sum, g) => sum + (g.credits || 0), 0);
  
  const { cumulativeGpa } = useStudentAcademicStats(studentProfile.id, studentProfile.majorId);

  return {
    gpa: cumulativeGpa,
    accumulatedCredits: totalCredits,
    enrolledClassesCount: classesList.length,
    pendingAsmsCount,
    announcements: announcementsList,
    loading
  };
}
