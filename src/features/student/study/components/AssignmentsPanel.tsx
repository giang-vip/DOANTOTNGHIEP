import React from 'react';
import { Card, Badge } from '../../../../components/UI';
import { Eye, RefreshCw } from 'lucide-react';
import { Assignment, Submission, Student } from '../../../../types';

/**
 * Interface props cho component AssignmentsPanel.
 */
export interface AssignmentsPanelProps {
  /** Danh sách bài tập */
  assignments: Assignment[];
  /** Danh sách nộp bài */
  submissions: Submission[];
  /** Thông tin hồ sơ sinh viên */
  studentProfile: Student;
  /** Hàm callback để mở bài làm trắc nghiệm */
  handleStartQuiz: (asm: Assignment) => void;
  /** Hàm callback để mở xem lại bài trắc nghiệm */
  handleReviewQuiz: (asm: Assignment) => void;
  /** Hàm callback để mở bài tập tự luận */
  setSelectedAssignment: (asm: Assignment | null) => void;
  /** Hàm callback để lưu nội dung bài làm tự luận */
  setEssayAnswer: (val: string) => void;
}

/**
 * Component hiển thị danh sách Bài tập trực tuyến (AssignmentsPanel).
 * Hỗ trợ làm bài trắc nghiệm, nộp bài tự luận, nộp lại bài luận và xem nhận xét/điểm của GV.
 */
export function AssignmentsPanel({
  assignments,
  submissions,
  studentProfile,
  handleStartQuiz,
  handleReviewQuiz,
  setSelectedAssignment,
  setEssayAnswer,
}: AssignmentsPanelProps) {

  /**
   * Tính toán trạng thái bài tập của sinh viên dựa trên bài nộp hiện tại
   */
  const getAssignmentStatus = (asm: Assignment) => {
    const sub = submissions.find(s => s.assignmentId === asm.id && s.studentId === studentProfile.id);
    if (!sub) return { label: 'Chưa làm', variant: 'gray' as const, submitted: false };
    if (sub.status === 'graded') return { label: `Đã chấm: ${sub.score}đ`, variant: 'success' as const, submitted: true, graded: true, feedback: sub.feedback, submission: sub };
    return { label: 'Đã nộp, chờ chấm', variant: 'info' as const, submitted: true, graded: false, submission: sub };
  };

  return (
    <div className="space-y-4">
      {/* Tiêu đề vùng làm bài */}
      <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Yêu cầu bài tập học tập trực tuyến</h3>

      {assignments.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400 font-medium">
          Lớp học phần này chưa có bài tập trực tuyến nào từ giảng viên.
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((asm) => {
            const status = getAssignmentStatus(asm);
            const isQuiz = (asm as any).type === 'quiz';
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

                  {/* Nút thao tác làm / nộp bài */}
                  <div className="flex gap-2 shrink-0">
                    {/* Trường hợp 1: Chưa làm bài */}
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

                    {/* Trường hợp 2: Đã nộp tự luận (cho phép nộp đè bài mới trước khi chấm) */}
                    {status.submitted && !isQuiz && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(asm);
                          setEssayAnswer(status.submission?.content || '');
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Nộp lại bài tập
                      </button>
                    )}

                    {/* Trường hợp 3: Đã nộp trắc nghiệm (cho phép xem lại chi tiết bài giải) */}
                    {status.submitted && isQuiz && (
                      <button
                        onClick={() => handleReviewQuiz(asm)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> Xem lại bài thi
                      </button>
                    )}
                  </div>
                </div>

                {/* Hiển thị tóm tắt bài làm đã nộp bên dưới */}
                {status.submitted && (
                  <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Nội dung bài làm đã nộp:</span>
                    <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{status.submission?.content}</p>
                    {status.graded && status.feedback && (
                      <div className="pt-2 border-t border-slate-200 mt-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide block">Nhận xét của giảng viên:</span>
                        <p className="text-xs text-slate-600 italic font-medium mt-0.5">"{status.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
