import axiosClient from '../axiosClient';
import { Department, DepartmentRequest } from '../../models/Department';
import { AcademicYear, AcademicYearRequest } from '../../models/AcademicYear';
import { Semester, SemesterRequest } from '../../models/Semester';
import { Subject, SubjectRequest } from '../../models/Subject';
import { ClassSection, ClassSectionRequest } from '../../models/ClassSection';
import { SchoolClass } from '../../models/SchoolClass';
import { Teacher, TeacherRequest } from '../../models/Teacher';
import { Major, MajorRequest } from '../../models/Major';
import { UserAdmin, UserCreationRequest, UserUpdateRequest } from '../../models/UserAdmin';
import { Student, StudentRequest } from '../../models/Student';
import { Enrollment, EnrollmentRequest } from '../../models/Enrollment';
import { RegistrationPeriod, RegistrationPeriodRequest } from '../../models/RegistrationPeriod';
import { AdminDashboardStats } from '../../models/AdminDashboard';
import { PageResponse } from '../../models/PageResponse';
import { AdminAnnouncementResponse, AdminAnnouncementRequest } from '../../models/Announcement';

export const adminApi = {
  // === ANNOUNCEMENT API ===
  getAllAnnouncements: async (): Promise<AdminAnnouncementResponse[]> => {
    return await axiosClient.get('/admin/announcements');
  },
  createAnnouncement: async (data: AdminAnnouncementRequest): Promise<AdminAnnouncementResponse> => {
    return await axiosClient.post('/admin/announcements', data);
  },
  updateAnnouncement: async (id: number, data: AdminAnnouncementRequest): Promise<AdminAnnouncementResponse> => {
    return await axiosClient.put(`/admin/announcements/${id}`, data);
  },
  deleteAnnouncement: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/announcements/${id}`);
  },

  // ==========================================
  // DASHBOARD
  // ==========================================
  getDashboardStats: async (): Promise<any> => {
    return await axiosClient.get('/admin/dashboard/stats');
  },

  getGradeDistribution: async (params?: {
    yearId?: number;
    semesterId?: number;
    classSectionId?: number;
    departmentId?: number;
    majorId?: number;
  }): Promise<Record<string, number>> => {
    const query = new URLSearchParams();
    if (params?.yearId) query.append('yearId', params.yearId.toString());
    if (params?.semesterId) query.append('semesterId', params.semesterId.toString());
    if (params?.classSectionId) query.append('classSectionId', params.classSectionId.toString());
    if (params?.departmentId) query.append('departmentId', params.departmentId.toString());
    if (params?.majorId) query.append('majorId', params.majorId.toString());
    
    return await axiosClient.get(`/admin/dashboard/grade-distribution?${query.toString()}`);
  },

  // === ADMIN GRADING API ===
  getFinalGrades: async (classSectionId: number, page: number = 0, size: number = 500): Promise<any> => {
    return await axiosClient.get(`/admin/classes/${classSectionId}/grades?page=${page}&size=${size}`);
  },
  
  updateStudentGrades: async (classSectionId: number, data: any[]): Promise<any> => {
    return await axiosClient.put(`/admin/classes/${classSectionId}/grades`, data);
  },

  // === DEPARTMENT API ===
  getAllDepartments: async (): Promise<Department[]> => {
    const res: any = await axiosClient.get('/admin/departments?size=500');
    return Array.isArray(res) ? res : (res.content || []);
  },

  getDepartmentById: async (id: number): Promise<Department> => {
    return await axiosClient.get(`/admin/departments/${id}`);
  },

  createDepartment: async (data: DepartmentRequest): Promise<Department> => {
    return await axiosClient.post('/admin/departments', data);
  },

  updateDepartment: async (id: number, data: DepartmentRequest): Promise<Department> => {
    return await axiosClient.put(`/admin/departments/${id}`, data);
  },

  deleteDepartment: async (id: number): Promise<void> => {
    return await axiosClient.delete(`/admin/departments/${id}`);
  },

  // === ACADEMIC YEAR API ===
  getAllAcademicYears: async (): Promise<AcademicYear[]> => {
    const res: any = await axiosClient.get('/admin/academic-years?size=500');
    return Array.isArray(res) ? res : (res.content || []);
  },

  createAcademicYear: async (data: AcademicYearRequest): Promise<AcademicYear> => {
    return await axiosClient.post('/admin/academic-years', data);
  },

  updateAcademicYear: async (id: number, data: AcademicYearRequest): Promise<AcademicYear> => {
    return await axiosClient.put(`/admin/academic-years/${id}`, data);
  },

  deleteAcademicYear: async (id: number): Promise<void> => {
    return await axiosClient.delete(`/admin/academic-years/${id}`);
  },

  // --- Semesters ---
  getAllSemesters: async (): Promise<Semester[]> => {
    const res: any = await axiosClient.get('/admin/semesters?size=500');
    return Array.isArray(res) ? res : (res.content || []);
  },
  createSemester: async (data: SemesterRequest): Promise<Semester> => {
    return await axiosClient.post('/admin/semesters', data);
  },
  updateSemester: async (id: number, data: SemesterRequest): Promise<Semester> => {
    return await axiosClient.put(`/admin/semesters/${id}`, data);
  },
  deleteSemester: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/semesters/${id}`);
  },

  // --- Subjects ---
  getAllSubjects: async (page = 0, size = 10, search?: string, departmentId?: number, majorId?: number): Promise<PageResponse<Subject>> => {
    let url = `/admin/subjects?page=${page}&size=${size}`;
    if (search && search.trim() !== '') url += `&search=${encodeURIComponent(search.trim())}`;
    if (departmentId !== undefined && departmentId !== null) url += `&departmentId=${departmentId}`;
    if (majorId !== undefined && majorId !== null) url += `&majorId=${majorId}`;
    const res: any = await axiosClient.get(url);
    return res;
  },
  getAllSubjectsList: async (departmentId?: number, majorId?: number): Promise<Subject[]> => {
    let url = `/admin/subjects?page=0&size=5000&_t=${new Date().getTime()}`;
    if (departmentId !== undefined && departmentId !== null) url += `&departmentId=${departmentId}`;
    if (majorId !== undefined && majorId !== null) url += `&majorId=${majorId}`;
    const res: any = await axiosClient.get(url);
    return res.content || [];
  },
  getSubjectById: async (id: number): Promise<Subject> => {
    const res = await axiosClient.get(`/admin/subjects/${id}`);
    return (res as any).result || res;
  },
  createSubject: async (data: SubjectRequest): Promise<Subject> => {
    return await axiosClient.post('/admin/subjects', data);
  },
  updateSubject: async (id: number, data: SubjectRequest): Promise<Subject> => {
    return await axiosClient.put(`/admin/subjects/${id}`, data);
  },
  deleteSubject: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/subjects/${id}`);
  },

  // --- Subject Materials ---
  getSubjectMaterials: async (subjectId: number, page = 0, size = 50) => {
    return await axiosClient.get(`/admin/subjects/${subjectId}/materials?page=${page}&size=${size}`);
  },
  uploadSubjectMaterial: async (subjectId: number, data: { fileName: string, storageKey: string, mimeType?: string }) => {
    return await axiosClient.post(`/admin/subjects/${subjectId}/materials`, data);
  },
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosClient.post('/admin/subjects/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteSubjectMaterial: async (materialId: number) => {
    await axiosClient.delete(`/admin/subjects/materials/${materialId}`);
  },

  // --- Majors ---
  getAllMajors: async (page = 0, size = 10, search?: string, departmentId?: number): Promise<PageResponse<Major>> => {
    let url = `/admin/majors?page=${page}&size=${size}`;
    if (search && search.trim() !== '') url += `&search=${encodeURIComponent(search.trim())}`;
    if (departmentId !== undefined && departmentId !== null && !isNaN(departmentId)) url += `&departmentId=${departmentId}`;
    const res: any = await axiosClient.get(url);
    return res;
  },
  getAllMajorsList: async (): Promise<Major[]> => {
    const res: any = await axiosClient.get('/admin/majors?page=0&size=5000');
    return res.content || [];
  },
  getMajorById: async (id: number): Promise<Major> => {
    return await axiosClient.get(`/admin/majors/${id}`);
  },
  createMajor: async (data: MajorRequest): Promise<Major> => {
    return await axiosClient.post('/admin/majors', data);
  },
  updateMajor: async (id: number, data: MajorRequest): Promise<Major> => {
    return await axiosClient.put(`/admin/majors/${id}`, data);
  },
  deleteMajor: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/majors/${id}`);
  },

  // --- Major Subjects ---
  addSubjectToMajor: async (majorId: number, data: { subjectId: number; semesterIndex?: number; type?: string }): Promise<Subject> => {
    return await axiosClient.post(`/admin/majors/${majorId}/subjects`, data);
  },
  updateSubjectInMajor: async (majorId: number, subjectId: number, data: { semesterIndex?: number; type?: string }): Promise<Subject> => {
    return await axiosClient.put(`/admin/majors/${majorId}/subjects/${subjectId}`, data);
  },
  removeSubjectFromMajor: async (majorId: number, subjectId: number): Promise<void> => {
    await axiosClient.delete(`/admin/majors/${majorId}/subjects/${subjectId}`);
  },

  // --- Users ---
  getAllUsers: async (page = 0, size = 10, search?: string, roleName?: string, status?: string): Promise<PageResponse<UserAdmin>> => {
    let url = `/admin/users?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (roleName) url += `&roleName=${encodeURIComponent(roleName)}`;
    if (status) url += `&status=${status}`;
    const res: any = await axiosClient.get(url);
    return res;
  },
  
  // Dùng cho Combobox / Dropdown (Lấy số lượng lớn, không phân trang)
  getAllUsersList: async (): Promise<UserAdmin[]> => {
    const res: any = await axiosClient.get('/admin/users?page=0&size=5000');
    return res.content || [];
  },

  createUser: async (data: UserCreationRequest): Promise<UserAdmin> => {
    return await axiosClient.post('/admin/users', data);
  },
  updateUser: async (id: number, data: UserUpdateRequest): Promise<UserAdmin> => {
    return await axiosClient.put(`/admin/users/${id}`, data);
  },
  deleteUser: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/users/${id}`);
  },

  // --- Teachers ---
  getAllTeachers: async (page = 0, size = 10, search?: string, departmentId?: number): Promise<PageResponse<Teacher>> => {
    let url = `/admin/teachers?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    const res: any = await axiosClient.get(url);
    return res;
  },
  getAllTeachersList: async (): Promise<Teacher[]> => {
    const res: any = await axiosClient.get('/admin/teachers?page=0&size=5000');
    return res.content || [];
  },
  createTeacher: async (data: TeacherRequest): Promise<Teacher> => {
    return await axiosClient.post('/admin/teachers', data);
  },
  updateTeacher: async (id: number, data: TeacherRequest): Promise<Teacher> => {
    return await axiosClient.put(`/admin/teachers/${id}`, data);
  },
  deleteTeacher: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/teachers/${id}`);
  },

  // --- Students ---
  getAllStudents: async (page = 0, size = 10, search?: string, departmentId?: number, majorId?: number, classId?: number): Promise<PageResponse<Student>> => {
    let url = `/admin/students?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (majorId) url += `&majorId=${majorId}`;
    if (classId) url += `&classId=${classId}`;
    const res: any = await axiosClient.get(url);
    return res;
  },

  getStudentGrades: async (studentId: number, semesterId?: number, page = 0, size = 50) => {
    const semQuery = semesterId ? `&semesterId=${semesterId}` : '';
    return await axiosClient.get(`/admin/students/${studentId}/grades?page=${page}&size=${size}${semQuery}`);
  },

  getStudentClasses: async (studentId: number, page = 0, size = 100) => {
    return await axiosClient.get(`/admin/students/${studentId}/classes?page=${page}&size=${size}`);
  },

  createStudent: async (data: StudentRequest): Promise<Student> => {
    return await axiosClient.post('/admin/students', data);
  },

  // --- Teachers ---
  getTeacherClasses: async (teacherId: number, search?: string, semesterId?: number, page = 0, size = 10) => {
    let url = `/admin/teachers/${teacherId}/classes?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (semesterId) url += `&semesterId=${semesterId}`;
    return await axiosClient.get(url);
  },
  updateStudent: async (id: number, data: StudentRequest): Promise<Student> => {
    return await axiosClient.put(`/admin/students/${id}`, data);
  },
  deleteStudent: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/students/${id}`);
  },

  // --- School Classes ---
  getAllSchoolClasses: async (): Promise<SchoolClass[]> => {
    const res: any = await axiosClient.get('/admin/classes?size=500');
    return Array.isArray(res) ? res : (res.content || []);
  },

  // --- Class Sections ---
  getAllClassSections: async (page = 0, size = 10, search?: string, semesterId?: number, subjectId?: number, departmentId?: number, majorId?: number): Promise<PageResponse<ClassSection>> => {
    let url = `/admin/class-sections?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (semesterId) url += `&semesterId=${semesterId}`;
    if (subjectId) url += `&subjectId=${subjectId}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (majorId) url += `&majorId=${majorId}`;
    const res: any = await axiosClient.get(url);
    return res;
  },
  getAllClassSectionsList: async (): Promise<ClassSection[]> => {
    const res: any = await axiosClient.get('/admin/class-sections?page=0&size=5000');
    return res.content || [];
  },
  createClassSection: async (data: ClassSectionRequest): Promise<ClassSection> => {
    return await axiosClient.post('/admin/class-sections', data);
  },
  updateClassSection: async (id: number, data: ClassSectionRequest): Promise<ClassSection> => {
    return await axiosClient.put(`/admin/class-sections/${id}`, data);
  },
  deleteClassSection: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/class-sections/${id}`);
  },

  // --- Enrollments ---
  getAllEnrollments: async (): Promise<Enrollment[]> => {
    const res: any = await axiosClient.get('/admin/enrollments?size=1000');
    return res.content || [];
  },
  createEnrollment: async (data: EnrollmentRequest): Promise<Enrollment> => {
    return await axiosClient.post('/admin/enrollments', data);
  },
  updateEnrollment: async (id: number, data: EnrollmentRequest): Promise<Enrollment> => {
    return await axiosClient.put(`/admin/enrollments/${id}`, data);
  },
  deleteEnrollment: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/enrollments/${id}`);
  },

  // --- Registration Periods ---
  getAllRegistrationPeriods: async (): Promise<RegistrationPeriod[]> => {
    return await axiosClient.get('/admin/config/registration-period');
  },
  createOrUpdateRegistrationPeriod: async (data: RegistrationPeriodRequest): Promise<RegistrationPeriod> => {
    return await axiosClient.post('/admin/config/registration-period', data);
  },
  toggleRegistrationPeriod: async (id: number, isOpen: boolean): Promise<void> => {
    await axiosClient.patch(`/admin/config/registration-period/${id}/toggle?isOpen=${isOpen}`);
  },
  deleteRegistrationPeriod: async (id: number): Promise<void> => {
    await axiosClient.delete(`/admin/config/registration-period/${id}`);
  },
};
