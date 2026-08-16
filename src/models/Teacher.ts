export interface Teacher {
  id?: number;
  userId?: number;
  username?: string;
  teacherCode: string;
  fullName: string;
  gender?: string;
  departmentId?: number;
  departmentName?: string;
  title?: string;
  status?: string;
  // UI extended properties from User mapping
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface TeacherRequest {
  userId?: number;
  teacherCode: string;
  fullName: string;
  gender?: string;
  departmentId?: number;
  title?: string;
  status?: string;
}
