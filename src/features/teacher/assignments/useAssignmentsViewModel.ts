import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { ClassSection, Assignment, Submission } from '../../../types';

export function useAssignmentsViewModel(teacherId: string) {
  const {
    classes,
    assignments,
    submissions,
    addAssignment,
    deleteAssignment,
    gradeSubmission,
    addSubmission
  } = useStore();

  const myClasses = classes.filter(c => c.teacherId === teacherId);

  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
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
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Test Solve states
  const [isTestSolving, setIsTestSolving] = useState(false);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  // Set default class
  useEffect(() => {
    if (myClasses.length > 0 && !selectedClass) {
      setSelectedClass(myClasses[0]);
    }
  }, [classes]);

  // Set default assignment when class changes
  useEffect(() => {
    if (selectedClass) {
      const classAsms = assignments.filter(a => a.classId === selectedClass.id);
      if (classAsms.length > 0) {
        setSelectedAssignment(classAsms[0]);
      } else {
        setSelectedAssignment(null);
      }
    }
  }, [selectedClass, assignments]);

  const classAssignments = selectedClass
    ? assignments.filter(a => a.classId === selectedClass.id)
    : [];

  const currentSubmissions = selectedAssignment
    ? submissions.filter(s => s.assignmentId === selectedAssignment.id)
    : [];

  const openAddModal = () => {
    setTitle('');
    setDescription('');
    setDueDate(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16)); // 1 week later
    setMaxPoints(10);
    setAsmType('quiz');
    setExamFileUrl('');
    setExamFileName('');
    setExamFileType('pdf');
    setQuestionCount(4);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCreateAssignment = (onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề bài tập';
    if (!description.trim()) tempErrors.description = 'Vui lòng nhập hướng dẫn chi tiết';
    if (!dueDate) tempErrors.dueDate = 'Vui lòng chọn thời hạn nộp bài';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    addAssignment({
      classId: selectedClass.id,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      maxPoints,
      type: asmType,
      examFileUrl: examFileUrl || undefined,
      examFileName: examFileName || undefined,
      examFileType: examFileType || undefined,
      questionCount: questionCount || 1
    });

    setIsModalOpen(false);
    onSuccess(`Đã tạo bài tập "${title}" thành công!`);
  };

  const handleDeleteAssignment = (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc muốn xóa bài tập "${name}"? Mọi dữ liệu nộp bài của sinh viên sẽ bị mất.`)) {
      deleteAssignment(id);
      onSuccess('Đã xóa bài tập thành công.');
    }
  };

  const handleOpenGradeModal = (sub: Submission) => {
    setActiveSubmission(sub);
    setGradeScore(sub.score ?? selectedAssignment?.maxPoints ?? 10);
    setGradeFeedback(sub.feedback ?? '');
  };

  const handleSaveGrade = (onSuccess: (msg: string) => void) => {
    if (!activeSubmission) return;

    gradeSubmission(activeSubmission.id, gradeScore, gradeFeedback);
    setActiveSubmission(null);
    onSuccess(`Đã chấm điểm cho sinh viên ${activeSubmission.studentName} thành công!`);
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

    const isQuiz = selectedAssignment.type === 'quiz';
    if (isQuiz) {
      // Compare answers
      const keys = (selectedAssignment as any).correctAnswers || '';
      const keyPairs = keys.split(',').map((p: string) => p.trim().split('-'));
      
      let correctCount = 0;
      let totalQuestions = keyPairs.length;

      keyPairs.forEach(([qNum, correctAns]: [string, string]) => {
        if (testAnswers[qNum] === correctAns) {
          correctCount++;
        }
      });

      const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * (selectedAssignment.maxPoints || 10) : 10;
      const finalScore = Math.round(rawScore * 10) / 10;

      setTestResult(`KẾT QUẢ GIẢI THỬ: Bạn trả lời đúng ${correctCount}/${totalQuestions} câu hỏi. Hệ thống tự động chấm: ${finalScore}/${selectedAssignment.maxPoints || 10} điểm!`);
    } else {
      setTestResult(`Nộp bài tự luận thành công! Trạng thái bài làm của bạn đã chuyển sang "Chờ chấm điểm".`);
    }

    onSuccess('Đã nộp bài giải thử thành công!');
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    assignments: classAssignments,
    selectedAssignment,
    setSelectedAssignment,
    submissions: currentSubmissions,
    isModalOpen,
    setIsModalOpen,
    openAddModal,
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
    submitTestSolve: handleSubmitTestSolve
  };
}
