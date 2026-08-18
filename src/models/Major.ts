export interface Major {
  id?: number;
  departmentId: number;
  departmentName?: string;
  code: string;
  name: string;
  description?: string;
  totalCredits?: number;
  status?: string;
  subjectCount?: number;
  createdAt?: string;
}

export interface MajorRequest {
  departmentId: number;
  code: string;
  name: string;
  description?: string;
  totalCredits?: number;
  status?: string;
}
