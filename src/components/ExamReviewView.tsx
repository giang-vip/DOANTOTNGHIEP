import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Clock, Award, Check, X, HelpCircle, User, FileText } from 'lucide-react';
import { Badge } from './UI';

const mockQuizQuestions = [
  {
    id: 1,
    q: 'Hệ thống quản lý thông minh giúp tối ưu hóa công việc học tập chủ yếu dựa trên nhân tố nào?',
    choices: {
      a: 'Số lượng tài liệu lưu trữ khổng lồ',
      b: 'Khả năng định vị tọa độ GPS và AI nhận diện tự động',
      c: 'Sự giám sát chặt chẽ thủ công của giảng viên giảng đường',
      d: 'Thời gian sinh viên tự học lên tới 24 tiếng mỗi ngày'
    },
    correct: 'b',
    explain: 'Hệ thống điểm danh thông minh tích hợp AI nhận diện diện mạo kết hợp định vị tọa độ GPS cục bộ giúp tự động hóa quá trình điểm danh nhanh chóng và minh bạch nhất.'
  },
  {
    id: 2,
    q: 'Khung giờ học quy định (Thứ Hai đến Thứ Bảy) của Trường Đại học Hưng Nhân có bao nhiêu tiết học tối đa trong một ngày?',
    choices: {
      a: '8 tiết học',
      b: '10 tiết học',
      c: '12 tiết học',
      d: '14 tiết học'
    },
    correct: 'c',
    explain: 'Thời gian biểu trong ngày chia làm 12 tiết học tối đa: ca sáng gồm 6 tiết (từ tiết 1 đến tiết 6), ca chiều gồm 6 tiết (từ tiết 7 đến tiết 12).'
  },
  {
    id: 3,
    q: 'Trong kiến trúc phần mềm MVVM (Model-View-ViewModel) của ứng dụng, thành phần đóng vai trò làm cầu nối liên kết dữ liệu và xử lý nghiệp vụ là:',
    choices: {
      a: 'View (Giao diện hiển thị)',
      b: 'ViewModel (Bộ kết nối trung gian)',
      c: 'Model (Lưu trữ thực thể dữ liệu)',
      d: 'Store Provider (Nơi quản lý tập trung)'
    },
    correct: 'b',
    explain: 'ViewModel đóng vai trò trung gian xử lý nghiệp vụ dữ liệu, ràng buộc dữ liệu (data binding) và cập nhật trạng thái đồng bộ hai chiều giữa View và Model.'
  },
  {
    id: 4,
    q: 'Thang điểm tối đa quy định áp dụng cho mỗi cột điểm thi/kiểm tra học phần trong hệ thống quản lý học tập là:',
    choices: {
      a: 'Thang điểm chữ (A, B, C, D, F)',
      b: 'Thang điểm 10',
      c: 'Thang điểm 100',
      d: 'Thang điểm 4'
    },
    correct: 'b',
    explain: 'Hệ thống chuẩn hóa tất cả các cột điểm thành phần chuyên cần, kiểm tra TX1, kiểm tra TX2 và điểm thi cuối kỳ theo thang điểm 10 quy chuẩn.'
  },
  {
    id: 5,
    q: 'Mục đích chính của việc giới hạn bán kính quét địa lý (Geo-fencing) khoảng 100m khi sinh viên điểm danh là gì?',
    choices: {
      a: 'Tiết kiệm lưu lượng mạng Internet của sinh viên',
      b: 'Đảm bảo tính trung thực, xác nhận sinh viên đang hiện diện thực tế tại cơ sở trường học',
      c: 'Phát hiện vị trí của giảng viên giảng dạy',
      d: 'Tăng tốc kết nối máy chủ dữ liệu Thái Bình'
    },
    correct: 'b',
    explain: 'Tính năng Geo-fencing giới hạn bán kính quét tọa độ nhằm ngăn chặn hành vi điểm danh hộ trái phép, bảo đảm tính công bằng và thực tế của sinh viên tại lớp học.'
  }
];

interface ExamReviewViewProps {
  assignment: any;
  submission: any;
  onClose: () => void;
  studentInfo?: {
    name: string;
    id: string;
  };
}

