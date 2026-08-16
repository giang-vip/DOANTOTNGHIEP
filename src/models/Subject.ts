export interface Subject {
  id?: number;
  code: string;
  name: string;
  credits: number;
  departmentId?: number;
  departmentName?: string;
  description?: string;
}

export interface SubjectRequest {
  code: string;
  name: string;
  credits: number;
  departmentId?: number;
  description?: string;
}
