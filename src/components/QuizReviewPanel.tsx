import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { QuizQuestion, QuizAnswer, Assignment } from '../models';
import { CheckCircle2, XCircle, AlertCircle, FileText, X, ZoomIn, ZoomOut, RotateCcw, HelpCircle } from 'lucide-react';

/**
 * Interface định nghĩa props cho component QuizReviewPanel.
 * Dùng cho cả Sinh viên xem kết quả bài làm (mode='result')
 * và Giảng viên xem trước đề thi khi khởi tạo/chỉnh sửa (mode='preview').
 */
export interface QuizReviewPanelProps {
  /** Mode hiển thị: 'result' (SV xem lại kết quả) hoặc 'preview' (GV xem trước) */
  mode: 'result' | 'preview';
  /** Thông tin bài tập trắc nghiệm (chứa file đề, số câu, tiêu đề) */
  assignment: Assignment;
  /** Danh sách các câu hỏi trong bài trắc nghiệm */
  questions: QuizQuestion[];
  /** Danh sách câu trả lời của SV (chỉ truyền khi mode='result') */
  answers?: QuizAnswer[];
  /** Tổng điểm SV đạt được (chỉ dùng khi mode='result') */
  totalScore?: number;
  /** Callback đóng panel xem lại/xem trước */
  onClose: () => void;
}

/**
 * Component Xem Lại Kết Quả Trắc Nghiệm / Xem Trước Đề Thi.
 * Thiết kế 2 cột chuẩn responsive:
 * - Cột trái (35%): Kết quả tổng hợp, Ma trận câu hỏi, Phân tích chi tiết từng câu.
 * - Cột phải (65%): Trình xem file đề thi chính thức (PDF / Ảnh) kèm bộ điều khiển Zoom.
 */
