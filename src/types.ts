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

export type StudentStatus = 'active' | 'on_leave' | 'dropped_out' | 'graduated' | 'suspended';

export interface Student {
  id: string; // MSSV, e.g. SV001
  userId: string;
  name: string;
  email: string;
  classCode: string; // e.g. K64-CNTT (administrative class code)
  phone: string;
  status: StudentStatus;
  birthDate: string;
  gender: 'Nam' | 'Nữ' | 'Khác';
  gpa: number;
  totalCredits: number;
  avatar?: string;
  facePhotos?: string[];
  // Major that the student is enrolled in (code of major, e.g. KTPM)
  majorId?: string;
}

export type TeacherStatus = 'active' | 'on_leave' | 'suspended';

export interface Teacher {
  id: string; // MSGV, e.g. GV001
  userId: string;
  name: string;
  email: string;
  department: string; // Khoa, e.g. Công nghệ thông tin
  phone: string;
  status: TeacherStatus;
  avatar?: string;
}

export interface Department {
  id: string; // MaKhoa, e.g. CNTT
  name: string;
  description: string;
}

export interface Major {
  id: string; // MaNganh, e.g. KTPM
  name: string;
  departmentId: string; // MaKhoa where this major belongs
  description?: string;
  status?: 'active' | 'inactive';
}

export interface Subject {
  id: string; // MaMH, e.g. INT1001
  name: string;
  credits: number;
  // Historically subjects had department; keep optional for compatibility
  department?: string;
  // List of major ids that this subject applies to (many-to-many)
  majorIds?: string[];
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
  periodStart?: number;
  periodEnd?: number;
  // Administrative class/major context: optional major assigned for the section (helps filtering by major)
  majorId?: string;
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
  method?: 'manual' | 'gps' | 'face';
  faceMatchConfidence?: number;
  faceMatchStatus?: 'not_applicable' | 'pending' | 'matched' | 'not_matched';
}

export interface LearningMaterial {
  id: string;
  classId: string;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'video' | 'image';
  url: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  description?: string;
}

/**
 * Bài tập trong hệ thống. Bản prototype giữ nguyên luồng tự luận cũ
 * và mở rộng thêm loại trắc nghiệm theo mô hình 1 file đề chung.
 * Dữ liệu này tương ứng với bảng assignments trong CSDL thật.
 */
export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DDTHH:mm
  maxPoints: number; // với type='quiz': LUÔN là 10 (thang điểm cố định)
  createdAt: string;

  /** Loại bài tập. Nếu không set thì mặc định coi như essay để giữ hành vi cũ. */
  type?: 'essay' | 'quiz';

  /** Đường dẫn file đề gốc do GV upload, dùng cho bài quiz 1 file chung. */
  examFileUrl?: string;
  /** Tên file đề gốc để hiển thị ở UI và lưu log. */
  examFileName?: string;
  /** Loại file đề, quyết định dùng PDF viewer hay ảnh viewer ở FE. */
  examFileType?: 'pdf' | 'image';
  /** Tổng số câu hỏi do GV nhập khi soạn đề, dùng để tạo khung câu hỏi. */
  questionCount?: number;
}

/**
 * Một câu hỏi trong đề quiz. Vì đề nằm chung trong 1 file examFileUrl ở Assignment,
 * bảng này chỉ lưu đáp án đúng, điểm câu, giải thích lý thuyết và các text tuỳ chọn.
 * Dữ liệu này tương ứng với bảng quiz_questions trong CSDL thật.
 */
export interface QuizQuestion {
  id: string;
  assignmentId: string;
  /** Thứ tự câu hỏi trong đề, dùng để hiển thị Câu 1, Câu 2... trên FE. */
  order: number;
  /** Đáp án đúng do GV tick khi soạn đề, dùng để tự động chấm bài. */
  correctChoice: 'A' | 'B' | 'C' | 'D';
  /** Điểm của riêng câu hỏi, thường được tính tự động = maxPoints / questionCount. */
  points: number;
  /** Giải thích lý thuyết của GV, hiện ở màn xem lại cho sinh viên. */
  explanationText?: string;
  /** Nội dung câu hỏi dạng text tuỳ chọn, có thể do GV nhập hoặc OCR tự trích sau này. */
  questionText?: string;
  choiceAText?: string;
  choiceBText?: string;
  choiceCText?: string;
  choiceDText?: string;
  /** Trạng thái xử lý OCR, mặc định mới là not_processed. */
  ocrStatus?: 'not_processed' | 'pending' | 'done' | 'failed';
  /** Văn bản OCR trích xuất từ file đề trong tương lai. */
  ocrExtractedText?: string;
}

/**
 * Câu trả lời của sinh viên cho một câu hỏi trong một lượt nộp bài trắc nghiệm.
 * Dữ liệu này tương ứng với bảng quiz_answers trong CSDL thật.
 */
export interface QuizAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  /** null nghĩa sinh viên bỏ trống câu này khi nộp bài. */
  selectedChoice: 'A' | 'B' | 'C' | 'D' | null;
  /** Hệ thống tự tính từ đáp án đúng của câu hỏi và lựa chọn của sinh viên. */
  isCorrect: boolean;
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

export interface GradeComponent {
  id: string;
  classId: string;
  name: string; // GV tự đặt tên, không giới hạn 3 cái cố định
  weightPercent: number;
  order: number;
}

export interface GradeComponentScore {
  id: string;
  enrollmentId: string;
  componentId: string;
  score: number;
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
