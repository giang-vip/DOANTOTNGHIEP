import { useState, useEffect } from 'react';
import { studentApi } from '../../../../api/services/studentApi';
import { Assignment, Submission, QuizQuestion, Student, ClassSection } from '../../../../models';

export function useAssignmentsViewModel(
  studentProfile: Student,
  selectedClass: ClassSection,
  triggerToast: (msg: string, type: 'success' | 'danger') => void,
  onPendingUpdate: () => void
) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);

  // Homework details states
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [essayFile, setEssayFile] = useState<File | null>(null);

  // Quiz states
  const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizResult, setQuizResult] = useState<any>(null);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getAssignments(Number(selectedClass.id), 0, 100);
      const newAsms = (res as any)?.content || [];
      setAssignments(newAsms);

      const subs = newAsms.map((a: any) => {
        if (a.submissionId || a.submissionStatus) {
          return {
            id: String(a.submissionId || a.id),
            assignmentId: String(a.id),
            classId: String(selectedClass.id),
            studentId: studentProfile.id,
            studentName: studentProfile.fullName,
            content: '',
            submittedAt: a.submittedAt || '',
            score: a.submissionScore,
            status: a.submissionStatus?.toLowerCase() || 'submitted'
          };
        }
        return null;
      }).filter(Boolean) as Submission[];
      setSubmissionsList(subs);

      // Call parent to refresh pending dot if necessary
      onPendingUpdate();
    } catch (err) {
      console.error('Lỗi tải bài tập:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [selectedClass.id]);

  const handleHomeworkSubmit = async () => {
    if (!selectedAssignment) return;

    if (!essayAnswer.trim() && !essayFile) {
      triggerToast('Vui lòng nhập lời giải hoặc đính kèm file trước khi nộp bài!', 'danger');
      return;
    }

    try {
      let finalFileUrl = undefined;
      if (essayFile) {
        const uploadRes = await studentApi.uploadFile(essayFile);
        finalFileUrl = (uploadRes as any);
      }

      await studentApi.submitAssignment(Number(selectedAssignment.id), {
        content: essayAnswer.trim(),
        fileUrl: finalFileUrl
      });

      setEssayAnswer('');
      setEssayFile(null);
      setSelectedAssignment(null);
      
      triggerToast('Nộp bài tập tự luận thành công! Trạng thái: Chờ chấm điểm.', 'success');
      await loadAssignments();
    } catch (err: any) {
      console.error('Lỗi nộp bài tập:', err);
      triggerToast(err.response?.data?.message || 'Lỗi hệ thống khi nộp bài tập.', 'danger');
    }
  };

  const handleStartQuiz = async (asm: Assignment) => {
    try {
      await studentApi.startQuiz(Number(asm.id));
      
      // Load real questions from backend
      const qsRes = await studentApi.getQuizQuestions(Number(asm.id));
      const realQs = ((qsRes as any) || []).map((q: any) => ({
        id: String(q.id),
        assignmentId: String(q.assignmentId),
        order: q.orderIndex || 1,
        questionText: q.questionText,
        choiceAText: q.choiceAText,
        choiceBText: q.choiceBText,
        choiceCText: q.choiceCText,
        choiceDText: q.choiceDText,
        points: q.points || 0
      })) as QuizQuestion[];

      if (realQs.length === 0) {
        triggerToast('Đề thi này chưa có cấu hình câu hỏi.', 'warning');
        return;
      }

      setQuizQuestions(realQs);
      setActiveQuiz(asm);
      setIsReviewMode(false);
      triggerToast(`Đã bắt đầu làm bài trắc nghiệm: ${asm.title}.`, 'success');
    } catch (err: any) {
      console.error('Lỗi khi bắt đầu bài thi:', err);
      triggerToast(err.response?.data?.message || 'Không thể tải đề thi từ hệ thống.', 'danger');
    }
  };

  const handleReviewQuiz = async (asm: Assignment) => {
    try {
      const res = await studentApi.getQuizResult(Number(asm.id));
      const resultData = (res as any);
      setQuizResult(resultData);

      const reconstructedQs = (resultData.answers || []).map((ans: any) => ({
        id: String(ans.questionId),
        assignmentId: asm.id,
        order: ans.orderIndex || 1,
        correctChoice: ans.correctChoice,
        points: ans.pointsAwarded || 0,
        explanationText: ans.explanationText,
        questionText: ans.questionText,
      })) as QuizQuestion[];

      setQuizQuestions(reconstructedQs);
      setActiveQuiz(asm);
      setIsReviewMode(true);
    } catch (err: any) {
      triggerToast(err.response?.data?.message || 'Lỗi khi tải kết quả.', 'danger');
    }
  };

  const handleQuizSubmit = async (userAnswers: { questionId: string; selectedChoice: string | null }[]) => {
    if (!activeQuiz) return;
    try {
      const payload = {
        answers: userAnswers.map(a => ({
          questionId: Number(a.questionId),
          selectedChoice: a.selectedChoice || ''
        }))
      };

      await studentApi.submitQuiz(Number(activeQuiz.id), payload);
      triggerToast(`Nộp bài trắc nghiệm thành công!`, 'success');
      setActiveQuiz(null);
      await loadAssignments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi kết nối, vui lòng thử nộp lại.';
      triggerToast(msg, 'danger');
    }
  };

  return {
    assignments,
    submissionsList,
    loading,
    selectedAssignment,
    setSelectedAssignment,
    essayAnswer,
    setEssayAnswer,
    essayFile,
    setEssayFile,
    handleHomeworkSubmit,
    activeQuiz,
    setActiveQuiz,
    isReviewMode,
    quizQuestions,
    quizResult,
    handleStartQuiz,
    handleReviewQuiz,
    handleQuizSubmit,
    loadAssignments
  };
}
