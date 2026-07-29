/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Student,
  Teacher,
  Major,
  Subject,
  ClassSection,
  RegistrationPeriod,
  AttendanceSession,
  AttendanceRecord,
  LearningMaterial,
  Assignment,
  Submission,
  GradeRecord,
  SystemNotification
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR_ADMIN',
    username: 'admin',
    role: 'admin',
    name: 'Phòng Đào Tạo Hưng Nhân',
    email: 'admin@hungnhan.edu.vn',
    phone: '0243.123.456',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_GV001',
    username: 'gv_nguyenvana',
    role: 'teacher',
    name: 'TS. Nguyễn Văn A',
    email: 'nguyenvana@hungnhan.edu.vn',
    phone: '0912.345.678',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_GV002',
    username: 'gv_tranb',
    role: 'teacher',
    name: 'ThS. Trần Thị B',
    email: 'tranthib@hungnhan.edu.vn',
    phone: '0987.654.321',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_GV003',
    username: 'gv_lehoangc',
    role: 'teacher',
    name: 'PGS. TS. Lê Hoàng C',
    email: 'lehoangc@hungnhan.edu.vn',
    phone: '0904.555.666',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_SV001',
    username: 'sv_nguyenxuanmanh',
    role: 'student',
    name: 'Nguyễn Xuân Mạnh',
    email: 'manh.nx26@hungnhan.edu.vn',
    phone: '0966.111.222',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_SV002',
    username: 'sv_phamminhduc',
    role: 'student',
    name: 'Phạm Minh Đức',
    email: 'duc.pm26@hungnhan.edu.vn',
    phone: '0977.333.444',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_SV003',
    username: 'sv_lethuthao',
    role: 'student',
    name: 'Lê Thu Thảo',
    email: 'thao.lt26@hungnhan.edu.vn',
    phone: '0988.555.666',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_SV004',
    username: 'sv_tranhoanganh',
    role: 'student',
    name: 'Trần Hoàng Anh',
    email: 'anh.th26@hungnhan.edu.vn',
    phone: '0955.777.888',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'USR_SV005',
    username: 'sv_doanquocbao',
    role: 'student',
    name: 'Đoàn Quốc Bảo',
    email: 'bao.dq26@hungnhan.edu.vn',
    phone: '0944.888.999',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120',
    createdAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'GV001',
    userId: 'USR_GV001',
    name: 'TS. Nguyễn Văn A',
    email: 'nguyenvana@hungnhan.edu.vn',
    department: 'Công nghệ thông tin',
    phone: '0912.345.678',
    status: 'active'
  },
  {
    id: 'GV002',
    userId: 'USR_GV002',
    name: 'ThS. Trần Thị B',
    email: 'tranthib@hungnhan.edu.vn',
    department: 'Hệ thống thông tin',
    phone: '0987.654.321',
    status: 'active'
  },
  {
    id: 'GV003',
    userId: 'USR_GV003',
    name: 'PGS. TS. Lê Hoàng C',
    email: 'lehoangc@hungnhan.edu.vn',
    department: 'Khoa học máy tính',
    phone: '0904.555.666',
    status: 'active'
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'SV001',
    userId: 'USR_SV001',
    name: 'Nguyễn Xuân Mạnh',
    email: 'manh.nx26@hungnhan.edu.vn',
    classCode: 'K64-CNTT-A',
    phone: '0966.111.222',
    status: 'active',
    birthDate: '2005-05-15',
    gender: 'Nam',
    gpa: 3.42,
    totalCredits: 68,
    majorId: 'KTPM'
  },
  {
    id: 'SV002',
    userId: 'USR_SV002',
    name: 'Phạm Minh Đức',
    email: 'duc.pm26@hungnhan.edu.vn',
    classCode: 'K64-CNTT-B',
    phone: '0977.333.444',
    status: 'active',
    birthDate: '2005-09-22',
    gender: 'Nam',
    gpa: 2.85,
    totalCredits: 62,
    majorId: 'KTPM'
  },
  {
    id: 'SV003',
    userId: 'USR_SV003',
    name: 'Lê Thu Thảo',
    email: 'thao.lt26@hungnhan.edu.vn',
    classCode: 'K64-CNTT-A',
    phone: '0988.555.666',
    status: 'active',
    birthDate: '2005-12-01',
    gender: 'Nữ',
    gpa: 3.75,
    totalCredits: 71,
    majorId: 'KHMT'
  },
  {
    id: 'SV004',
    userId: 'USR_SV004',
    name: 'Trần Hoàng Anh',
    email: 'anh.th26@hungnhan.edu.vn',
    classCode: 'K64-ATTT',
    phone: '0955.777.888',
    status: 'active',
    birthDate: '2005-02-10',
    gender: 'Nam',
    gpa: 3.12,
    totalCredits: 65,
    majorId: 'KTPM'
  },
  {
    id: 'SV005',
    userId: 'USR_SV005',
    name: 'Đoàn Quốc Bảo',
    email: 'bao.dq26@hungnhan.edu.vn',
    classCode: 'K64-ATTT',
    phone: '0944.888.999',
    status: 'active',
    birthDate: '2005-07-30',
    gender: 'Nam',
    gpa: 3.56,
    totalCredits: 68,
    majorId: 'NNA'
  }
];

