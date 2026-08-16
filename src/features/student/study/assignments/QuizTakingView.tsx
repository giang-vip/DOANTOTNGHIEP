import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { QuizQuestion, Assignment } from '../../../../models';
import { FileText, ArrowLeft, CheckCircle, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, Clock } from 'lucide-react';

/**
 * Interface props cho component QuizTakingView.
 * Dùng cho sinh viên thực hiện bài thi trắc nghiệm.
 */
export interface QuizTakingViewProps {
  /** Thông tin bài tập trắc nghiệm đang làm */
  assignment: Assignment;
  /** Danh sách toàn bộ các câu hỏi trắc nghiệm của bài thi này */
  questions: QuizQuestion[];
  /** Callback khi sinh viên xác nhận nộp bài thi (kèm danh sách đáp án đã chọn) */
  onSubmit: (userAnswers: { questionId: string; selectedChoice: 'A' | 'B' | 'C' | 'D' | null }[]) => void;
  /** Callback khi sinh viên hủy làm bài và quay lại màn trước */
  onCancel: () => void;
}

/**
 * Màn hình Làm Bài Thi Trắc Nghiệm dành cho Sinh viên (QuizTakingView).
 * Bố cục 2 cột chuẩn:
 * - Cột trái (35%): Điều hướng các ô câu hỏi, 4 nút A/B/C/D to chọn đáp án cho câu hiện tại, nút Trước/Sau/Nộp bài.
 * - Cột phải (65%): Trình xem file đề thi PDF/Ảnh chính thức kèm bộ Zoom.
 */
