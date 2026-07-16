import { useMemo } from 'react';
import { useStore } from '../models/store';
import { convertToLetterGrade, convertToGpa4, getAcademicClassification, getClassificationVariant } from '../utils/gradeUtils';
import { getDefaultColumnsConfig } from '../features/teacher/grading/useGradingViewModel';

export function useStudentAcademicStats(studentId: string) {
  const { classes, grades } = useStore();

  const stats = useMemo(() => {
    // 1. Find all classes this student is registered in
    const studentClasses = classes.filter(c => c.studentIds.includes(studentId));

    let completedCredits = 0;
    let totalPoints = 0;
    let completedClassesCount = 0;

    studentClasses.forEach(cls => {
      // Get columns configuration for this class
      const savedConfig = localStorage.getItem(`hn_grade_cols_config_${cls.id}`);
      const columnsConfig = savedConfig ? JSON.parse(savedConfig) : getDefaultColumnsConfig(4);

      // Find Grade Record
      const gradeId = `${cls.id}_${studentId}`;
      const rec = grades.find(g => g.id === gradeId);

      // Resolve score for each column
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
          weight: col.weight,
          score
        };
      });

      // Calculate dynamic final score (Điểm tổng kết hệ 10)
      let computedFinal = 0;
      let allFilled = true;
      assessments.forEach((ast: any) => {
        if (ast.score === undefined || ast.score === '') {
          allFilled = false;
        } else {
          computedFinal += ast.score * ast.weight;
        }
      });

      if (allFilled) {
        const final10 = Math.round(computedFinal * 10) / 10;
        const letterGrade = convertToLetterGrade(final10);
        const gpa4 = convertToGpa4(letterGrade);

        completedCredits += cls.credits;
        totalPoints += gpa4 * cls.credits;
        completedClassesCount++;
      }
    });

    const cumulativeGpa = completedCredits > 0 ? Math.round((totalPoints / completedCredits) * 100) / 100 : 0.0;
    const classification = getAcademicClassification(cumulativeGpa);
    const classificationVariant = getClassificationVariant(cumulativeGpa);

    return {
      cumulativeGpa,
      totalCredits: completedCredits,
      classification,
      classificationVariant,
      completedCount: completedClassesCount,
      totalCount: studentClasses.length
    };
  }, [classes, grades, studentId]);

  return stats;
}