export const INITIAL_MAJORS: Major[] = [
  { id: 'CNTT', name: 'Công nghệ thông tin', departmentId: 'CNTT', description: 'Ngành Công nghệ thông tin', status: 'active' },
  { id: 'KTPM', name: 'Kỹ thuật phần mềm', departmentId: 'CNTT', description: 'Ngành Kỹ thuật phần mềm', status: 'active' },
  { id: 'KHMT', name: 'Khoa học máy tính', departmentId: 'CNTT', description: 'Ngành Khoa học máy tính', status: 'active' },
  { id: 'KT', name: 'Kế toán', departmentId: 'KT', description: 'Ngành Kế toán', status: 'active' },
  { id: 'QTKD', name: 'Quản trị kinh doanh', departmentId: 'KT', description: 'Ngành Quản trị kinh doanh', status: 'active' },
  { id: 'NNA', name: 'Ngôn ngữ Anh', departmentId: 'NN', description: 'Ngành Ngôn ngữ Anh', status: 'active' }
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'INT1001',
    name: 'Lập trình hướng đối tượng',
    credits: 3,
    department: 'Công nghệ thông tin',
    majorIds: ['KTPM', 'KHMT']
  },
  {
    id: 'INT1002',
    name: 'Cơ sở dữ liệu',
    credits: 3,
    department: 'Hệ thống thông tin',
    majorIds: ['KTPM']
  },
  {
    id: 'INT1003',
    name: 'Trí tuệ nhân tạo',
    credits: 4,
    department: 'Khoa học máy tính',
    majorIds: ['KHMT']
  },
  {
    id: 'MAT1001',
    name: 'Giải tích 1',
    credits: 3,
    department: 'Toán học',
    majorIds: ['CNTT', 'KTPM', 'KHMT']
  },
  {
    id: 'ENG1001',
    name: 'Tiếng Anh chuyên ngành',
    credits: 2,
    department: 'Ngoại ngữ',
    majorIds: ['NNA', 'CNTT']
  }
];

