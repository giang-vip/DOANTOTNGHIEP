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
  // UI extended properties from User mapping
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gpa?: number;
  totalCredits?: number;
  facePhotos?: string[];
  majorTotalCredits?: number;
  entryStartYear?: number;
  schoolClass?: {
    name?: string;
    majorName?: string;
    departmentName?: string;
    courseYear?: string;
  };
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
