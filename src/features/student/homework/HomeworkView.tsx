import React, { useState } from 'react';
import { useHomeworkViewModel } from './useHomeworkViewModel';
import { Card, Table, Badge, FormInput, FileUploader, Modal } from '../../../components/UI';
import { ExamReviewView } from '../../../components/ExamReviewView';
import { Student, Assignment } from '../../../types';
import { FileEdit, BookOpen, AlertCircle, CheckCircle2, Award, Clock, ArrowLeft, Upload, FileCheck, FileQuestion, ChevronDown } from 'lucide-react';

interface HomeworkViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function HomeworkView({ studentProfile, triggerToast }: HomeworkViewProps) {
  const {
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
    startHomework,
    handleFileSelect,
    submitHomework
  } = useHomeworkViewModel(studentProfile);

  // Read-only submission view state
  const [viewSubmission, setViewSubmission] = useState<any | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const filteredHomeworks = selectedClassId === 'all'
    ? homeworks
    : homeworks.filter(h => h.classId === selectedClassId);

  const onSubmitAction = () => {
    submitHomework((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã HP',
      accessor: (asm: Assignment) => <span className="font-mono font-bold text-slate-850">{asm.classId}</span>
    },
    {
      header: 'Tiêu Đề Bài Tập',
      accessor: (asm: Assignment) => {
        const isQuiz = (asm as any).type === 'tracnghiem';
        return (
          <div className="space-y-1">
            <span className="font-semibold text-slate-800">{asm.title}</span>
            <div className="flex gap-1.5 items-center">
              <Badge variant={isQuiz ? 'info' : 'gray'} className="text-[8px] leading-none px-1 py-0 scale-90">
                {isQuiz ? 'Trắc nghiệm' : 'Tự luận'}
              </Badge>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Hạn Nộp',
      accessor: (asm: Assignment) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(asm.dueDate).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: (asm: Assignment) => {
        const sub = getSubmissionForAssignment(asm.id);
        if (!sub) return <Badge variant="danger">Chưa nộp bài</Badge>;
        if (sub.status === 'graded') {
          return (
            <div className="flex items-center gap-1.5">
              <Badge variant="success">Đã chấm điểm</Badge>
              <span className="text-xs font-bold text-emerald-600 font-mono">({sub.score} / {asm.maxPoints})</span>
            </div>
          );
        }
        return <Badge variant="gray">Chờ chấm điểm</Badge>;
      }
    },
    {
      header: 'Thao Tác',
      accessor: (asm: Assignment) => {
        const sub = getSubmissionForAssignment(asm.id);
        if (!sub) {
          return (
            <button
              onClick={() => startHomework(asm)}
              className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Làm bài
            </button>
          );
        }

        const isQuiz = (asm as any).type === 'tracnghiem';
        return (
          <button
            onClick={() => setViewSubmission({ asm, sub })}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {isQuiz ? 'Xem lại bài thi' : 'Xem kết quả'}
          </button>
        );
      },
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Detail Workspace Pane (Single Screen Toggle) */}
      {activeHomework ? (
        <div className="space-y-6">
          {/* Back Action Bar */}
          <button
            onClick={() => setActiveHomework(null)}
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách bài tập
          </button>

          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Bàn Làm Bài Sinh Viên</span>
                <h3 className="text-base font-black text-slate-850 mt-1">{activeHomework.title}</h3>
              </div>

              <div className="text-xs text-slate-500 font-medium text-left sm:text-right space-y-1">
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" /> Hạn nộp: <strong className="text-slate-700">{new Date(activeHomework.dueDate).toLocaleString('vi-VN')}</strong>
                </p>
                <p className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-slate-400" /> Điểm số tối đa: <strong className="text-slate-700">{activeHomework.maxPoints} điểm</strong>
                </p>
              </div>
            </div>

            {/* Instruction description detail */}
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              <strong>Hướng dẫn làm bài:</strong><br />
              {activeHomework.description}
            </div>

            {/* Render conditional homework questions input */}
            {(activeHomework as any).type === 'tracnghiem' ? (
              <div className="space-y-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <FileQuestion className="h-4.5 w-4.5 text-blue-600" /> Câu hỏi trắc nghiệm kiểm tra
                </h4>

                {/* Simulated quiz question items */}
                {[1, 2, 3, 4].map((qNum) => (
                  <div key={qNum} className="p-4 bg-white border border-slate-150 rounded-xl space-y-3 shadow-2xs">
                    <p className="text-xs font-bold text-slate-800">Câu hỏi {qNum}: Đâu là câu trả lời chính xác nhất?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['a', 'b', 'c', 'd'].map((ans) => {
                        const isChecked = answers[qNum] === ans;
                        return (
                          <button
                            key={ans}
                            onClick={() => setAnswers(prev => ({ ...prev, [qNum]: ans }))}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${
                              isChecked ? 'bg-white text-blue-600 border-white' : 'bg-white text-slate-500 border-slate-300'
                            }`}>
                              {ans}
                            </span>
                            <span>Đáp án {ans.toUpperCase()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Essay work form */
              <div className="space-y-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Giải pháp bài làm tự luận</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Nội dung tự soạn thảo</label>
                  <textarea
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    rows={6}
                    placeholder="Nhập phần giải đề bài, nội dung phân tích tự luận của bạn..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-750 font-sans leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Đính kèm file giải đề (Tùy chọn)</label>
                  <FileUploader onFileSelect={handleFileSelect} />
                </div>
              </div>
            )}

            {errors && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg border border-rose-100 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500 mt-0.5 shrink-0" />
                <span>{errors}</span>
              </div>
            )}

            {/* Bottom publish trigger */}
            <div className="border-t border-slate-100 pt-4 flex gap-3">
              <button
                onClick={onSubmitAction}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Xác nhận nộp bài
              </button>
              <button
                onClick={() => setActiveHomework(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          {/* Header titles */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nộp Bài Tập Trực Tuyến</h2>
              <p className="text-xs text-slate-500">Phân lớp môn học, xem danh mục câu hỏi kiểm tra, nộp bài tự luận và xem kết quả đánh giá</p>
            </div>
          </div>

          {/* Class selection filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bộ lọc học phần:</span>
                <span className="text-xs font-bold text-slate-700">
                  {selectedClassId === 'all'
                    ? `Đang hiển thị tất cả (${homeworks.length} bài tập)`
                    : `Lớp ${selectedClassId} (${filteredHomeworks.length} bài tập)`
                  }
                </span>
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <select
                id="homework-class-filter"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold py-2.5 pl-3.5 pr-10 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer shadow-3xs"
              >
                <option value="all">Tất cả học phần ({homeworks.length})</option>
                {enrolledClasses.map(cls => {
                  const classHomeworks = homeworks.filter(h => h.classId === cls.id);
                  return (
                    <option key={cls.id} value={cls.id}>
                      {cls.subjectName} ({cls.id}) — {classHomeworks.length} bài tập
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 border-l border-slate-200/60 my-1.5">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <Card>
            <Table
              data={filteredHomeworks}
              columns={columns}
              emptyMessage={
                selectedClassId === 'all'
                  ? "Không có bài tập trực tuyến nào được giao học kỳ này."
                  : `Không có bài tập trực tuyến nào được giao cho học phần này.`
              }
            />
          </Card>
        </div>
      )}

      {/* View Result Popup */}
      {viewSubmission && (viewSubmission.asm as any).type === 'tracnghiem' ? (
        <ExamReviewView
          assignment={viewSubmission.asm}
          submission={viewSubmission.sub}
          onClose={() => setViewSubmission(null)}
        />
      ) : viewSubmission ? (
        <Modal
          isOpen={!!viewSubmission}
          onClose={() => setViewSubmission(null)}
          title={`Kết quả bài làm: ${viewSubmission.asm.title}`}
          footer={
            <button
              onClick={() => setViewSubmission(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Đóng lại
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Trạng thái đánh giá</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={viewSubmission.sub.status === 'graded' ? 'success' : 'gray'}>
                  {viewSubmission.sub.status === 'graded' ? 'Đã chấm điểm' : 'Đang chờ chấm điểm'}
                </Badge>
                {viewSubmission.sub.status === 'graded' && (
                  <span className="font-bold text-slate-800 text-sm font-mono">Điểm số: {viewSubmission.sub.score} / {viewSubmission.asm.maxPoints}</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Bài giải đã nộp</span>
              <div className="p-3 bg-white border rounded-lg max-h-36 overflow-y-auto whitespace-pre-line text-slate-700 leading-relaxed">
                {viewSubmission.sub.content || 'Bài nộp dạng đính kèm tài liệu.'}
              </div>
            </div>

            {viewSubmission.sub.feedback && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-emerald-600 font-bold uppercase block">Nhận xét của Giảng Viên</span>
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg font-medium leading-relaxed">
                  {viewSubmission.sub.feedback}
                </div>
              </div>
            )}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