export const INITIAL_CLASSES: ClassSection[] = [
  {
    id: 'LHP001',
    subjectId: 'INT1001',
    subjectName: 'Lập trình hướng đối tượng',
    credits: 3,
    teacherId: 'GV001',
    teacherName: 'TS. Nguyễn Văn A',
    schedule: 'Thứ Hai (07:00 - 09:30)',
    dayOfWeek: 2,
    timeSlot: '07:00 - 09:30',
    room: 'A1-202',
    capacity: 40,
    studentIds: ['SV001', 'SV002', 'SV003', 'SV004'],
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    periodStart: 1,
    periodEnd: 3,
    majorId: 'KTPM'
  },
  {
    id: 'LHP002',
    subjectId: 'INT1002',
    subjectName: 'Cơ sở dữ liệu',
    credits: 3,
    teacherId: 'GV002',
    teacherName: 'ThS. Trần Thị B',
    schedule: 'Thứ Ba (13:00 - 15:30)',
    dayOfWeek: 3,
    timeSlot: '13:00 - 15:30',
    room: 'B2-304',
    capacity: 35,
    studentIds: ['SV001', 'SV002', 'SV005'],
    startDate: '2026-06-15',
    endDate: '2026-09-15',
    periodStart: 7,
    periodEnd: 9,
    majorId: 'KTPM'
  },
  {
    id: 'LHP003',
    subjectId: 'INT1003',
    subjectName: 'Trí tuệ nhân tạo',
    credits: 4,
    teacherId: 'GV003',
    teacherName: 'PGS. TS. Lê Hoàng C',
    schedule: 'Thứ Tư (08:00 - 11:30)',
    dayOfWeek: 4,
    timeSlot: '08:00 - 11:30',
    room: 'C3-101',
    capacity: 30,
    studentIds: ['SV003', 'SV004', 'SV005'],
    startDate: '2026-06-01',
    endDate: '2026-08-20',
    periodStart: 2,
    periodEnd: 5,
    majorId: 'KHMT'
  },
  {
    id: 'LHP004',
    subjectId: 'MAT1001',
    subjectName: 'Giải tích 1',
    credits: 3,
    teacherId: 'GV001',
    teacherName: 'TS. Nguyễn Văn A',
    schedule: 'Thứ Sáu (09:45 - 12:15)',
    dayOfWeek: 6,
    timeSlot: '09:45 - 12:15',
    room: 'A1-105',
    capacity: 50,
    studentIds: ['SV001', 'SV003', 'SV005'],
    startDate: '2026-06-01',
    endDate: '2026-08-15',
    periodStart: 4,
    periodEnd: 6,
    majorId: 'CNTT'
  },
  {
    id: 'LHP005',
    subjectId: 'ENG1001',
    subjectName: 'Tiếng Anh chuyên ngành',
    credits: 2,
    teacherId: 'GV002',
    teacherName: 'ThS. Trần Thị B',
    schedule: 'Thứ Năm (07:00 - 09:30)',
    dayOfWeek: 5,
    timeSlot: '07:00 - 09:30',
    room: 'B1-205',
    capacity: 40,
    studentIds: ['SV001', 'SV002'],
    startDate: '2026-08-01',
    endDate: '2026-10-15',
    periodStart: 1,
    periodEnd: 3,
    majorId: 'NNA'
  },
  {
    id: 'LHP006',
    subjectId: 'INT1001',
    subjectName: 'Lập trình hướng đối tượng (Kỳ trước)',
    credits: 3,
    teacherId: 'GV001',
    teacherName: 'TS. Nguyễn Văn A',
    schedule: 'Thứ Bảy (14:00 - 16:30)',
    dayOfWeek: 7,
    timeSlot: '14:00 - 16:30',
    room: 'A1-202',
    capacity: 40,
    studentIds: ['SV001', 'SV003'],
    startDate: '2026-02-01',
    endDate: '2026-05-15',
    periodStart: 8,
    periodEnd: 10,
    majorId: 'KHMT'
  }
];

export const INITIAL_REGISTRATION_PERIOD: RegistrationPeriod = {
  startDate: '2026-07-01',
  endDate: '2026-07-20',
  isOpen: true
};

