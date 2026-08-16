import { useState, useEffect, useMemo } from 'react';
import { studentApi } from '../../../api/services/studentApi';
import { Student, Assignment, Submission, ClassSection } from '../../../models';

export function useHomeworkViewModel(studentProfile: Student) {
  const [enrolledClasses, setEnrolledClasses] = useState<ClassSection[]>([]);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeHomework, setActiveHomework] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayContent, setEssayContent] = useState('');
  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  // Fetch enrolled classes and all assignments on mount
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const classesRes = await studentApi.getStudentClasses(0, 100);
      const classesData = (classesRes as any)?.content || [];
      setEnrolledClasses(classesData);

      const allAsms: any[] = [];
      for (const cls of classesData) {
        const asmRes = await studentApi.getAssignments(cls.id, 0, 100);
        const content = (asmRes as any)?.content || [];
        // Inject classSection info
        const formatted = content.map((a: any) => ({
          ...a,
          classId: String(cls.id),
          className: cls.subjectName
        }));
        allAsms.push(...formatted);
      }
      setHomeworks(allAsms);
    } catch (err) {
      console.error('Lỗi tải danh sách bài tập:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);

  const getSubmissionForAssignment = (asmId: string): Submission | undefined => {
    const asm = homeworks.find(h => String(h.id) === asmId);
    if (asm && asm.submissionId) {
      return {
        id: String(asm.submissionId),
        assignmentId: String(asm.id),
        classId: String(asm.classId),
        studentId: studentProfile.id,
        studentName: studentProfile.name,
        content: '',
        submittedAt: asm.submittedAt || '',
        score: asm.submissionScore,
        status: asm.submissionStatus?.toLowerCase() as any,
        feedback: asm.submissionStatus === 'GRADED' ? 'Đã chấm điểm thành công' : undefined
      };
    }
    return undefined;
  };

  const handleStartHomework = async (asm: Assignment) => {
    setActiveHomework(asm);
    setAnswers({});
    setEssayContent('');
    setEssayFile(null);
    setErrors(null);

    // If it is a quiz, call startQuiz API to initialize the session in the DB
    if (asm.type === 'quiz') {
      try {
        await studentApi.startQuiz(Number(asm.id));
        
        // Khởi tạo mock questions dựa trên questionCount của bài tập
        const qCount = asm.questionCount || 10;
        const mockQs = Array.from({ length: qCount }).map((_, i) => ({
          id: String(i + 1),
          assignmentId: asm.id,
          order: i + 1,
          points: (asm.maxPoints || 10) / qCount,
        }));
        setQuizQuestions(mockQs);

      } catch (err) {
        console.error('Lỗi khi bắt đầu Quiz:', err);
      }
    }
  };

  const loadQuizResult = async (asmId: string) => {
    try {
      const res = await studentApi.getQuizResult(Number(asmId));
      const resultData = (res as any);
      setQuizResult(resultData);
      
      const asm = homeworks.find(h => String(h.id) === asmId);

      // Reconstruct questions từ answers
      const reconstructedQs = (resultData.answers || []).map((ans: any) => ({
        id: String(ans.questionId),
        assignmentId: asmId,
        order: ans.orderIndex || 1,
        correctChoice: ans.correctChoice,
        points: ans.pointsAwarded || 0,
        explanationText: ans.explanationText,
        questionText: ans.questionText,
        choiceAText: '',
        choiceBText: '',
        choiceCText: '',
        choiceDText: '',
      }));
      setQuizQuestions(reconstructedQs);
    } catch (err) {
      console.error('Lỗi khi tải kết quả quiz:', err);
    }
  };

  const handleFileSelect = (selected: File) => {
    setEssayFile(selected);
  };

  const handleSubmitHomework = async (onSuccess: (msg: string) => void) => {
    if (!activeHomework) return;

    const isQuiz = activeHomework.type === 'quiz';
    
    if (isQuiz) {
      // Validate answers are selected
      const totalQuestions = activeHomework.questionCount || 0;
      if (Object.keys(answers).length < totalQuestions) {
        setErrors('Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.');
        return;
      }

      try {
        // Map local answer state to Backend format: list of QuizAnswerRequest
        // request payload: { answers: [ { questionId, selectedChoice } ] }
        const payloadAnswers = Object.entries(answers).map(([qId, ans]) => ({
          questionId: Number(qId),
          selectedChoice: ans
        }));

        const res = await studentApi.submitQuiz(Number(activeHomework.id), {
          answers: payloadAnswers
        });

        const score = (res as any)?.totalScore || 0;
        
        await fetchAllData();
        setActiveHomework(null);
        onSuccess(`Đã nộp bài trắc nghiệm thành công! Bạn đạt ${score} / ${activeHomework.maxPoints} điểm.`);
      } catch (err: any) {
        console.error('Lỗi nộp bài trắc nghiệm:', err);
        setErrors(err.response?.data?.message || 'Lỗi hệ thống khi nộp bài trắc nghiệm.');
      }
    } else {
      // Essay Validation
      if (!essayContent.trim()) {
        setErrors('Vui lòng nhập nội dung bài làm tự luận.');
        return;
      }

      try {
        let finalFileUrl = undefined;
        if (essayFile) {
          const uploadRes = await studentApi.uploadFile(essayFile);
          finalFileUrl = (uploadRes as any); // Assuming ApiResponse.result is the string
        }

        await studentApi.submitAssignment(Number(activeHomework.id), {
          content: essayContent.trim(),
          fileUrl: finalFileUrl
        });

        await fetchAllData();
        setActiveHomework(null);
        onSuccess('Nộp bài tự luận thành công! Trạng thái: Chờ giảng viên chấm điểm.');
      } catch (err: any) {
        console.error('Lỗi nộp bài tự luận:', err);
        setErrors(err.response?.data?.message || 'Lỗi hệ thống khi nộp bài tự luận.');
      }
    }
  };

  return {
    homeworks,
    enrolledClasses,
    activeHomework,
    setActiveHomework,
    answers,
    setAnswers,
    essayContent,
    setEssayContent,
    errors,
    getSubmissionForAssignment,
    startHomework: handleStartHomework,
    handleFileSelect,
    submitHomework: handleSubmitHomework,
    loading,
    quizQuestions,
    quizResult,
    loadQuizResult
  };
}