export const QuizReviewPanel: React.FC<QuizReviewPanelProps> = ({
  mode,
  assignment,
  questions,
  answers = [],
  totalScore = 0,
  onClose,
}) => {
  // State theo dõi câu hỏi đang được chọn để xem chi tiết (mặc định là câu đầu tiên)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  // State điều khiển mức Zoom của tài liệu đề thi
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Lấy thông tin câu hỏi đang xem chi tiết
  const currentQuestion = questions?.[selectedQuestionIndex] || questions?.[0];
  const maxPoints = assignment?.maxPoints || 10;

  // Bản đồ tra cứu nhanh câu trả lời của SV theo questionId
  const answerMap = new Map<string, QuizAnswer>();
  answers?.forEach((ans) => answerMap.set(ans.questionId, ans));

  // Tính toán số câu trả lời đúng của sinh viên
  const correctCount = (questions || []).reduce((acc, q) => {
    const userAns = answerMap.get(q.id);
    return userAns && userAns.selectedChoice === q.correctChoice ? acc + 1 : acc;
  }, 0);

  // Xử lý phóng to / thu nhỏ / reset zoom cho file đề thi
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // Lấy file URL hoặc file mặc định demo nếu chưa có URL
  const examUrl = assignment?.examFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const examName = assignment?.examFileName || 'DE_THI_CHINH_THUC.PDF';
  const isPdf = assignment?.examFileType === 'pdf' || examName.toLowerCase().endsWith('.pdf');

  const content = (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex flex-col w-full h-full overflow-hidden text-slate-800 font-sans">
      {/* 1. THANH TIÊU ĐỀ TRÊN CÙNG (HEADER) */}
      <div className="bg-slate-950 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400 border border-indigo-500/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Xem Lại Kết Quả Trắc Nghiệm
            </h2>
            <p className="text-xs text-slate-400">
              Bài tập: <span className="text-slate-200 font-medium">{assignment?.title || assignment?.id}</span> • Thang điểm: {maxPoints}đ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Badge Tổng điểm bài thi */}
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-xs uppercase tracking-wider text-emerald-400">TỔNG ĐIỂM BÀI THI:</span>
            <span className="text-base text-emerald-200">
              {mode === 'preview' ? '---' : totalScore.toFixed(1)} / {maxPoints}đ
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Đóng lại
          </button>
        </div>
      </div>

      {/* 2. BỐ CỤC NỘI DUNG CHÍNH 2 CỘT */}
      <div className="flex flex-1 overflow-hidden bg-slate-100">
        {/* CỘT TRÁI (~35% CHIỀU RỘNG): KẾT QUẢ & PHÂN TÍCH CHI TIẾT */}
        <div className="w-[38%] min-w-[380px] max-w-[520px] bg-white border-r border-slate-200 flex flex-col h-full shadow-lg">
          <div className="p-5 overflow-y-auto flex-1 space-y-6">
            
            {/* KHỐI KẾT QUẢ TỔNG HỢP (CHỈ HIỆN KHI MODE RESULT) */}
            {mode === 'result' ? (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    KẾT QUẢ TỔNG HỢP
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-bold text-[11px] rounded-full uppercase tracking-wider">
                    HOÀN TẤT
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-emerald-700">
                    {totalScore.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">/ {maxPoints} điểm</span>
                </div>
                <p className="text-xs text-slate-600 italic">
                  Nhận xét: Tự động chấm điểm trắc nghiệm: Đúng {correctCount}/{questions.length} câu.
                </p>
              </div>
            ) : (
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                    CHẾ ĐỘ XEM TRƯỚC (PREVIEW)
                  </span>
                  <span className="px-2.5 py-0.5 bg-indigo-600 text-white font-bold text-[11px] rounded-full uppercase tracking-wider">
                    GIẢNG VIÊN
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Hiển thị đáp án đúng chuẩn của tất cả {questions.length} câu hỏi. Sinh viên sẽ làm bài với giao diện tương tự.
                </p>
              </div>
            )}

            {/* KHỐI MA TRẬN KẾT QUẢ CÂU HỎI */}
            <div>
              <div className="mb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  MA TRẬN KẾT QUẢ CÂU HỎI
                </h3>
                <p className="text-[11px] text-slate-500">
                  Bấm vào ô số thứ tự để xem phân tích chi tiết đáp án tương ứng.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {(questions || []).map((q, idx) => {
                  const userAns = answerMap.get(q.id);
                  const isSelected = selectedQuestionIndex === idx;
                  let statusBg = 'bg-slate-100 text-slate-600 border-slate-300';
                  let statusText = 'Trống';

                  if (mode === 'result') {
                    if (!userAns || !userAns.selectedChoice) {
                      statusBg = 'bg-slate-100 text-slate-500 border-slate-300';
                      statusText = 'Trống';
                    } else if (userAns.selectedChoice === q.correctChoice) {
                      statusBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                      statusText = 'Đúng';
                    } else {
                      statusBg = 'bg-rose-100 text-rose-800 border-rose-300';
                      statusText = 'Sai';
                    }
                  } else {
                    statusBg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                    statusText = `Đáp án ${q.correctChoice}`;
                  }

                  return (
                    <button
                      key={q.id || idx}
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${statusBg} ${
                        isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 font-bold border-indigo-600 shadow-md' : 'hover:border-slate-400'
                      }`}
                    >
                      <span className="text-xs font-semibold">Câu {idx + 1}</span>
                      <span className="text-[10px] opacity-80 uppercase tracking-tighter">{statusText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* KHỐI PHÂN TÍCH CHI TIẾT CÂU ĐANG CHỌN */}
            {currentQuestion && (
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    PHÂN TÍCH CHI TIẾT: CÂU {selectedQuestionIndex + 1}
                  </h4>

                  {mode === 'result' && (
                    <>
                      {(!answerMap.get(currentQuestion.id) || !answerMap.get(currentQuestion.id)?.selectedChoice) && (
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-md">
                          Chưa nộp câu trả lời
                        </span>
                      )}
                      {answerMap.get(currentQuestion.id)?.selectedChoice === currentQuestion.correctChoice && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-[11px] rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Trả lời đúng
                        </span>
                      )}
                      {answerMap.get(currentQuestion.id)?.selectedChoice &&
                        answerMap.get(currentQuestion.id)?.selectedChoice !== currentQuestion.correctChoice && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-semibold text-[11px] rounded-md flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Trả lời sai
                          </span>
                        )}
                    </>
                  )}
                </div>

                {/* Tùy chọn text câu hỏi nếu có */}
                {currentQuestion.questionText && (
                  <p className="text-sm font-semibold text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                    {currentQuestion.questionText}
                  </p>
                )}

                {/* Danh sách 4 đáp án A/B/C/D */}
                <div className="space-y-2.5">
                  {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                    const isCorrectChoice = choice === currentQuestion.correctChoice;
                    const userSelectedThis = answerMap.get(currentQuestion.id)?.selectedChoice === choice;
                    
                    // Nội dung chi tiết tùy chọn của phương án (nếu có)
                    const choiceTextKey = `choice${choice}Text` as keyof QuizQuestion;
                    const choiceText = currentQuestion[choiceTextKey] as string | undefined;

                    let btnStyle = 'bg-white border-slate-200 text-slate-700';
                    let badgeLabel = null;

                    if (isCorrectChoice) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-medium ring-1 ring-emerald-400';
                      badgeLabel = (
                        <span className="ml-auto text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                          ĐÁP ÁN ĐÚNG CHUẨN
                        </span>
                      );
                    } else if (mode === 'result' && userSelectedThis && !isCorrectChoice) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-medium ring-1 ring-rose-400';
                      badgeLabel = (
                        <span className="ml-auto text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                          BẠN ĐÃ CHỌN SAI
                        </span>
                      );
                    }

                    return (
                      <div
                        key={choice}
                        className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all ${btnStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCorrectChoice
                              ? 'bg-emerald-600 text-white'
                              : userSelectedThis && !isCorrectChoice
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {choice}
                        </span>
                        <span className="text-sm font-medium">
                          {choiceText || `Phương án ${choice}`}
                        </span>
                        {badgeLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Khối Giải thích lý thuyết từ giảng viên */}
                {currentQuestion.explanationText && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800 uppercase tracking-wider text-[11px]">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      GIẢI THÍCH LÝ THUYẾT TỪ GIẢNG VIÊN:
                    </div>
                    <p className="italic text-slate-700 leading-relaxed pl-5">
                      {currentQuestion.explanationText}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI (~65% CHIỀU RỘNG): TRÌNH XEM FILE ĐỀ THI GỐC */}
        <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden">
          {/* Header trình xem file */}
          <div className="bg-slate-800 text-slate-300 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-slate-700">
            <span className="uppercase tracking-wider text-slate-400">
              ẢNH ĐỀ THI / TÀI LIỆU FILE ĐỀ CHÍNH THỨC
            </span>
            <span className="font-mono text-slate-200 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
              FILE: {examName}
            </span>
          </div>

          {/* Khối hiển thị file (iFrame PDF hoặc Ảnh) */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900 relative">
            <div
              className="transition-transform duration-200 ease-out origin-top flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel / 100})`, width: isPdf ? '100%' : 'auto', height: isPdf ? '100%' : 'auto' }}
            >
              {isPdf ? (
                <iframe
                  src={`${examUrl}#toolbar=0`}
                  title="File đề thi PDF"
                  className="w-full h-full min-h-[85vh] rounded-lg shadow-2xl bg-white border border-slate-700"
                />
              ) : (
                <img
                  src={examUrl}
                  alt="Ảnh đề thi chính thức"
                  className="max-w-full h-full min-h-[85vh] object-contain rounded-lg shadow-2xl border border-slate-700 bg-white"
                />
              )}
            </div>

            {/* Thanh công cụ Zoom ở đáy giữa cột phải */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-3 shadow-xl z-10">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-12 text-center font-bold text-indigo-300">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700" />
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 hover:text-white"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(content, document.body) : content;
};