export const QuizTakingView: React.FC<QuizTakingViewProps> = ({
  assignment,
  questions,
  onSubmit,
  onCancel,
}) => {
  // State lưu các đáp án sinh viên chọn: record questionId -> choice ('A' | 'B' | 'C' | 'D')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  // State điều khiển Zoom cho trình xem đề ở cột phải
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // State xác nhận nộp bài nếu còn câu chưa làm
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const examUrl = assignment.examFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  const examName = assignment.examFileName || 'DE_THI_CHINH_THUC.PDF';
  const isPdf = assignment.examFileType === 'pdf' || examName.toLowerCase().endsWith('.pdf');

  // Đổi đáp án cho câu hỏi
  const handleSelectChoice = (questionId: string, choice: 'A' | 'B' | 'C' | 'D') => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: choice,
    }));
  };

  // Chuyển tới một câu hỏi (scroll mượt)
  const handleJumpToQuestion = (id: string) => {
    const el = document.getElementById(`question-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Xử lý nộp bài
  const handleConfirmSubmit = () => {
    const formattedAnswers = questions.map((q) => {
      const qIdStr = String(q.id);
      return {
        questionId: qIdStr,
        selectedChoice: selectedAnswers[qIdStr] || null,
      };
    });
    onSubmit(formattedAnswers);
  };

  const content = (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-full h-full overflow-hidden text-slate-800 font-sans">
      {/* 1. HEADER MÀN LÀM BÀI */}
      <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              {assignment.title}
            </h2>
            <p className="text-xs text-slate-400">
              Đang làm bài trắc nghiệm • {totalQuestions} câu • Đã làm: <span className="text-emerald-400 font-bold">{answeredCount}/{totalQuestions}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>THỜI GIAN LÀM BÀI: TỰ DO</span>
          </div>

          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Nộp bài
          </button>
        </div>
      </div>

      {/* 2. NỘI DUNG 2 CỘT */}
      <div className="flex flex-1 overflow-hidden bg-slate-100">
        {/* CỘT TRÁI (~35% CHIỀU RỘNG): ĐIỀU HƯỚNG CÂU HỎI & NÚT CHỌN A/B/C/D */}
        <div className="w-[36%] min-w-[360px] max-w-[500px] bg-white border-r border-slate-200 flex flex-col h-full shadow-lg">

          {/* Dãy ô số điều hướng câu hỏi trên cùng */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                DANH SÁCH CÂU HỎI
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Bấm số để nhảy thẳng tới câu đó
              </span>
            </div>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const qIdStr = String(q.id || idx);
                const isAnswered = !!selectedAnswers[qIdStr];

                return (
                  <button
                    key={qIdStr}
                    onClick={() => handleJumpToQuestion(qIdStr)}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer ${isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && <span className="text-[8px] leading-none text-emerald-700">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Khối danh sách toàn bộ câu hỏi (Trải phẳng) */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {questions.map((q, idx) => {
              const qIdStr = String(q.id || idx);
              return (
              <div 
                key={qIdStr} 
                id={`question-${qIdStr}`}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-extrabold text-slate-900">
                    CÂU {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
                    {q.points ? q.points.toFixed(2) : (10 / (totalQuestions || 1)).toFixed(2)} điểm
                  </span>
                </div>

                {/* Text câu hỏi (nếu GV nhập) */}
                {q.questionText && (
                  <div className="text-xs font-medium text-slate-800 leading-relaxed">
                    {q.questionText}
                  </div>
                )}

                {/* 4 Nút A / B / C / D */}
                <div className="grid grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                    const isSelected = selectedAnswers[qIdStr] === choice;
                    const choiceTextKey = `choice${choice}Text` as keyof QuizQuestion;
                    const choiceText = q[choiceTextKey] as string | undefined;

                    return (
                      <button
                        key={choice}
                        onClick={() => handleSelectChoice(qIdStr, choice)}
                        className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer ${isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm ring-1 ring-indigo-600'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${isSelected
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                        >
                          {choice}
                        </span>
                        <span className="text-xs font-semibold line-clamp-2">
                          {choiceText || choice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* CỘT PHẢI (~65% CHIỀU RỘNG): TRÌNH XEM FILE ĐỀ THI */}
        <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden">
          <div className="bg-slate-800 text-slate-300 px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-slate-700">
            <span className="uppercase tracking-wider text-slate-400">
              XEM NỘI DUNG ĐỀ THI CHÍNH THỨC
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Thu nhỏ">
                  -
                </button>
                <span className="font-mono text-[10px] w-8 text-center">{zoomLevel}%</span>
                <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} className="p-1 hover:text-white hover:bg-slate-700 rounded transition-colors" title="Phóng to">
                  +
                </button>
              </div>
              <span className="font-mono text-slate-200 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                FILE: {examName}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-900 relative">
            {assignment.examFileUrl && assignment.examFileUrl !== '#' && assignment.examFileUrl !== 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' ? (
              <div
                className="transition-transform duration-200 ease-out origin-top flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel / 100})`, width: isPdf ? '100%' : 'auto', height: isPdf ? '100%' : 'auto' }}
              >
                {isPdf ? (
                  <iframe
                    src={`${examUrl}#toolbar=0`}
                    title="File đề thi"
                    className="w-full h-full min-h-[85vh] rounded-lg shadow-2xl bg-white border border-slate-700"
                  />
                ) : (
                  <img
                    src={examUrl}
                    alt="Đề thi chính thức"
                    className="max-w-full h-full min-h-[85vh] object-contain rounded-lg shadow-2xl border border-slate-700 bg-white"
                  />
                )}
              </div>
            ) : (
              /* High Fidelity Mock Exam Sheet (Rendered precisely from questions list) */
              <div
                className="bg-white shadow-xl border border-slate-350 p-8 md:p-12 rounded-xs max-w-2xl w-full min-h-[900px] transition-transform duration-200 text-slate-800 space-y-6 select-none"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* Branding header */}
                <div className="border-b-2 border-double border-slate-900 pb-4 flex justify-between items-start">
                  <div className="text-center font-bold text-[11px] leading-tight text-slate-900 uppercase">
                    HỘI ĐỒNG THI & KHẢO THÍ<br />
                    <span className="tracking-wide">ĐẠI HỌC HƯNG NHÂN</span><br />
                    <span className="text-[9px] font-medium font-serif italic capitalize">---***---</span>
                  </div>
                  <div className="text-center font-bold text-[11px] leading-tight text-slate-900">
                    ĐỀ THI KIỂM TRA ĐÁNH GIÁ ĐỊNH KỲ<br />
                    MÔN HỌC TRỰC TUYẾN TRÊN HỆ THỐNG<br />
                    <span className="text-[9px] font-medium font-mono text-slate-600">Mã bài thi: {assignment.id}</span>
                  </div>
                </div>

                {/* Exam meta titles */}
                <div className="text-center space-y-1 py-1">
                  <h3 className="font-bold font-serif text-sm uppercase tracking-wide">ĐỀ BÀI THI CHÍNH THỨC</h3>
                  <p className="text-[10px] text-slate-600 font-medium italic">Học phần chuyên ngành • Thang điểm chuẩn: {assignment.maxPoints}đ</p>
                  <p className="text-[9px] font-mono font-bold text-slate-500">Đề bài thi trắc nghiệm gồm có {questions.length} câu hỏi</p>
                </div>

                {/* Questions sheet */}
                <div className="space-y-6 text-xs font-serif text-slate-900 leading-relaxed text-justify">
                  {questions.map((qItem: any, idx: number) => (
                    <div key={qItem.id || idx} className="space-y-2">
                      <p className="font-bold text-slate-950">
                        Câu {idx + 1}: {qItem.questionText || 'Đâu là câu trả lời chính xác nhất?'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-4 font-normal text-slate-800">
                        <p><span className="font-bold">A.</span> {qItem.choiceAText || 'Phương án A'}</p>
                        <p><span className="font-bold">B.</span> {qItem.choiceBText || 'Phương án B'}</p>
                        <p><span className="font-bold">C.</span> {qItem.choiceCText || 'Phương án C'}</p>
                        <p><span className="font-bold">D.</span> {qItem.choiceDText || 'Phương án D'}</p>
                      </div>
                    </div>
                  ))}

                  <div className="text-center font-bold pt-8 text-[11px] text-slate-900 border-t-2 border-dashed border-slate-300 tracking-widest font-mono">
                    --- HẾT ĐỀ BÀI THI ---
                  </div>
                </div>
              </div>
            )}

            {/* Thanh Zoom */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full border border-slate-700 flex items-center gap-3 shadow-xl z-10 select-none">
              <button
                onClick={() => setZoomLevel((p) => Math.max(p - 25, 50))}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 cursor-pointer"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-12 text-center font-bold text-indigo-300">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((p) => Math.min(p + 25, 200))}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 cursor-pointer"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700" />
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-300 cursor-pointer"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN NỘP BÀI */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-base font-bold">Xác Nhận Nộp Bài Thi Trắc Nghiệm?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn đã trả lời <span className="font-bold text-emerald-700">{answeredCount}/{totalQuestions}</span> câu hỏi.
              {answeredCount < totalQuestions && (
                <span className="block mt-1 font-semibold text-rose-600">
                  ⚠️ Còn {totalQuestions - answeredCount} câu chưa chọn đáp án (sẽ tính 0 điểm)!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tiếp tục làm bài
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Đồng ý nộp ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(content, document.body) : content;
};
