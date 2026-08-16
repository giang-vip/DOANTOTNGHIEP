import { useState, useEffect } from 'react';
import { teacherApi } from '../../../api/services/teacherApi';

/**
 * ViewModel cho quản lý Bài tập & Trắc nghiệm (Assignments & Quizzes) của Giảng viên.
 * Tích hợp toàn bộ API Get/Create/Delete/Grade.
 */
export function useAssignmentsViewModel(teacherId: string) {
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxPoints, setMaxPoints] = useState(10);
  const [asmType, setAsmType] = useState<'quiz' | 'essay'>('quiz');
  const [examFileUrl, setExamFileUrl] = useState('');
  const [examFileName, setExamFileName] = useState('');
  const [examFileType, setExamFileType] = useState<'pdf' | 'image'>('pdf');
  const [questionCount, setQuestionCount] = useState(4);

  // Grading states
  const [activeSubmission, setActiveSubmission] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Test Solve states
  const [isTestSolving, setIsTestSolving] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  const getClassId = (cls: any): number => {
    return Number(cls.id);
  };

  // 1. Fetch danh sách lớp của GV
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const res: any = await teacherApi.getMyClasses();
        const items = res.content || res || [];
        setMyClasses(items);
        if (items.length > 0 && !selectedClass) {
          setSelectedClass(items[0]);
        }
      } catch (err) {
        console.error('Lỗi lấy lớp học phần:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [teacherId]);

  // 2. Fetch danh sách bài tập khi selectedClass đổi
  const fetchClassAssignments = async () => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);
    try {
      setIsLoadingAssignments(true);
      const res: any = await teacherApi.getAssignments(classId);
      const items = res.content || res || [];
      const mapped = items.map((a: any) => ({
        id: String(a.id),
        classId: String(a.classSectionId),
        title: a.title,
        description: a.description,
        dueDate: a.dueAt,
        maxPoints: Number(a.maxPoints),
        type: a.type === 'quiz' ? 'quiz' : 'essay',
        examFileUrl: a.examFileUrl,
        examFileName: a.examFileName,
        examFileType: a.examFileType,
        questionCount: a.questionCount
      }));
      setAssignments(mapped);
      
      if (mapped.length > 0) {
        setSelectedAssignment(mapped[0]);
      } else {
        setSelectedAssignment(null);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách bài tập:', err);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  useEffect(() => {
    fetchClassAssignments();
  }, [selectedClass]);

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // 3. Fetch danh sách bài nộp và câu hỏi trắc nghiệm khi selectedAssignment đổi
  const fetchSubmissionsAndQuestions = async () => {
    if (!selectedAssignment) {
      setSubmissions([]);
      setQuizQuestions([]);
      return;
    }
    
    // Fetch submissions
    try {
      setIsLoadingSubmissions(true);
      const res: any = await teacherApi.getSubmissions(Number(selectedAssignment.id));
      const items = res.content || res || [];
      const mapped = items.map((s: any) => ({
        id: String(s.id),
        assignmentId: String(s.assignmentId),
        studentId: s.studentCode,
        studentName: s.studentName,
        submittedAt: s.submittedAt,
        content: s.content,
        fileUrl: s.fileUrl,
        score: s.score != null ? Number(s.score) : undefined,
        feedback: s.feedback || '',
        status: s.status === 'graded' ? 'graded' : 'pending'
      }));
      setSubmissions(mapped);
    } catch (err) {
      console.error('Lỗi lấy danh sách bài nộp:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }

    // Fetch quiz questions if type is quiz
    if (selectedAssignment.type === 'quiz') {
      try {
        const res: any = await teacherApi.getQuizQuestions(Number(selectedAssignment.id));
        const mapped = (res || []).map((q: any) => ({
          id: String(q.id),
          assignmentId: String(q.assignmentId),
          order: q.orderIndex,
          correctChoice: q.correctChoice,
          points: q.points,
          explanationText: q.explanationText || '',
          questionText: q.questionText || '',
          choiceAText: q.choiceAText || 'A',
          choiceBText: q.choiceBText || 'B',
          choiceCText: q.choiceCText || 'C',
          choiceDText: q.choiceDText || 'D'
        }));
        setQuizQuestions(mapped);
      } catch (err) {
        console.error('Lỗi lấy câu hỏi trắc nghiệm:', err);
        setQuizQuestions([]);
      }
    } else {
      setQuizQuestions([]);
    }
  };

  useEffect(() => {
    fetchSubmissionsAndQuestions();
  }, [selectedAssignment]);

  // Lưu đề trắc nghiệm
  const handleConfigureQuiz = async (newQuestions: any[], onSuccess: (msg: string) => void) => {
    if (!selectedAssignment) return;
    try {
      const formattedQuestions = newQuestions.map(q => ({
        orderIndex: q.order,
        questionText: q.questionText || `Câu hỏi số ${q.order}`,
        choiceAText: q.choiceAText || 'A',
        choiceBText: q.choiceBText || 'B',
        choiceCText: q.choiceCText || 'C',
        choiceDText: q.choiceDText || 'D',
        correctChoice: q.correctChoice,
        points: q.points || 1
      }));

      await teacherApi.configureQuiz(Number(selectedAssignment.id), formattedQuestions);
      onSuccess('Đã cấu hình đề thi trắc nghiệm thành công!');
      
      // Reload questions
      const res: any = await teacherApi.getQuizQuestions(Number(selectedAssignment.id));
      const mapped = (res || []).map((q: any) => ({
        id: String(q.id),
        assignmentId: String(q.assignmentId),
        order: q.orderIndex,
        correctChoice: q.correctChoice,
        points: q.points,
        explanationText: q.explanationText || '',
        questionText: q.questionText || '',
        choiceAText: q.choiceAText || 'A',
        choiceBText: q.choiceBText || 'B',
        choiceCText: q.choiceCText || 'C',
        choiceDText: q.choiceDText || 'D'
      }));
      setQuizQuestions(mapped);
    } catch (err) {
      console.error('Lỗi cấu hình đề thi:', err);
    }
  };

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16)); // 1 tuần sau
    setMaxPoints(10);
    setAsmType('quiz');
    setExamFileUrl('');
    setExamFileName('');
    setExamFileType('pdf');
    setQuestionCount(4);
    setErrors({});
    setIsModalOpen(true);
  };

  // Tạo bài tập mới
  const handleCreateAssignment = async (onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề bài tập';
    if (!description.trim()) tempErrors.description = 'Vui lòng nhập hướng dẫn chi tiết';
    if (!dueDate) tempErrors.dueDate = 'Vui lòng chọn thời hạn nộp bài';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      const classId = getClassId(selectedClass);
      await teacherApi.createAssignment(classId, {
        title: title.trim(),
        description: description.trim(),
        dueAt: new Date(dueDate).toISOString(),
        maxPoints: maxPoints,
        type: asmType,
        examFileUrl: examFileUrl || undefined,
        examFileName: examFileName || undefined,
        examFileType: examFileType || undefined,
        questionCount: questionCount || 1
      });

      setIsModalOpen(false);
      onSuccess(`Đã tạo bài tập "${title}" thành công!`);
      fetchClassAssignments();
    } catch (err: any) {
      console.error('Lỗi tạo bài tập:', err);
    }
  };

  // Xóa bài tập
  const handleDeleteAssignment = async (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc muốn xóa bài tập "${name}"? Mọi dữ liệu nộp bài của sinh viên sẽ bị mất.`)) {
      try {
        await teacherApi.deleteAssignment(Number(id));
        onSuccess('Đã xóa bài tập thành công.');
        fetchClassAssignments();
      } catch (err) {
        console.error('Lỗi xóa bài tập:', err);
      }
    }
  };

  const handleOpenGradeModal = (sub: any) => {
    setActiveSubmission(sub);
    setGradeScore(sub.score ?? selectedAssignment?.maxPoints ?? 10);
    setGradeFeedback(sub.feedback ?? '');
  };

  // Chấm điểm
  const handleSaveGrade = async (onSuccess: (msg: string) => void) => {
    if (!activeSubmission) return;

    try {
      await teacherApi.gradeSubmission(Number(activeSubmission.id), {
        score: gradeScore,
        feedback: gradeFeedback
      });
      setActiveSubmission(null);
      onSuccess(`Đã chấm điểm cho sinh viên ${activeSubmission.studentName} thành công!`);
      fetchSubmissionsAndQuestions();
    } catch (err) {
      console.error('Lỗi lưu điểm chấm:', err);
    }
  };

  // Test Solve triggers
  const handleStartTestSolve = () => {
    setIsTestSolving(true);
    setTestAnswers({});
    setTestResult(null);
  };

  const handleCancelTestSolve = () => {
    setIsTestSolving(false);
    setTestAnswers({});
    setTestResult(null);
  };

  const handleSubmitTestSolve = (onSuccess: (msg: string) => void) => {
    if (!selectedAssignment) return;

    const isQuiz = selectedAssignment.type === 'quiz' || (selectedAssignment as any).type === 'tracnghiem';
    if (isQuiz) {
      const activeQs = quizQuestions.filter(q => q.assignmentId === selectedAssignment.id);
      let correctCount = 0;
      let totalQuestions = activeQs.length > 0 ? activeQs.length : (selectedAssignment.questionCount || 4);

      if (activeQs.length > 0) {
        activeQs.forEach(q => {
          if (testAnswers[q.order] === q.correctChoice) {
            correctCount++;
          }
        });
      } else {
        // Fallback mockup correct answers comparison if no actual database questions are configured yet
        for (let i = 1; i <= totalQuestions; i++) {
          if (testAnswers[i] === 'A') { // Mock all correct answers are A
            correctCount++;
          }
        }
      }

      const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * (selectedAssignment.maxPoints || 10) : 10;
      const finalScore = Math.round(rawScore * 10) / 10;

      setTestResult(`KẾT QUẢ GIẢI THỬ TRẮC NGHIỆM: Bạn trả lời đúng ${correctCount}/${totalQuestions} câu hỏi. Hệ thống tự động chấm: ${finalScore}/${selectedAssignment.maxPoints || 10} điểm!`);
    } else {
      // Essay submission simulation output
      const fileUploadedName = testAnswers['essayFileName'];
      const linkSubmitted = testAnswers['essayLink'];
      let msg = 'Nộp bài tự luận thành công! Trạng thái bài làm của bạn đã chuyển sang "Chờ chấm điểm".';
      if (fileUploadedName) {
        msg += `\n• Đính kèm tệp tin bài làm: ${fileUploadedName}`;
      }
      if (linkSubmitted) {
        msg += `\n• Liên kết bài nộp: ${linkSubmitted}`;
      }
      setTestResult(msg);
    }

    onSuccess('Đã nộp bài giải thử thành công!');
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    assignments,
    selectedAssignment,
    setSelectedAssignment,
    submissions,
    quizQuestions,
    configureQuiz: handleConfigureQuiz,
    isModalOpen,
    setIsModalOpen,
    openAddModal,
    fetchClassAssignments,
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    maxPoints,
    setMaxPoints,
    asmType,
    setAsmType,
    examFileUrl,
    setExamFileUrl,
    examFileName,
    setExamFileName,
    examFileType,
    setExamFileType,
    questionCount,
    setQuestionCount,
    errors,
    createAssignment: handleCreateAssignment,
    deleteAssignment: handleDeleteAssignment,
    // Grading
    activeSubmission,
    setActiveSubmission,
    gradeScore,
    setGradeScore,
    gradeFeedback,
    setGradeFeedback,
    openGradeModal: handleOpenGradeModal,
    saveGrade: handleSaveGrade,
    // Test solve
    isTestSolving,
    testAnswers,
    setTestAnswers,
    testResult,
    startTestSolve: handleStartTestSolve,
    cancelTestSolve: handleCancelTestSolve,
    submitTestSolve: handleSubmitTestSolve,
    isLoading: isLoadingClasses || isLoadingAssignments || isLoadingSubmissions
  };
}
