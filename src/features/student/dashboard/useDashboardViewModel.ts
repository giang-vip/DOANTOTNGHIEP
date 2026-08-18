import { useState, useEffect } from 'react';
import { studentApi } from '../../../api/services/studentApi';
import { adminApi } from '../../../api/services/adminApi';
import { Student } from '../../../models';
import { useStudentAcademicStats } from '../../../hooks/useStudentAcademicStats';

export function useDashboardViewModel(studentProfile: Student) {
  const [classesList, setClassesList] = useState<any[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<any[]>([]);
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [pendingAsmsCount, setPendingAsmsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Term info state
  const [currentSemesterName, setCurrentSemesterName] = useState<string>('Đang cập nhật');
  const [currentYearName, setCurrentYearName] = useState<string>('Đang cập nhật');

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

        // Fetch term info
        try {
          const [semesters, years] = await Promise.all([
            adminApi.getAllSemesters(),
            adminApi.getAllAcademicYears()
          ]);
          const currentSem = semesters.find(s => s.isCurrent) || semesters[0];
          if (currentSem) {
            setCurrentSemesterName(currentSem.name);
            const currentYear = years.find(y => String(y.id) === String(currentSem.academicYearId));
            if (currentYear) {
              setCurrentYearName(currentYear.code);
            }
          }
        } catch (termErr) {
          console.error('Không thể lấy thông tin kỳ học hiện tại:', termErr);
        }

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
  
  const { cumulativeGpa } = useStudentAcademicStats(String(studentProfile.id), String(studentProfile.majorId));

  return {
    gpa: cumulativeGpa,
    accumulatedCredits: totalCredits,
    enrolledClassesCount: classesList.length,
    pendingAsmsCount,
    announcements: announcementsList,
    loading,
    currentSemesterName,
    currentYearName
  };
}
