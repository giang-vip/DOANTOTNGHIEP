import axiosClient from '../axiosClient';

export const studentApi = {
  // --- Dashboard & General Classes ---
  getStudentClasses: async (page = 0, size = 50) => {
    return await axiosClient.get(`/student/classes?page=${page}&size=${size}`);
  },

  getStudentAnnouncements: async (page = 0, size = 50) => {
    return await axiosClient.get(`/student/announcements?page=${page}&size=${size}`);
  },

  // --- Attendance ---
  getMyAttendance: async (classSectionId: number) => {
    return await axiosClient.get(`/student/classes/${classSectionId}/attendance`);
  },

  checkIn: async (classSectionId: number, sessionId: number) => {
    return await axiosClient.post(`/student/classes/${classSectionId}/attendance/${sessionId}/checkin`);
  },

  // --- Materials ---
  getMyMaterials: async (classSectionId: number, page = 0, size = 50) => {
    return await axiosClient.get(`/student/classes/${classSectionId}/materials?page=${page}&size=${size}`);
  },

  // --- Assignments ---
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosClient.post('/student/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getAssignments: async (classSectionId: number, page = 0, size = 50) => {
    return await axiosClient.get(`/student/classes/${classSectionId}/assignments?page=${page}&size=${size}`);
  },

  submitAssignment: async (assignmentId: number, payload: { content: string; fileUrl?: string }) => {
    return await axiosClient.post(`/student/assignments/${assignmentId}/submit`, payload);
  },

  getMySubmission: async (assignmentId: number) => {
    return await axiosClient.get(`/student/assignments/${assignmentId}/submission`);
  },

  // --- Quiz ---
  startQuiz: async (assignmentId: number) => {
    return await axiosClient.post(`/student/assignments/${assignmentId}/start-quiz`);
  },

  submitQuiz: async (assignmentId: number, payload: { answers: Array<{ questionId: number; selectedChoice: string }> }) => {
    return await axiosClient.post(`/student/assignments/${assignmentId}/submit-quiz`, payload);
  },

  getQuizResult: async (assignmentId: number) => {
    return await axiosClient.get(`/student/assignments/${assignmentId}/quiz-result`);
  },

  getQuizQuestions: async (assignmentId: number) => {
    return await axiosClient.get(`/student/assignments/${assignmentId}/quiz-questions`);
  },

  // --- Grades ---
  getMyGrades: async (semesterId?: number, page = 0, size = 50) => {
    const semQuery = semesterId ? `&semesterId=${semesterId}` : '';
    return await axiosClient.get(`/student/grades?page=${page}&size=${size}${semQuery}`);
  },

  // --- Registration ---
  getCurrentRegistrationPeriod: async () => {
    return await axiosClient.get('/student/registration/period');
  },

  getAvailableClasses: async (search?: string, semesterId?: number, page = 0, size = 50) => {
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : '';
    const semQuery = semesterId ? `&semesterId=${semesterId}` : '';
    return await axiosClient.get(`/student/registration/classes?page=${page}&size=${size}${searchQuery}${semQuery}`);
  },

  enrollClass: async (classSectionId: number) => {
    return await axiosClient.post(`/student/registration/enroll?classSectionId=${classSectionId}`);
  },

  dropClass: async (classSectionId: number) => {
    return await axiosClient.delete(`/student/registration/drop/${classSectionId}`);
  }
};