export const INITIAL_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: 'SES001',
    classId: 'LHP001',
    date: '2026-07-02',
    title: 'Buổi 1: Giới thiệu OOP & Java',
    status: 'closed',
    createdAt: '2026-07-02T06:50:00Z'
  },
  {
    id: 'SES002',
    classId: 'LHP001',
    date: '2026-07-09',
    title: 'Buổi 2: Lớp và Đối tượng',
    status: 'open',
    createdAt: '2026-07-09T06:55:00Z'
  },
  {
    id: 'SES003',
    classId: 'LHP002',
    date: '2026-07-08',
    title: 'Buổi 1: Tổng quan Hệ CSDL',
    status: 'closed',
    createdAt: '2026-07-08T12:50:00Z'
  }
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Session 1 OOP
  { id: 'REC001', sessionId: 'SES001', classId: 'LHP001', studentId: 'SV001', studentName: 'Nguyễn Xuân Mạnh', status: 'present', updatedAt: '2026-07-02T07:15:00Z' },
  { id: 'REC002', sessionId: 'SES001', classId: 'LHP001', studentId: 'SV002', studentName: 'Phạm Minh Đức', status: 'late', noted: 'Đi muộn 15p', updatedAt: '2026-07-02T07:20:00Z' },
  { id: 'REC003', sessionId: 'SES001', classId: 'LHP001', studentId: 'SV003', studentName: 'Lê Thu Thảo', status: 'present', updatedAt: '2026-07-02T07:05:00Z' },
  { id: 'REC004', sessionId: 'SES001', classId: 'LHP001', studentId: 'SV004', studentName: 'Trần Hoàng Anh', status: 'absent', noted: 'Không phép', updatedAt: '2026-07-02T07:30:00Z' },
  
  // Session 2 OOP (Ongoing)
  { id: 'REC005', sessionId: 'SES002', classId: 'LHP001', studentId: 'SV001', studentName: 'Nguyễn Xuân Mạnh', status: 'present', updatedAt: '2026-07-09T07:02:00Z' },
  { id: 'REC006', sessionId: 'SES002', classId: 'LHP001', studentId: 'SV002', studentName: 'Phạm Minh Đức', status: 'present', updatedAt: '2026-07-09T07:03:00Z' },
  { id: 'REC007', sessionId: 'SES002', classId: 'LHP001', studentId: 'SV003', studentName: 'Lê Thu Thảo', status: 'present', updatedAt: '2026-07-09T07:01:00Z' },
  // SV004 hasn't been ticked yet, defaults to absent/unmarked
  { id: 'REC008', sessionId: 'SES002', classId: 'LHP001', studentId: 'SV004', studentName: 'Trần Hoàng Anh', status: 'absent', noted: 'Chưa điểm danh', updatedAt: '2026-07-09T07:00:00Z' },

  // Session 1 CSDL
  { id: 'REC009', sessionId: 'SES003', classId: 'LHP002', studentId: 'SV001', studentName: 'Nguyễn Xuân Mạnh', status: 'present', updatedAt: '2026-07-08T13:02:00Z' },
  { id: 'REC010', sessionId: 'SES003', classId: 'LHP002', studentId: 'SV002', studentName: 'Phạm Minh Đức', status: 'present', updatedAt: '2026-07-08T13:05:00Z' },
  { id: 'REC011', sessionId: 'SES003', classId: 'LHP002', studentId: 'SV005', studentName: 'Đoàn Quốc Bảo', status: 'late', noted: 'Tắc đường', updatedAt: '2026-07-08T13:20:00Z' }
];

