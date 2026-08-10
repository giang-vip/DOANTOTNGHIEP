export interface Student {
  id?: number;
  userId: number;
  username?: string;
  studentCode: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  majorId: number;
  majorName?: string;
  classId?: number;
  classCode?: string;
  status?: string;
}

export interface StudentRequest {
  userId: number;
  studentCode: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  majorId: number;
  classId?: number;
  status?: string;
}
