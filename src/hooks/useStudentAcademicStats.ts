import { useState, useEffect } from 'react';
import { studentApi } from '../api/services/studentApi';
import { convertToLetterGrade, convertToGpa4, getAcademicClassification, getClassificationVariant } from '../utils/gradeUtils';

export function useStudentAcademicStats(studentId: string, studentMajorId?: string) {
  const [stats, setStats] = useState({
    cumulativeGpa: 0,
    totalCredits: 0,
    classification: 'Chưa xếp loại',
    classificationVariant: 'default' as any,
    completedCount: 0,
    totalCount: 0,
    loading: true
  });

  useEffect(() => {
    let isMounted = true;
    
    async function fetchStats() {
      try {
        const [classesRes, gradesRes] = await Promise.all([
          studentApi.getStudentClasses(0, 100),
          studentApi.getMyGrades(undefined, 0, 100)
        ]);

        if (!isMounted) return;

        const classes = (classesRes as any)?.content || [];
        const grades = (gradesRes as any)?.content || [];

        // 1. Find classes matching major (or all if no majorId)
        const studentClasses = classes.filter((c: any) => {
          const majorMatches = !studentMajorId || !c.majorId || c.majorId === studentMajorId;
          return majorMatches;
        });

        let completedCredits = 0;
        let totalPoints = 0;
        let completedClassesCount = 0;

        studentClasses.forEach((cls: any) => {
          // Find Grade Record
          const rec = grades.find((g: any) => String(g.classSectionId) === String(cls.id));

          // If final grade exists and is calculated
          if (rec && rec.finalScore !== null && rec.finalScore !== undefined) {
             const final10 = Number(rec.finalScore);
             const letterGrade = rec.finalGrade || convertToLetterGrade(final10);
             const gpa4 = convertToGpa4(letterGrade);

             completedCredits += (rec.credits || cls.credits || 3);
             totalPoints += gpa4 * (rec.credits || cls.credits || 3);
             completedClassesCount++;
          }
        });

        const cumulativeGpa = completedCredits > 0 ? Math.round((totalPoints / completedCredits) * 100) / 100 : 0.0;
        const classification = getAcademicClassification(cumulativeGpa);
        const classificationVariant = getClassificationVariant(cumulativeGpa);

        setStats({
          cumulativeGpa,
          totalCredits: completedCredits,
          classification,
          classificationVariant,
          completedCount: completedClassesCount,
          totalCount: studentClasses.length,
          loading: false
        });

      } catch (err) {
        console.error("Failed to load academic stats", err);
        if (isMounted) setStats(prev => ({ ...prev, loading: false }));
      }
    }

    fetchStats();

    return () => { isMounted = false; };
  }, [studentId, studentMajorId]);

  return stats;
}
