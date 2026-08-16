import axiosClient from '../axiosClient';

export const teacherApi = {
  // --- General File Upload ---
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosClient.post('/teacher/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // --- Materials ---
  uploadMaterial: async (classId: number, title: string, desc: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (desc) {
      formData.append('description', desc);
    }

    // Gửi dưới dạng multipart/form-data
    return await axiosClient.post(`/teacher/classes/${classId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteMaterial: async (id: number) => {
    return await axiosClient.delete(`/teacher/materials/${id}`);
  },

  getMaterials: async (classId: number, page = 0, size = 10) => {
    return await axiosClient.get(`/teacher/classes/${classId}/materials?page=${page}&size=${size}`);
  },

  // --- My Classes (Module 1) ---
  getMyClasses: async (search?: string, semesterId?: number, page = 0, size = 50) => {
    let url = `/teacher/classes?page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (semesterId) url += `&semesterId=${semesterId}`;
    return await axiosClient.get(url);
  },
  
  getClassStudents: async (classId: number, page = 0, size = 100) => {
    return await axiosClient.get(`/teacher/classes/${classId}/students?page=${page}&size=${size}`);
  },

  // --- Announcements (Module 1) ---
  getClassAnnouncements: async (classId: number, page = 0, size = 10) => {
    return await axiosClient.get(`/teacher/classes/${classId}/announcements?page=${page}&size=${size}`);
  },
  
  createAnnouncement: async (classId: number, data: { title: string, content: string, recipientGroup: string }) => {
    return await axiosClient.post(`/teacher/classes/${classId}/announcements`, data);
  },

  updateAnnouncement: async (classId: number, id: number, data: { title: string, content: string, recipientGroup: string }) => {
    return await axiosClient.put(`/teacher/classes/${classId}/announcements/${id}`, data);
  },

  deleteAnnouncement: async (classId: number, id: number) => {
    return await axiosClient.delete(`/teacher/classes/${classId}/announcements/${id}`);
  },

  // --- Attendance (Module 2) ---
  getAttendanceSessions: async (classId: number, page = 0, size = 50) => {
    return await axiosClient.get(`/teacher/classes/${classId}/attendance-sessions?page=${page}&size=${size}`);
  },

  createAttendanceSession: async (classId: number, data: { sessionDate: string, title: string, status?: string }) => {
    return await axiosClient.post(`/teacher/classes/${classId}/attendance-sessions`, data);
  },

  getAttendanceRecords: async (sessionId: number) => {
    return await axiosClient.get(`/teacher/attendance-sessions/${sessionId}/records`);
  },

  updateAttendanceRecord: async (recordId: number, data: { status: string, note?: string }) => {
    return await axiosClient.patch(`/teacher/attendance-records/${recordId}`, data);
  },

  updateAttendanceSessionStatus: async (sessionId: number, status: string) => {
    return await axiosClient.patch(`/teacher/attendance-sessions/${sessionId}/status?status=${status}`);
  },

  // --- Assignments (Module 4) ---
  getAssignments: async (classId: number, page = 0, size = 50) => {
    return await axiosClient.get(`/teacher/classes/${classId}/assignments?page=${page}&size=${size}`);
  },

  createAssignment: async (classId: number, data: { title: string, description: string, dueAt: string, maxPoints: number, type: string, examFileUrl?: string, examFileName?: string, examFileType?: string, questionCount?: number }) => {
    return await axiosClient.post(`/teacher/classes/${classId}/assignments`, data);
  },

  updateAssignment: async (id: number, data: { title: string, description: string, dueAt: string, maxPoints: number, type: string, examFileUrl?: string, examFileName?: string, examFileType?: string, questionCount?: number }) => {
    return await axiosClient.put(`/teacher/assignments/${id}`, data);
  },

  deleteAssignment: async (id: number) => {
    return await axiosClient.delete(`/teacher/assignments/${id}`);
  },

  configureQuiz: async (id: number, data: Array<{ orderIndex: number, questionText: string, choiceAText: string, choiceBText: string, choiceCText: string, choiceDText: string, correctChoice: string, points: number, explanationText?: string }>) => {
    return await axiosClient.post(`/teacher/assignments/${id}/configure-quiz`, data);
  },

  getQuizQuestions: async (id: number) => {
    return await axiosClient.get(`/teacher/assignments/${id}/quiz-questions`);
  },

  getSubmissions: async (id: number, page = 0, size = 100) => {
    return await axiosClient.get(`/teacher/assignments/${id}/submissions?page=${page}&size=${size}`);
  },

  gradeSubmission: async (id: number, data: { score: number, feedback?: string }) => {
    return await axiosClient.patch(`/teacher/submissions/${id}/grade`, data);
  },

  // --- Grading (Module 5) ---
  getFinalGrades: async (classId: number, page = 0, size = 50) => {
    return await axiosClient.get(`/teacher/classes/${classId}/final-grades?page=${page}&size=${size}`);
  },

  configureGradeWeights: async (classId: number, data: { attendanceWeight: number, midtermWeight: number, finalWeight: number }) => {
    return await axiosClient.post(`/teacher/classes/${classId}/grade-config`, data);
  },

  updateStudentGrades: async (classId: number, data: Array<{ enrollmentId: number, attendanceScore?: number, midtermScore?: number, finalExamScore?: number }>) => {
    return await axiosClient.put(`/teacher/classes/${classId}/grades`, data);
  }
};
