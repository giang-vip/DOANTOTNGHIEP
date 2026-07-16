/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string; // userId
  username: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface Student {
  id: string; // MSSV, e.g. SV001
  userId: string;
  name: string;
  email: string;
  classCode: string; // e.g. K64-CNTT
  phone: string;
  status: 'active' | 'suspended';
  birthDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  gpa: number;
  totalCredits: number;
  avatar?: string;
  facePhotos?: string[];
}

export interface Teacher {
  id: string; // MSGV, e.g. GV001
  userId: string;
  name: string;
  email: string;
  department: string; // Khoa, e.g. Công nghệ thông tin
  phone: string;
  status: 'active' | 'suspended';
  avatar?: string;
}

export interface Department {
  id: string; // MaKhoa, e.g. CNTT
  name: string;
  description: string;
}

export interface Subject {
  id: string; // MaMH, e.g. INT1001
  name: string;
  credits: number;
  department: string;
}

export interface ClassSection {
  id: string; // MaLHP, e.g. LHP001
  subjectId: string;
  subjectName: string;
  credits: number;
  teacherId: string; // MSGV
  teacherName: string;
  schedule: string; // e.g. "Thứ Hai (07:00 - 09:30)"
  dayOfWeek: number; // 2 = Monday, 3 = Tuesday, ..., 8 = Sunday
  timeSlot: string; // e.g. "07:00 - 09:30"
  room: string;
  capacity: number;
  studentIds: string[]; // MSSVs in class
  startDate: string; // e.g. "YYYY-MM-DD"
  endDate: string; // e.g. "YYYY-MM-DD"
  periodStart: number;
  periodEnd: number;
}

export interface RegistrationPeriod {
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "Buổi 1"
  status: 'open' | 'closed';
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  noted?: string;
  updatedAt: string;
}

export interface LearningMaterial {
  id: string;
  classId: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'video';
  url: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  description?: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DDTHH:mm
  maxPoints: number;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  classId: string;
  studentId: string;
  studentName: string;
  content: string; // Text answer or notes
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface GradeRecord {
  id: string; // classId + "_" + studentId
  classId: string;
  studentId: string;
  studentName: string;
  progressScore?: number; // Điểm chuyên cần (10%)
  midScore?: number;      // Điểm giữa kỳ (30%)
  endScore?: number;      // Điểm cuối kỳ (60%)
  scores?: Record<string, number>; // Flexible scores for dynamic columns configuration
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  recipientGroup: 'all' | 'teachers' | 'students' | 'class';
  classId?: string; // Optional if targeted to class
  sender: string; // e.g. "Phòng Đào Tạo" or Teacher's Name
  createdAt: string;
}
