/**
 * Utility functions for grade conversions and academic calculations
 * Reusable globally for academic reports and student views
 */

export function convertToLetterGrade(score: number): string {
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'D+';
  if (score >= 4.0) return 'D';
  return 'F';
}

export function convertToGpa4(letter: string): number {
  switch (letter) {
    case 'A': return 4.0;
    case 'B+': return 3.5;
    case 'B': return 3.0;
    case 'C+': return 2.5;
    case 'C': return 2.0;
    case 'D+': return 1.5;
    case 'D': return 1.0;
    case 'F': return 0.0;
    default: return 0.0;
  }
}

export function getAcademicClassification(gpa: number): string {
  if (gpa >= 3.6) return 'Xuất sắc';
  if (gpa >= 3.2) return 'Giỏi';
  if (gpa >= 2.5) return 'Khá';
  if (gpa >= 2.0) return 'Trung bình';
  if (gpa >= 1.0) return 'Yếu';
  return 'Kém';
}

export function getClassificationVariant(gpa: number): 'success' | 'info' | 'warning' | 'danger' {
  if (gpa >= 3.2) return 'success'; // Xuất sắc, Giỏi
  if (gpa >= 2.5) return 'info';    // Khá
  if (gpa >= 2.0) return 'warning'; // Trung bình
  return 'danger';                  // Yếu, Kém
}

export function getSemesterByDate(startDate: string): string {
  if (!startDate) return 'Học kỳ Hè (2025-2026)';
  const month = parseInt(startDate.split('-')[1] || '6', 10);
  if (month >= 1 && month <= 5) {
    return 'Học kỳ II (2025-2026)';
  } else if (month >= 6 && month <= 8) {
    return 'Học kỳ Hè (2025-2026)';
  } else {
    return 'Học kỳ I (2026-2027)';
  }
}