export function ExamReviewView({ assignment, submission, onClose, studentInfo }: ExamReviewViewProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [activeQuestionId, setActiveQuestionId] = useState<number>(1);

  // Parse questions list from assignment or fallback to mockQuizQuestions
  const questionsList = (assignment as any).questions && (assignment as any).questions.length > 0
    ? (assignment as any).questions
    : mockQuizQuestions;

  // Parse correct answers map
  const getCorrectAnswersMap = (): Record<string, string> => {
    const map: Record<string, string> = {};
    const keysStr = (assignment as any).correctAnswers || '';
    if (keysStr) {
      const pairs = keysStr.split(',').map((p: string) => p.trim().split('-'));
      pairs.forEach(([qNum, ans]: [string, string]) => {
        if (qNum && ans) {
          map[qNum] = ans.toLowerCase().trim();
        }
      });
    }
    // Fallback defaults
    questionsList.forEach((q: any) => {
      if (!map[q.id.toString()]) {
        map[q.id.toString()] = (q.correct || 'a').toLowerCase().trim();
      }
    });
    return map;
  };

  // Parse student chosen answers map
  const getStudentAnswersMap = (): Record<string, string> => {
    const map: Record<string, string> = {};
    if (!submission || !submission.content) return map;

    // Support JSON answers from HomeworkView
    if (submission.content.includes('Giải trắc nghiệm:')) {
      try {
        const jsonStr = submission.content.split('Giải trắc nghiệm:')[1].trim();
        const parsed = JSON.parse(jsonStr);
        Object.entries(parsed).forEach(([q, a]) => {
          map[q] = (a as string).toLowerCase().trim();
        });
        return map;
      } catch (e) {
        // Fallback to normal regex if JSON parsing fails
      }
    }

    const detailPart = submission.content.split('Chi tiết: ')[1];
    if (detailPart) {
      const pairs = detailPart.split(', ');
      pairs.forEach((p: string) => {
        const match = p.match(/Câu\s*(\d+):\s*([A-D])/i);
        if (match) {
          map[match[1]] = match[2].toLowerCase().trim();
        }
      });
    } else {
      const regex = /(?:Câu\s*)?(\d+)\s*[:.-]\s*([A-D])/gi;
      let match;
      while ((match = regex.exec(submission.content)) !== null) {
        map[match[1]] = match[2].toLowerCase().trim();
      }
    }
    return map;
  };

  const correctMap = getCorrectAnswersMap();
  const studentMap = getStudentAnswersMap();

  // Find currently active question
  const activeQuestion = questionsList.find((q: any) => q.id === activeQuestionId) || questionsList[0];

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col font-sans text-slate-800">
      {/* Immersive Top Bar Header */}
      <div className="h-16 bg-slate-950 text-white px-6 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white leading-tight">
              {studentInfo ? 'Giảng Viên: Xem Kết Quả Bài Làm' : 'Xem Lại Kết Quả Trắc Nghiệm'}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              Bài tập: {assignment.title} • Thang điểm: {assignment.maxPoints}đ
            </p>
          </div>
        </div>

        {/* Display Student Info if provided (viewed by teacher) */}
        {studentInfo && (
          <div className="hidden md:flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1 rounded-xl text-xs font-semibold text-slate-300">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>Sinh viên: <strong className="text-white">{studentInfo.name}</strong> ({studentInfo.id})</span>
          </div>
        )}

        {/* Score box */}
        <div className="flex items-center gap-2 bg-emerald-950/80 px-4 py-1.5 rounded-2xl border border-emerald-900 shadow-inner">
          <Award className="h-4 w-4 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest hidden sm:inline">Tổng điểm bài thi:</span>
          <span className="text-sm font-mono font-bold tracking-wider text-emerald-300">
            {submission ? (submission.score !== undefined ? submission.score.toFixed(1) : '—') : '—'} / {assignment.maxPoints}đ
          </span>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer border border-slate-700/80"
        >
          Đóng lại
        </button>
      </div>

      {/* Main Workspace Frame: Two Columns (Left Matrix, Right PDF/File) */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-64px)] bg-slate-100">
        
        {/* COL 1 (LEFT): Question Matrix and Option Details (Width: 5/12) */}
        <div className="col-span-12 lg:col-span-5 h-full flex flex-col bg-white overflow-hidden shadow-inner border-r border-slate-300">
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Header info for mobile/general */}
            {studentInfo && (
              <div className="md:hidden p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">Thông tin bài làm</span>
                <p className="font-semibold text-slate-800">
                  Học viên: {studentInfo.name} ({studentInfo.id})
                </p>
              </div>
            )}

            {/* Score box inside list */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-3xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-850 uppercase tracking-wide">KẾT QUẢ TỔNG HỢP</span>
                <Badge variant="success">HOÀN TẤT</Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-bold text-emerald-700">
                  {submission ? (submission.score !== undefined ? submission.score.toFixed(1) : '—') : '—'}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {assignment.maxPoints} điểm</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Nhận xét: {submission?.feedback || 'Hệ thống tự động chấm điểm trắc nghiệm.'}
              </p>
            </div>

            {/* Question Matrix Board */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Ma trận kết quả câu hỏi</h4>
              <p className="text-[10px] text-slate-400 font-medium mb-2">Bấm vào ô số thứ tự để xem phân tích chi tiết đáp án tương ứng</p>
              
              <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {questionsList.map((q: any, index: number) => {
                  const qIdStr = q.id.toString();
                  const sAns = studentMap[qIdStr];
                  const cAns = correctMap[qIdStr];
                  const isCorrect = sAns === cAns;
                  const isActive = activeQuestionId === q.id;

                  // Determine matrix cell background
                  let bgClass = 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                  if (sAns) {
                    if (isCorrect) {
                      bgClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100/70 font-semibold';
                    } else {
                      bgClass = 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100/70 font-semibold';
                    }
                  } else {
                    bgClass = 'bg-slate-100 border-slate-200 text-slate-400 italic hover:bg-slate-150';
                  }

                  if (isActive) {
                    bgClass += ' ring-2 ring-blue-600 ring-offset-1';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      className={`h-11 rounded-xl border text-center text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${bgClass}`}
                    >
                      <span className="block font-bold">Câu {q.id}</span>
                      <span className="text-[8px] uppercase tracking-wider block opacity-75 font-mono">
                        {sAns ? `S: ${sAns.toUpperCase()}` : 'Trống'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Detail Section */}
            {activeQuestion && (
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                    Phân tích chi tiết: Câu {activeQuestion.id}
                  </span>
                  
                  {(() => {
                    const qIdStr = activeQuestion.id.toString();
                    const sAns = studentMap[qIdStr];
                    const cAns = correctMap[qIdStr];
                    if (!sAns) {
                      return <Badge variant="gray">Chưa nộp câu trả lời</Badge>;
                    }
                    return sAns === cAns ? (
                      <Badge variant="success" className="font-bold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Trả lời ĐÚNG
                      </Badge>
                    ) : (
                      <Badge variant="danger" className="font-bold flex items-center gap-1">
                        <X className="h-3 w-3" /> Trả lời SAI
                      </Badge>
                    );
                  })()}
                </div>

                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {activeQuestion.q}
                </p>

                {/* Options list with requirement exact colors:
                    - Chosen but wrong -> RED
                    - Correct answer -> GREEN (always)
                    - Chosen and correct -> GREEN (already green)
                    - Others -> Neutral/gray
                */}
                <div className="space-y-2.5">
                  {Object.entries(activeQuestion.choices || {}).map(([choiceKey, choiceVal]) => {
                    const qIdStr = activeQuestion.id.toString();
                    const sAns = studentMap[qIdStr];
                    const cAns = correctMap[qIdStr];

                    const isSelected = sAns === choiceKey;
                    const isCorrectChoice = cAns === choiceKey;

                    let choiceStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                    let markerStyle = 'bg-slate-200 text-slate-600 border-slate-300';

                    if (isCorrectChoice) {
                      // Correct answer -> GREEN always
                      choiceStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                      markerStyle = 'bg-emerald-500 text-white border-emerald-500';
                    } else if (isSelected && !isCorrectChoice) {
                      // Student chose this but it is WRONG -> RED
                      choiceStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold';
                      markerStyle = 'bg-rose-500 text-white border-rose-500';
                    } else {
                      // Neutral options
                      choiceStyle = 'bg-slate-50/50 border-slate-150 text-slate-500 opacity-75';
                    }

                    return (
                      <div
                        key={choiceKey}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-xs leading-relaxed transition-all ${choiceStyle}`}
                      >
                        <span className={`h-6 w-6 rounded-full border flex items-center justify-center text-[11px] font-black uppercase shrink-0 ${markerStyle}`}>
                          {choiceKey}
                        </span>
                        <div className="flex-1">
                          <p>{choiceVal as string}</p>
                          {isCorrectChoice && (
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-600 block mt-0.5">
                              Đáp án đúng chuẩn
                            </span>
                          )}
                          {isSelected && !isCorrectChoice && (
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-rose-600 block mt-0.5">
                              Bạn đã chọn phương án này
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text */}
                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-slate-600 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1 font-bold text-slate-700 uppercase tracking-wide">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Giải thích lý thuyết từ Giảng Viên:</span>
                  </div>
                  <p className="font-semibold text-slate-500">
                    Đáp án đúng là <span className="text-emerald-700 font-extrabold uppercase">{(correctMap[activeQuestion.id.toString()] || 'A').toUpperCase()}</span>.
                  </p>
                  <p className="italic">{activeQuestion.explain || 'Giảng viên chưa cập nhật tóm tắt giải thích chi tiết.'}</p>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* COL 2 (RIGHT): PDF / Exam image viewer (Width: 7/12) */}
        <div className="col-span-12 lg:col-span-7 h-full flex flex-col relative overflow-hidden bg-slate-200">
          <div className="bg-slate-300/80 px-4 py-2 border-b border-slate-350 flex justify-between items-center z-10 shrink-0 select-none">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">ẢNH ĐỀ THI / TÀI LIỆU FILE ĐỀ CHÍNH THỨC</span>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">FILE: {(assignment.fileName || 'DE_THI_CHINH_THUC.pdf')}</span>
          </div>

          {/* Scroll canvas */}
          <div className="flex-1 overflow-auto p-6 md:p-8 flex justify-center items-start">
            
            {/* If there is a real fileUrl that has an image or PDF base64 uploaded, render it */}
            {assignment.fileUrl && assignment.fileUrl !== '#' ? (
              <div 
                className="transition-transform duration-150 origin-top shadow-xl border border-slate-300 rounded-lg overflow-hidden bg-white max-w-4xl"
                style={{ transform: `scale(${zoom})` }}
              >
                {assignment.fileUrl.startsWith('data:image') || assignment.fileUrl.endsWith('.jpg') || assignment.fileUrl.endsWith('.png') || assignment.fileUrl.endsWith('.jpeg') ? (
                  <img 
                    src={assignment.fileUrl} 
                    alt="Exam file preview" 
                    className="max-w-full h-auto select-none"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <iframe 
                    src={assignment.fileUrl} 
                    title="Exam Document Frame"
                    className="w-[750px] h-[1000px] border-none"
                  />
                )}
              </div>
            ) : (
              /* High Fidelity Mock Exam Sheet (Rendered precisely) */
              <div 
                className="bg-white shadow-xl border border-slate-300 p-8 md:p-12 rounded-xs max-w-2xl w-full min-h-[900px] transition-transform duration-200 text-slate-800 space-y-6 select-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
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
                  <p className="text-[9px] font-mono font-bold text-slate-500">Đề bài thi trắc nghiệm gồm có {questionsList.length} câu hỏi</p>
                </div>

                {/* Questions sheet */}
                <div className="space-y-6 text-xs font-serif text-slate-900 leading-relaxed text-justify">
                  {questionsList.map((qItem: any) => (
                    <div key={qItem.id} className="space-y-2">
                      <p className="font-bold text-slate-950">
                        Câu {qItem.id}: {qItem.q}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-4 font-normal text-slate-800">
                        <p><span className="font-bold">A.</span> {qItem.choices?.a || 'Đáp án A'}</p>
                        <p><span className="font-bold">B.</span> {qItem.choices?.b || 'Đáp án B'}</p>
                        <p><span className="font-bold">C.</span> {qItem.choices?.c || 'Đáp án C'}</p>
                        <p><span className="font-bold">D.</span> {qItem.choices?.d || 'Đáp án D'}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center font-bold pt-8 text-[11px] text-slate-900 border-t-2 border-dashed border-slate-300 tracking-widest font-mono">
                    --- HẾT ĐỀ BÀI THI ---
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Float Bottom Center Zoom Control HUD */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 flex items-center gap-3.5 shadow-xl select-none">
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className="h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              title="Thu nhỏ"
            >
              <ZoomOut className="h-3.5 w-3.5 text-slate-300" />
            </button>
            <span className="text-[10px] font-mono font-bold tracking-wide select-none">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
              className="h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer border border-slate-700"
              title="Phóng to"
            >
              <ZoomIn className="h-3.5 w-3.5 text-slate-300" />
            </button>
            <div className="h-4 w-px bg-slate-800"></div>
            <button
              type="button"
              onClick={() => setZoom(1.0)}
              className="h-7 w-7 rounded-full bg-slate-850 hover:bg-slate-750 flex items-center justify-center transition-all cursor-pointer"
              title="Khôi phục"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
