import React, { useMemo, useState, useEffect } from 'react';
import { studentApi } from '../../../api/services/studentApi';
import { adminApi } from '../../../api/services/adminApi';
import { Student } from '../../../models';
import {
  convertToLetterGrade,
  convertToGpa4,
  getAcademicClassification
} from '../../../utils/gradeUtils';

export interface SubjectGradeInfo {
  classId: string;
  subjectId: string;
  subjectName: string;
  credits: number;
  semester: string;
  teacherName: string;
  attendancePercent: number;
  attendanceCount: {
    present: number;
    late: number;
    absent: number;
    total: number;
  };
  assessments: Array<{
    name: string;
    weight: number;
    score: number | '';
  }>;
  final10: number | undefined;
  letterGrade: string;
  gpa4: number | undefined;
}

export function useAcademicProgressViewModel(studentProfile: Student) {
  const [selectedSemester, setSelectedSemester] = useState<string>('Tất cả');
  const [gradesList, setGradesList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTermIndex, setCurrentTermIndex] = useState<number | null>(null);
  const [currentTermText, setCurrentTermText] = useState<string>('Đang cập nhật');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load grades list
        const gradesRes = await studentApi.getMyGrades(undefined, 0, 100);
        setGradesList((gradesRes as any)?.content || []);

        // Load classes list to get custom weights
        const classesRes = await studentApi.getStudentClasses(0, 100);
        setClassesList((classesRes as any)?.content || []);
        
        // Fetch term info
        try {
          const [semesters, years] = await Promise.all([
            adminApi.getAllSemesters(),
            adminApi.getAllAcademicYears()
          ]);
          const currentSem = semesters.find(s => s.isCurrent) || semesters[0];
          if (currentSem) {
            const currentYear = years.find(y => String(y.id) === String(currentSem.academicYearId));
            if (currentYear && studentProfile.entryStartYear) {
              const currentStartYear = (currentYear as any).startYear || parseInt(currentYear.code.substring(0, 4));
              const entryStartYear = studentProfile.entryStartYear;
              const diffYears = currentStartYear - entryStartYear;
              
              let semOffset = 1;
              if (currentSem.name.toLowerCase().includes('2') || currentSem.name.toLowerCase().includes('ii')) {
                 semOffset = 2;
              } else if (currentSem.name.toLowerCase().includes('3') || currentSem.name.toLowerCase().includes('hè')) {
                 semOffset = 3;
              }
              
              const termIndex = (diffYears * 2) + semOffset;
              setCurrentTermIndex(termIndex > 0 ? termIndex : 1);
              setCurrentTermText(`(Năm ${diffYears + 1}, ${currentSem.name})`);
            }
          }
        } catch (termErr) {
          console.error('Không thể lấy thông tin kỳ học hiện tại:', termErr);
        }
      } catch (err) {
        console.error('Lỗi khi tải bảng điểm:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute detailed grade and attendance info for each class
  const allClassGrades = useMemo((): SubjectGradeInfo[] => {
    return gradesList.map(g => {
      // Find class info to resolve custom weights and teacher name
      const cls = classesList.find(c => String(c.id) === String(g.classSectionId));
      
      const attW = cls?.attendanceWeight !== undefined && cls.attendanceWeight !== null ? cls.attendanceWeight : 10;
      const midW = cls?.midtermWeight !== undefined && cls.midtermWeight !== null ? cls.midtermWeight : 30;
      const finW = cls?.finalWeight !== undefined && cls.finalWeight !== null ? cls.finalWeight : 60;
      const teacher = cls?.teacherName || 'Giảng viên';

      const assessments = [
        {
          name: 'Chuyên Cần',
          weight: attW as number,
          score: (g.attendanceScore !== null ? Number(g.attendanceScore) : '') as number | ''
        },
        {
          name: 'Giữa Kỳ',
          weight: midW as number,
          score: (g.midtermScore !== null ? Number(g.midtermScore) : '') as number | ''
        },
        {
          name: 'Cuối Kỳ',
          weight: finW as number,
          score: (g.finalExamScore !== null ? Number(g.finalExamScore) : '') as number | ''
        }
      ];

      // Final Score 10-scale
      const final10 = g.finalScore !== null ? Number(g.finalScore) : undefined;
      const letterGrade = g.finalGrade || (final10 !== undefined ? convertToLetterGrade(final10) : '—');
      const gpa4 = final10 !== undefined ? convertToGpa4(letterGrade) : undefined;

      const attendanceScoreNum = g.attendanceScore !== null ? Number(g.attendanceScore) : 10;
      const attendancePercent = Math.round(attendanceScoreNum * 10);

      return {
        classId: String(g.classSectionId),
        subjectId: g.subjectCode,
        subjectName: g.subjectName,
        credits: g.credits || 0,
        semester: g.semesterName || 'Học kỳ',
        teacherName: teacher,
        attendancePercent,
        attendanceCount: {
          present: attendancePercent >= 80 ? 4 : 3,
          late: 0,
          absent: attendancePercent < 80 ? 1 : 0,
          total: 4
        },
        assessments,
        final10,
        letterGrade,
        gpa4
      };
    });
  }, [gradesList, classesList]);

  // List of unique semesters for filtering
  const semestersList = useMemo(() => {
    const list = new Set<string>();
    allClassGrades.forEach(g => {
      if (g.semester) list.add(g.semester);
    });
    return ['Tất cả', ...Array.from(list)];
  }, [allClassGrades]);

  // Filtered class grades based on semester selection
  const filteredClassGrades = useMemo(() => {
    if (selectedSemester === 'Tất cả') {
      return allClassGrades;
    }
    return allClassGrades.filter(g => g.semester === selectedSemester);
  }, [allClassGrades, selectedSemester]);

  // Overall stats
  const stats = useMemo(() => {
    const completed = allClassGrades.filter(g => g.final10 !== undefined && g.gpa4 !== undefined);
    const totalCredits = completed.reduce((sum, g) => sum + g.credits, 0);
    const weightedSum = completed.reduce((sum, g) => sum + (g.gpa4! * g.credits), 0);
    const cumulativeGpa = totalCredits > 0 ? Math.round((weightedSum / totalCredits) * 100) / 100 : 0.0;
    
    // Average 10-scale grade
    const weightedSum10 = completed.reduce((sum, g) => sum + (g.final10! * g.credits), 0);
    const cumulativeGpa10 = totalCredits > 0 ? Math.round((weightedSum10 / totalCredits) * 100) / 100 : 0.0;

    const classification = getAcademicClassification(cumulativeGpa);

    return {
      cumulativeGpa,
      cumulativeGpa10,
      totalCredits,
      classification,
      classificationVariant: (cumulativeGpa >= 3.2 ? 'success' : cumulativeGpa >= 2.5 ? 'info' : cumulativeGpa >= 2.0 ? 'warning' : 'danger') as "success" | "info" | "warning" | "danger" | "gray",
      totalCount: allClassGrades.length,
      completedCount: completed.length
    };
  }, [allClassGrades]);

  // GPA per semester data for Recharts chart
  const semesterChartData = useMemo(() => {
    const semMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
    
    allClassGrades.forEach(g => {
      if (g.final10 !== undefined && g.gpa4 !== undefined) {
        if (!semMap[g.semester]) {
          semMap[g.semester] = { totalPoints: 0, totalCredits: 0 };
        }
        semMap[g.semester].totalPoints += g.gpa4 * g.credits;
        semMap[g.semester].totalCredits += g.credits;
      }
    });

    return Object.keys(semMap).map(sem => {
      const data = semMap[sem];
      const gpa = data.totalCredits > 0 ? Math.round((data.totalPoints / data.totalCredits) * 100) / 100 : 0;
      
      // Calculate sort order based on year and semester
      // Example: "Học kỳ 1 năm học 2022-2023" -> year = 2022, semester = 1
      let sortOrder = 0;
      const match = sem.match(/(?:Học kỳ|HK|Kỳ)\s*(\d+).*?(\d{4})/i);
      if (match) {
        const semester = parseInt(match[1], 10);
        const year = parseInt(match[2], 10);
        sortOrder = year * 10 + semester;
      }

      return {
        name: sem.replace('Học kỳ ', 'HK '),
        gpa,
        credits: data.totalCredits,
        sortOrder
      };
    }).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [allClassGrades]);

  return {
    filteredClassGrades,
    semestersList,
    selectedSemester,
    setSelectedSemester,
    stats,
    currentTermIndex,
    currentTermText,
    semesterChartData,
    loading
  };
}
