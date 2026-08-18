export interface Subject {
  id?: number;
  code: string;
  name: string;
  credits: number;
  departmentId?: number;
  departmentName?: string;
  majorId?: number;
  majorName?: string;
  semesterIndex?: number;
  type?: 'COMPULSORY' | 'ELECTIVE' | 'EQUIVALENT' | string;
  description?: string;
}

export interface SubjectRequest {
  code: string;
  name: string;
  credits: number;
  departmentId?: number;
  majorId?: number;
  semesterIndex?: number;
  type?: string;
  description?: string;
}