export const INITIAL_MATERIALS: LearningMaterial[] = [
  {
    id: 'MAT_OOP_01',
    classId: 'LHP001',
    title: 'Slide Chương 1: Tổng quan về lập trình hướng đối tượng',
    type: 'pdf',
    url: '#',
    fileName: 'Chuong1_OOP_Overview.pdf',
    fileSize: '2.4 MB',
    uploadedAt: '2026-07-01T10:00:00Z',
    description: 'Giới thiệu về các đặc trưng chính của OOP: Đóng gói, kế thừa, đa hình, trừu tượng.'
  },
  {
    id: 'MAT_OOP_02',
    classId: 'LHP001',
    title: 'Code mẫu bài thực hành tuần 1',
    type: 'doc',
    url: '#',
    fileName: 'Practice_Week1_Code.zip',
    fileSize: '450 KB',
    uploadedAt: '2026-07-02T15:30:00Z',
    description: 'Bao gồm các ví dụ căn bản về class, object và constructor.'
  },
  {
    id: 'MAT_DB_01',
    classId: 'LHP002',
    title: 'Slide Chương 1: Giới thiệu hệ quản trị cơ sở dữ liệu',
    type: 'pdf',
    url: '#',
    fileName: 'Database_Chapter1.pdf',
    fileSize: '3.1 MB',
    uploadedAt: '2026-07-03T09:00:00Z',
    description: 'Nêu các thành phần chính của một DBMS và cấu trúc ba mức.'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'ASM_OOP_01',
    classId: 'LHP001',
    title: 'Bài tập tuần 2: Thiết kế sơ đồ lớp và hiện thực hóa Class',
    description: 'Hãy vẽ sơ đồ lớp (Class Diagram) và hiện thực hóa bài toán Quản lý thư viện sách bằng ngôn ngữ Java/C++. Yêu cầu có tối thiểu 3 lớp: Book, Member, Library, thể hiện mối quan hệ liên kết và kế thừa.',
    dueDate: '2026-07-16T23:59',
    maxPoints: 10,
    createdAt: '2026-07-03T08:00:00Z'
  },
  {
    id: 'ASM_DB_01',
    classId: 'LHP002',
    title: 'Bài tập thực hành SQL: Viết truy vấn cơ bản',
    description: 'Dựa trên lược đồ CSDL Quản lý bán hàng đã cho, hãy viết các truy vấn SQL tương ứng để lấy danh sách khách hàng, thống kê doanh thu theo tháng và tìm sản phẩm bán chạy nhất.',
    dueDate: '2026-07-15T23:59',
    maxPoints: 10,
    createdAt: '2026-07-04T14:00:00Z'
  }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'SUB_001',
    assignmentId: 'ASM_OOP_01',
    classId: 'LHP001',
    studentId: 'SV001',
    studentName: 'Nguyễn Xuân Mạnh',
    content: 'Em xin nộp bài tập vẽ sơ đồ lớp thư viện và mã nguồn kèm theo. Em đã áp dụng đúng tính kế thừa cho các loại Member khác nhau (VIP, Thường).',
    fileName: 'NguyenXuanManh_OOP_ASM2.zip',
    fileUrl: '#',
    submittedAt: '2026-07-08T22:15:00Z',
    score: 9.5,
    feedback: 'Bài làm rất tốt, sơ đồ vẽ sạch đẹp, code chạy đúng logic, cần chú ý tối ưu hóa các phương thức getter/setter.',
    status: 'graded'
  },
  {
    id: 'SUB_002',
    assignmentId: 'ASM_OOP_01',
    classId: 'LHP001',
    studentId: 'SV003',
    studentName: 'Lê Thu Thảo',
    content: 'Em gửi thầy bài thực hành tuần 2 bản PDF sơ đồ lớp và link github bài làm.',
    fileName: 'LeThuThao_OOP_Homework2.pdf',
    fileUrl: '#',
    submittedAt: '2026-07-09T10:30:00Z',
    status: 'submitted' // Ungraded yet!
  },
  {
    id: 'SUB_003',
    assignmentId: 'ASM_DB_01',
    classId: 'LHP002',
    studentId: 'SV001',
    studentName: 'Nguyễn Xuân Mạnh',
    content: 'Bài nộp truy vấn SQL quản lý bán hàng tuần này.',
    fileName: 'SQL_Assignment_Manh.txt',
    fileUrl: '#',
    submittedAt: '2026-07-07T19:40:00Z',
    score: 8.0,
    feedback: 'Các câu truy vấn cơ bản đều đúng, tuy nhiên câu thống kê doanh thu cần dùng LEFT JOIN thay vì INNER JOIN để tránh mất dữ liệu của tháng không có doanh số.',
    status: 'graded'
  }
];

