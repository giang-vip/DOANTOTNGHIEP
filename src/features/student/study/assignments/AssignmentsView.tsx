import React from 'react';
import { useAssignmentsViewModel } from './useAssignmentsViewModel';
import { Card, Badge, Modal } from '../../../../components/UI';
import { Eye, RefreshCw } from 'lucide-react';
import { Student, ClassSection, Assignment } from '../../../../models';
import { QuizTakingView } from './QuizTakingView';
import { QuizReviewPanel } from '../../../../components/QuizReviewPanel';

export interface AssignmentsViewProps {
  studentProfile: Student;
  selectedClass: ClassSection;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
  onPendingUpdate: () => void;
}

export function AssignmentsView({
  studentProfile,
  selectedClass,
  triggerToast,
  onPendingUpdate
}: AssignmentsViewProps) {
  const {
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
    handleQuizSubmit
  } = useAssignmentsViewModel(studentProfile, selectedClass, triggerToast, onPendingUpdate);

  const getAssignmentStatus = (asm: Assignment) => {
    const sub = submissionsList.find(s => s.assignmentId === String(asm.id) && String(s.studentId) === String(studentProfile.id));
    if (!sub) return { label: 'Chưa làm', variant: 'gray' as const, submitted: false };
    if (sub.status === 'graded') return { label: `Đã chấm: ${sub.score}đ`, variant: 'success' as const, submitted: true, graded: true, feedback: sub.feedback, submission: sub };
    return { label: 'Đã nộp, chờ chấm', variant: 'info' as const, submitted: true, graded: false, submission: sub };
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="p-8 text-center text-slate-400">Đang tải dữ liệu bài tập...</div>
      ) : assignments.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400 font-medium">
          Lớp học phần này chưa có bài tập trực tuyến nào từ giảng viên.
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((asm) => {
            const status = getAssignmentStatus(asm);
            const isQuiz = asm.type === 'quiz' || (asm as any).type === 'quiz';
            
            return (
              <Card key={asm.id} className="p-5 hover:border-slate-300 transition-all bg-white shadow-3xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-850">{asm.title}</h4>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant="gray">Loại: {isQuiz ? 'Trắc nghiệm' : 'Tự luận'}</Badge>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Hạn nộp bài: {new Date(asm.dueDate).toLocaleString('vi-VN')} • Thang điểm tối đa: {asm.maxPoints}đ
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {!status.submitted && (
                      <button
                        onClick={() => {
                          if (isQuiz) {
                            handleStartQuiz(asm);
                          } else {
                            setSelectedAssignment(asm);
                            setEssayAnswer('');
                          }
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {isQuiz ? 'Bắt đầu làm bài trắc nghiệm' : 'Làm bài nộp'}
                      </button>
                    )}

                    {status.submitted && !isQuiz && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(asm);
                          setEssayAnswer(status.submission?.content || '');
                        }}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3" /> Nộp lại bài
                      </button>
                    )}

                    {status.submitted && isQuiz && (
                      <button
                        onClick={() => handleReviewQuiz(asm)}
                        className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="h-3 w-3" /> Xem lại bài
                      </button>
                    )}
                  </div>
                </div>

                {status.feedback && (
                  <div className="mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-xs text-blue-900">
                    <strong className="block mb-0.5 text-[10px] uppercase text-blue-600/80">Nhận xét của GV:</strong>
                    {status.feedback}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Homework Overlay */}
      {selectedAssignment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAssignment(null)}
          title={`Nộp bài tập: ${selectedAssignment.title}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <h4 className="font-bold text-slate-700">Mô tả yêu cầu từ Giảng viên:</h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedAssignment.description}</p>
              
              {selectedAssignment.examFileUrl && (
                <a
                  href={selectedAssignment.examFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline mt-2 font-bold"
                >
                  <Eye className="h-3.5 w-3.5" /> Xem tệp đề bài đính kèm
                </a>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Soạn lời giải hoặc nội dung bài làm trực tiếp:</label>
              <textarea
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                className="w-full min-h-[350px] p-4 border border-slate-200 rounded-xl text-sm resize-y focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50"
                placeholder="Nhập nội dung bài làm của bạn vào đây..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Hoặc đính kèm tệp tin bài làm (PDF, Word, Excel, ZIP...):</label>
              <input
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEssayFile(e.target.files[0]);
                  }
                }}
                className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-200 rounded-lg w-full bg-slate-50/50"
              />
              {essayFile && (
                <p className="text-[10px] text-emerald-600 font-semibold">Tệp đã chọn: {essayFile.name}</p>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 gap-2">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleHomeworkSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-blue-200"
              >
                Nộp Bài Lên Hệ Thống
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Quiz Screen Overlay */}
      {activeQuiz && !isReviewMode && (
        <QuizTakingView
          assignment={activeQuiz}
          questions={quizQuestions}
          onCancel={() => setActiveQuiz(null)}
          onSubmit={handleQuizSubmit as any}
        />
      )}

      {/* Quiz Review Overlay */}
      {activeQuiz && isReviewMode && quizResult && (
        <QuizReviewPanel
          mode="result"
          assignment={activeQuiz}
          answers={quizResult?.answers || []}
          totalScore={quizResult?.score || 0}
          questions={quizQuestions}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
