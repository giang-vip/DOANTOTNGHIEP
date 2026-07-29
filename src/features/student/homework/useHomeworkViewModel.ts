import { useState } from 'react';
import { useStore } from '../../../models/store';
import { Student, Assignment, Submission } from '../../../types';
import { getConsistentStudentClasses } from '../../../utils/studentClassUtils';

export function useHomeworkViewModel(studentProfile: Student) {
  const {
    classes,
    assignments,
    submissions,
    addSubmission,
    gradeSubmission
  } = useStore();

  const enrolledClassIds = getConsistentStudentClasses(classes, studentProfile).map(c => c.id);

  // Filter assignments for enrolled classes
  const homeworks = assignments.filter(a => enrolledClassIds.includes(a.classId));

  const [activeHomework, setActiveHomework] = useState<Assignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [essayContent, setEssayContent] = useState('');
  const [essayFile, setEssayFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string | null>(null);

  // Retrieve current student's submission for an assignment
  const getSubmissionForAssignment = (asmId: string): Submission | undefined => {
    return submissions.find(s => s.assignmentId === asmId && s.studentId === studentProfile.id);
  };

  const handleStartHomework = (asm: Assignment) => {
    setActiveHomework(asm);
    setAnswers({});
    setEssayContent('');
    setEssayFile(null);
    setErrors(null);
  };

  const handleFileSelect = (selected: File) => {
    setEssayFile(selected);
  };

  const handleSubmitHomework = (onSuccess: (msg: string) => void) => {
    if (!activeHomework) return;

    const isQuiz = activeHomework.type === 'quiz';
    
    if (isQuiz) {
      // Validate all answers are selected
      const keys = (activeHomework as any).correctAnswers || '';
      const keyPairs = keys.split(',').map((p: string) => p.trim().split('-'));
      const totalQuestions = keyPairs.length;

      if (Object.keys(answers).length < totalQuestions) {
        setErrors('Vui lòng hoàn thành tất cả câu hỏi trước khi nộp bài.');
        return;
      }

      // Auto Grade
      let correctCount = 0;
      keyPairs.forEach(([qNum, correctAns]: [string, string]) => {
        if (answers[qNum] === correctAns) {
          correctCount++;
        }
      });

      const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * (activeHomework.maxPoints || 10) : 10;
      const finalScore = Math.round(rawScore * 10) / 10;

      // 1. Add submission
      const subPayload: Omit<Submission, 'id' | 'submittedAt' | 'status'> = {
        assignmentId: activeHomework.id,
        classId: activeHomework.classId,
        studentId: studentProfile.id,
        studentName: studentProfile.name,
        content: `Giải trắc nghiệm: ${JSON.stringify(answers)}`,
        fileName: 'Auto-Graded Quiz Solution'
      };

      // Since addSubmission generates ID randomly, let's inject it into local storage
      const savedSubs = JSON.parse(localStorage.getItem('hn_submissions') || '[]');
      const newSubId = `SUB_${Math.floor(1000 + Math.random() * 9000)}`;
      const newSub: Submission = {
        id: newSubId,
        ...subPayload,
        submittedAt: new Date().toISOString(),
        status: 'graded', // set to graded directly
        score: finalScore,
        feedback: `Hệ thống tự động chấm: Đúng ${correctCount}/${totalQuestions} câu hỏi. Đạt điểm tối đa: ${activeHomework.maxPoints}.`
      };
      
      const updatedSubs = [...savedSubs, newSub];
      localStorage.setItem('hn_submissions', JSON.stringify(updatedSubs));

      // Also auto sync back to GradeRecord!
      const savedGrades = JSON.parse(localStorage.getItem('hn_grades') || '[]');
      const gradeId = `${activeHomework.classId}_${studentProfile.id}`;
      const updatedGrades = savedGrades.map((g: any) => {
        if (g.id === gradeId) {
          return {
            ...g,
            progressScore: finalScore
          };
        }
        return g;
      });
      localStorage.setItem('hn_grades', JSON.stringify(updatedGrades));

      // Force window state reload of store
      window.location.reload(); // Reload window to sync everything cleanly!
      onSuccess(`Đã nộp bài trắc nghiệm thành công! Bạn đạt ${finalScore} / ${activeHomework.maxPoints} điểm.`);
    } else {
      // Essay Validation
      if (!essayContent.trim() && !essayFile) {
        setErrors('Vui lòng nhập nội dung bài làm tự luận hoặc tải file bài nộp lên.');
        return;
      }

      const subPayload: Omit<Submission, 'id' | 'submittedAt' | 'status'> = {
        assignmentId: activeHomework.id,
        classId: activeHomework.classId,
        studentId: studentProfile.id,
        studentName: studentProfile.name,
        content: essayContent.trim(),
        fileName: essayFile ? essayFile.name : undefined,
        fileUrl: essayFile ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : undefined
      };

      addSubmission(subPayload);
      onSuccess('Nộp bài tự luận thành công! Trạng thái: Chờ giảng viên chấm điểm.');
      setActiveHomework(null);
    }
  };

  const enrolledClasses = getConsistentStudentClasses(classes, studentProfile);

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
    submitHomework: handleSubmitHomework
  };
}
