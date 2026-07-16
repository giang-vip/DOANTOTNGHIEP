import React, { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { Student, LearningMaterial, ClassSection, Assignment, Submission, AttendanceRecord, AttendanceSession } from '../../../types';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export function useStudyViewModel(studentProfile: Student) {
  const {
    classes,
    materials,
    assignments,
    submissions,
    attendanceSessions,
    attendanceRecords,
    addSubmission,
    updateAttendanceRecords
  } = useStore();

  const enrolledClasses = classes.filter(c => c.studentIds.includes(studentProfile.id));

  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments' | 'attendance'>('materials');

  // Homework details states
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

  // AI Buddy states
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: `👋 Chào bạn! Mình là **Hưng Nhân AI Study Buddy**. Mình có thể giúp bạn giải thích lý thuyết, gợi ý cách giải bài tập hoặc thảo luận kiến thức chuyên sâu. Bạn hãy nhập câu hỏi bên dưới nhé!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter materials for enrolled classes
  const activeClassMaterials = selectedClass
    ? materials.filter(m => m.classId === selectedClass.id && m.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Filter assignments for selected class
  const activeClassAssignments = selectedClass
    ? assignments.filter(a => a.classId === selectedClass.id)
    : [];

  // Filter submissions for this student in selected class
  const studentSubmissions = selectedClass
    ? submissions.filter(s => s.studentId === studentProfile.id && activeClassAssignments.map(a => a.id).includes(s.assignmentId))
    : [];

  // Filter attendance records for this student and selected class
  const classSessionIds = selectedClass
    ? attendanceSessions.filter(s => s.classId === selectedClass.id).map(s => s.id)
    : [];
  const studentAttendanceRecords = selectedClass
    ? attendanceRecords.filter(r => r.classId === selectedClass.id && r.studentId === studentProfile.id && classSessionIds.includes(r.sessionId))
    : [];

  // All sessions for this class
  const classSessions = React.useMemo(() => {
    return selectedClass
      ? attendanceSessions.filter(s => s.classId === selectedClass.id)
      : [];
  }, [attendanceSessions, selectedClass]);

  // Active open roll-call sessions
  const activeRollCallSessions = React.useMemo(() => {
    return classSessions.filter(s => s.status === 'open');
  }, [classSessions]);

  // Check if student already checked in for a specific session
  const hasCheckedIn = (sessionId: string) => attendanceRecords.some(r => r.sessionId === sessionId && r.studentId === studentProfile.id);

  const handleCheckIn = (sessionId: string, method: 'gps' | 'face', triggerToast: (msg: string, type: 'success' | 'danger') => void) => {
    if (!selectedClass) {
      triggerToast('Không tìm thấy lớp học phần!', 'danger');
      return;
    }

    if (hasCheckedIn(sessionId)) {
      triggerToast('Bạn đã điểm danh thành công cho buổi học này rồi!', 'danger');
      return;
    }

    // Call store update
    updateAttendanceRecords([{
      sessionId: sessionId,
      classId: selectedClass.id,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      status: 'present'
    }]);

    triggerToast(`Điểm danh thành công bằng ${method === 'gps' ? 'GPS Định Vị' : 'Face ID Sinh Trắc Học'}!`, 'success');
  };

  const handleHomeworkSubmit = (triggerToast: (msg: string, type: 'success' | 'danger') => void) => {
    if (!selectedAssignment) return;

    const isQuiz = (selectedAssignment as any).type === 'tracnghiem';
    let content = '';

    if (isQuiz) {
      // Encode answers as string: "1-a,2-b"
      const ansArr = Object.entries(quizAnswers).map(([q, a]) => `${q}-${a}`);
      if (ansArr.length === 0) {
        triggerToast('Vui lòng chọn ít nhất một câu trả lời!', 'danger');
        return;
      }
      content = ansArr.join(',');
    } else {
      if (!essayAnswer.trim()) {
        triggerToast('Vui lòng nhập lời giải trước khi nộp bài!', 'danger');
        return;
      }
      content = essayAnswer.trim();
    }

    // Submit payload
    addSubmission({
      assignmentId: selectedAssignment.id,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      content,
    });

    setEssayAnswer('');
    setQuizAnswers({});
    setSelectedAssignment(null);
    triggerToast('Nộp bài tập thành công! Trạng thái: Chờ chấm điểm.', 'success');
  };

  const sendAIChat = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          subjectName: selectedClass?.subjectName || 'Công nghệ thông tin'
        })
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ AI');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        text: data.text || 'Trợ lý AI đang bận, xin vui lòng thử hỏi lại sau ít phút.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Study Buddy Error:', err);
      const errorMsg: Message = {
        id: `ai_error_${Date.now()}`,
        role: 'ai',
        text: '❌ **Lỗi kết nối:** Không thể truy cập máy chủ AI. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    enrolledClasses,
    selectedClass,
    setSelectedClass,
    materials: activeClassMaterials,
    assignments: activeClassAssignments,
    submissions: studentSubmissions,
    attendanceRecords: studentAttendanceRecords,
    activeRollCallSessions,
    classSessions,
    hasCheckedIn,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedAssignment,
    setSelectedAssignment,
    essayAnswer,
    setEssayAnswer,
    quizAnswers,
    setQuizAnswers,
    checkIn: handleCheckIn,
    submitHomework: handleHomeworkSubmit,
    // AI buddy
    chatInput,
    setChatInput,
    messages,
    isLoading,
    sendAIChat
  };
}
