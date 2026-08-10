export interface Enrollment {
  id?: number;
  studentId: number;
  studentCode?: string;
  studentName?: string;
  classSectionId: number;
  sectionCode?: string;
  enrolledAt?: string;
  status?: string;
  note?: string;
}

export interface EnrollmentRequest {
  studentId: number;
  classSectionId: number;
  note?: string;
  status?: string;
}