export const INITIAL_GRADES: GradeRecord[] = [
  // Class LHP001 OOP
  { id: 'GRD_001', classId: 'LHP001', studentId: 'SV001', studentName: 'Nguyễn Xuân Mạnh', progressScore: 9.5, midScore: 8.5, endScore: 9.0 },
  { id: 'GRD_002', classId: 'LHP001', studentId: 'SV002', studentName: 'Phạm Minh Đức', progressScore: 8.0, midScore: 6.5, endScore: 7.0 },
  { id: 'GRD_003', classId: 'LHP001', studentId: 'SV003', studentName: 'Lê Thu Thảo', progressScore: 10.0, midScore: 9.5, endScore: 9.5 },
  { id: 'GRD_004', classId: 'LHP001', studentId: 'SV004', studentName: 'Trần Hoàng Anh', progressScore: 7.0, midScore: 5.5, endScore: 6.0 },

  // Class LHP002 CSDL
  { id: 'GRD_005', classId: 'LHP002', studentId: 'SV001', studentName: 'Nguyễn Xuân Mạnh', progressScore: 9.0, midScore: 8.0, endScore: 8.5 },
  { id: 'GRD_006', classId: 'LHP002', studentId: 'SV002', studentName: 'Phạm Minh Đức', progressScore: 8.5, midScore: 7.0, endScore: 6.5 },
  { id: 'GRD_007', classId: 'LHP002', studentId: 'SV005', studentName: 'Đoàn Quốc Bảo', progressScore: 9.5, midScore: 9.0, endScore: 9.0 },

  // Class LHP003 AI
  { id: 'GRD_008', classId: 'LHP003', studentId: 'SV003', studentName: 'Lê Thu Thảo', progressScore: 10.0, midScore: 9.0, endScore: 9.5 },
  { id: 'GRD_009', classId: 'LHP003', studentId: 'SV004', studentName: 'Trần Hoàng Anh', progressScore: 8.0, midScore: 7.5, endScore: 8.0 },
  { id: 'GRD_010', classId: 'LHP003', studentId: 'SV005', studentName: 'Đoàn Quốc Bảo', progressScore: 9.0, midScore: 8.5, endScore: 8.5 },

  // Class LHP004 GT1
  { id: 'GRD_011', classId: 'LHP004', studentId: 'SV001', studentName: 'Nguyễn Xuân Mạnh', progressScore: 9.0, midScore: 7.5, endScore: 8.0 },
  { id: 'GRD_012', classId: 'LHP004', studentId: 'SV003', studentName: 'Lê Thu Thảo', progressScore: 10.0, midScore: 9.5, endScore: 10.0 },
  { id: 'GRD_013', classId: 'LHP004', studentId: 'SV005', studentName: 'Đoàn Quốc Bảo', progressScore: 8.5, midScore: 8.0, endScore: 8.5 }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'NTF_001',
    title: 'Thông báo: Khởi động Đăng ký học phần Học kỳ Hè năm học 2025-2026',
    content: 'Phòng Đào Tạo Hưng Nhân xin thông báo: Cổng đăng ký học phần cho học kỳ hè sẽ được mở từ ngày 01/07/2026 đến hết ngày 20/07/2026. Sinh viên chú ý theo dõi thời khóa biểu và đăng ký đúng hạn để kịp tiến độ học tập.',
    recipientGroup: 'students',
    sender: 'Phòng Đào Tạo',
    createdAt: '2026-07-01T08:00:00Z'
  },
  {
    id: 'NTF_002',
    title: 'Cập nhật: Nâng cấp Hệ thống quản lý & Học tập Hưng Nhân',
    content: 'Hệ thống đã bổ sung thêm tính năng điểm danh và theo dõi tiến trình bài tập nhằm hỗ trợ tốt nhất công tác giảng dạy trực tuyến. Giảng viên vui lòng mở phiên điểm danh đầu giờ mỗi buổi học.',
    recipientGroup: 'all',
    sender: 'Ban Quản Trị Hệ Thống',
    createdAt: '2026-07-02T10:00:00Z'
  },
  {
    id: 'NTF_003',
    title: 'Lớp Lập trình hướng đối tượng (LHP001) - Thông báo chuẩn bị Bài tập tuần 2',
    content: 'Các em sinh viên chú ý nộp sơ đồ lớp và mã nguồn đầy đủ của thư viện lên hệ thống trước hạn chót 16/07. Bài nộp muộn sẽ bị trừ 10% số điểm mỗi ngày.',
    recipientGroup: 'class',
    classId: 'LHP001',
    sender: 'TS. Nguyễn Văn A',
    createdAt: '2026-07-03T11:30:00Z'
  }
];
