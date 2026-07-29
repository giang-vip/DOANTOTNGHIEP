import React, { useMemo, useState } from 'react';
import { useStore } from '../../../models/store';
import { Student, ClassSection, GradeRecord } from '../../../types';
import { getConsistentStudentClasses } from '../../../utils/studentClassUtils';
import { getDefaultColumnsConfig } from '../../teacher/grading/useGradingViewModel';
import {
  convertToLetterGrade,
  convertToGpa4,
  getAcademicClassification,
  getClassificationVariant,
  getSemesterByDate
} from '../../../utils/gradeUtils';
import { useStudentAcademicStats } from '../../../hooks/useStudentAcademicStats';

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
  const {
    classes,
    grades,
    attendanceSessions,
    attendanceRecords
  } = useStore();

  const [selectedSemester, setSelectedSemester] = useState<string>('Tất cả');

  // Find all classes this student is registered in
  const studentClasses = useMemo(() => {
    return getConsistentStudentClasses(classes, studentProfile);
  }, [classes, studentProfile.id, studentProfile.majorId]);

  // Compute detailed grade and attendance info for each class
  const allClassGrades = useMemo((): SubjectGradeInfo[] => {
    return studentClasses.map(cls => {
      // 1. Get semester
      const semester = getSemesterByDate(cls.startDate);

      // 2. Get columns configuration for this class
      const savedConfig = localStorage.getItem(`hn_grade_cols_config_${cls.id}`);
      const columnsConfig = savedConfig ? JSON.parse(savedConfig) : getDefaultColumnsConfig(4);

      // 3. Find Grade Record
      const gradeId = `${cls.id}_${studentProfile.id}`;
      const rec = grades.find(g => g.id === gradeId);

      // 4. Resolve score for each column
      const assessments = columnsConfig.map((col: any) => {
        let score: number | '' = '';
        if (rec?.scores && rec.scores[col.key] !== undefined) {
          score = rec.scores[col.key];
        } else {
          // Backward compatibility mappings
          if (col.key === 'col_0' && rec?.progressScore !== undefined) {
            score = rec.progressScore;
          } else if (col.key === 'col_1' && (rec as any)?.tx2Score !== undefined) {
            score = (rec as any).tx2Score;
          } else if (col.key === 'col_2' && rec?.midScore !== undefined) {
            score = rec.midScore;
          } else if (col.key === 'col_3' && rec?.endScore !== undefined) {
            score = rec.endScore;
          }
        }
        return {
          name: col.name,
          weight: col.weight,
          score
        };
      });

      // 5. Calculate dynamic final score (Điểm tổng kết hệ 10)
      let computedFinal = 0;
      let allFilled = true;
      assessments.forEach((ast: any) => {
        if (ast.score === undefined || ast.score === '') {
          allFilled = false;
        } else {
          computedFinal += ast.score * ast.weight;
        }
      });

      const final10 = allFilled ? Math.round(computedFinal * 10) / 10 : undefined;

      // 6. Quy đổi điểm chữ and điểm hệ 4
      const letterGrade = final10 !== undefined ? convertToLetterGrade(final10) : '—';
      const gpa4 = final10 !== undefined ? convertToGpa4(letterGrade) : undefined;

      // 7. Calculate attendance
      const classSessionsForThisClass = attendanceSessions.filter(s => s.classId === cls.id);
      const classSessionIds = classSessionsForThisClass.map(s => s.id);
      const studentRecords = attendanceRecords.filter(
        r => r.classId === cls.id && r.studentId === studentProfile.id && classSessionIds.includes(r.sessionId)
      );

      const present = studentRecords.filter(r => r.status === 'present').length;
      const late = studentRecords.filter(r => r.status === 'late').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const total = classSessionsForThisClass.length;

      const attendancePercent = total > 0
        ? Math.round(((present + late * 0.5) / total) * 100)
        : 100;

      return {
        classId: cls.id,
        subjectId: cls.subjectId,
        subjectName: cls.subjectName,
        credits: cls.credits,
        semester,
        teacherName: cls.teacherName,
        attendancePercent,
        attendanceCount: {
          present,
          late,
          absent,
          total
        },
        assessments,
        final10,
        letterGrade,
        gpa4
      };
    });
  }, [studentClasses, grades, attendanceSessions, attendanceRecords, studentProfile.id]);

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

  // Calculate overall GPA and total credits
  // GPA tích lũy đến thời điểm hiện tại: chỉ tính môn đã hoàn thành (all assessments filled)
  const stats = useStudentAcademicStats(studentProfile.id, studentProfile.majorId);

  // GPA per semester data for Recharts chart
  const semesterChartData = useMemo(() => {
    const semMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
    
    // Aggregate by semester
    allClassGrades.forEach(g => {
      if (g.final10 !== undefined && g.gpa4 !== undefined) {
        if (!semMap[g.semester]) {
          semMap[g.semester] = { totalPoints: 0, totalCredits: 0 };
        }
        semMap[g.semester].totalPoints += g.gpa4 * g.credits;
        semMap[g.semester].totalCredits += g.credits;
      }
    });

    // Format for charting
    return Object.keys(semMap).map(sem => {
      const data = semMap[sem];
      const gpa = data.totalCredits > 0 ? Math.round((data.totalPoints / data.totalCredits) * 100) / 100 : 0;
      return {
        name: sem.replace('Học kỳ ', 'HK '),
        gpa,
        credits: data.totalCredits
      };
    }).sort((a, b) => {
      // Quick sort by semester year / semester name
      return a.name.localeCompare(b.name);
    });
  }, [allClassGrades]);

  return {
    filteredClassGrades,
    semestersList,
    selectedSemester,
    setSelectedSemester,
    stats,
    semesterChartData
  };
}
