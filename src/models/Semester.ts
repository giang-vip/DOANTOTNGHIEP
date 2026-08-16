export interface Semester {
  id: number;
  academicYearId: number;
  academicYearCode?: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SemesterRequest {
  academicYearId: number;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}
