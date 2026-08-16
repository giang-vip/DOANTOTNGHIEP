export interface AcademicYear {
  id: number;
  code: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface AcademicYearRequest {
  code: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}
