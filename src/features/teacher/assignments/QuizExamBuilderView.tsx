import React, { useState, useEffect } from 'react';
import { QuizQuestion, Assignment } from '../../../types';
import { QuizReviewPanel } from '../../../components/QuizReviewPanel';
import { Upload, FileText, Image as ImageIcon, Eye, Save, X, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Interface props cho màn hình QuizExamBuilderView.
 * Dùng cho giảng viên tạo/chỉnh sửa đề thi trắc nghiệm dựa trên 1 file đề PDF/ảnh duy nhất.
 */
export interface QuizExamBuilderViewProps {
  /** ID giảng viên đang thao tác */
  teacherId: string;
  /** Thông tin bài tập trắc nghiệm hiện tại */
  assignment: Assignment;
  /** Danh sách các câu hỏi trắc nghiệm đã có (nếu sửa) */
  existingQuestions?: QuizQuestion[];
  /** Hàm callback khi lưu thành công bài trắc nghiệm */
  onSave: (updatedAssignment: Partial<Assignment>, questions: QuizQuestion[]) => void;
  /** Hàm đóng modal/màn hình soạn đề */
  onClose: () => void;
  /** Hàm kích hoạt thông báo Toast */
  triggerToast?: (message: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

/**
 * Màn hình Soạn Đề Thi Trắc Nghiệm dành cho Giảng viên.
 * Giảng viên chỉ cần:
 * 1. Upload 1 file đề thi duy nhất (PDF/Ảnh)
 * 2. Nhập tổng số câu hỏi (hệ thống tự chia điểm = 10 / số câu)
 * 3. Bấm "Tạo khung câu hỏi" và tick chọn đáp án đúng A/B/C/D cho từng câu
 * 4. (Tuỳ chọn) Nhập thêm nội dung chi tiết & giải thích nâng cao nếu cần
 */
export const QuizExamBuilderView: React.FC<QuizExamBuilderViewProps> = ({
  assignment,
  existingQuestions = [],
  onSave,
  onClose,
  triggerToast,
}) => {
  // State thông tin file đề thi
  // Guard against missing assignment prop
  if (!assignment) {
    console.error('QuizExamBuilderView: assignment prop is required but missing.');
    return null;
  }

  const [examFileUrl, setExamFileUrl] = useState<string>(assignment.examFileUrl || '');
  const [examFileName, setExamFileName] = useState<string>(assignment.examFileName || '');
  const [examFileType, setExamFileType] = useState<'pdf' | 'image'>(assignment.examFileType || 'pdf');

  // State số lượng câu hỏi (mặc định 5 nếu chưa có)
  const [questionCountInput, setQuestionCountInput] = useState<number>(
    assignment.questionCount || existingQuestions.length || 5
  );

  // State danh sách các câu hỏi đang thiết lập
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // State quản lý việc mở/đóng "Tuỳ chọn nâng cao" cho từng câu (theo index)
  const [expandedAdvanced, setExpandedAdvanced] = useState<Record<number, boolean>>({});

  // State điều khiển mở Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Khởi tạo danh sách câu hỏi ban đầu khi mở màn hình
  useEffect(() => {
    try {
      if (existingQuestions.length > 0) {
        setQuestions(existingQuestions);
      } else {
        generateDefaultQuestions(questionCountInput);
      }
    } catch (err) {
      console.error('QuizExamBuilderView: useEffect initialization error', err);
    }
  }, []);

  // Sinh tự động N câu hỏi trống với điểm bằng nhau (10 / N)
  const generateDefaultQuestions = (count: number) => {
    if (count <= 0) return;
    const pointsPerQuestion = Number((10 / count).toFixed(2));
    const newQuestions: QuizQuestion[] = Array.from({ length: count }, (_, i) => ({
      id: questions[i]?.id || `q_temp_${Date.now()}_${i + 1}`,
      assignmentId: assignment.id,
      order: i + 1,
      correctChoice: questions[i]?.correctChoice || 'A', // Mặc định A, GV tick lại
      points: pointsPerQuestion,
      questionText: questions[i]?.questionText || '',
      choiceAText: questions[i]?.choiceAText || '',
      choiceBText: questions[i]?.choiceBText || '',
      choiceCText: questions[i]?.choiceCText || '',
      choiceDText: questions[i]?.choiceDText || '',
      explanationText: questions[i]?.explanationText || '',
    }));
    setQuestions(newQuestions);
  };

  // Xử lý khi nhấn nút "Tạo khung câu hỏi"
  const handleCreateQuestionFrames = () => {
    if (questionCountInput <= 0 || questionCountInput > 100) {
      triggerToast?.('Số câu hỏi phải từ 1 đến 100 câu', 'warning');
      return;
    }
    generateDefaultQuestions(questionCountInput);
    triggerToast?.(`Đã tạo khung cho ${questionCountInput} câu hỏi (Mỗi câu ${(10 / questionCountInput).toFixed(2)}đ)`, 'info');
  };

  // Xử lý upload giả lập file đề thi (PDF hoặc Ảnh)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const isPdfFile = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isImgFile = file.type.startsWith('image/');

      if (!isPdfFile && !isImgFile) {
        triggerToast?.('Chỉ hỗ trợ upload file định dạng PDF hoặc Ảnh (PNG, JPG, JPEG)', 'warning');
        return;
      }

      const fileType: 'pdf' | 'image' = isPdfFile ? 'pdf' : 'image';
      const fakeUrl = URL.createObjectURL(file);

      setExamFileUrl(fakeUrl);
      setExamFileName(file.name);
      setExamFileType(fileType);
      triggerToast?.(`Đã tải lên file đề thi: ${file.name}`, 'success');
    } catch (err) {
      console.error('QuizExamBuilderView: file upload error', err);
      triggerToast?.('Có lỗi khi tải lên file đề thi.', 'danger');
    }

  };

  // Đổi đáp án đúng của câu X
  const handleSelectCorrectChoice = (index: number, choice: 'A' | 'B' | 'C' | 'D') => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, correctChoice: choice } : q))
    );
  };

  // Cập nhật trường tuỳ chọn nâng cao của câu X
  const handleUpdateAdvancedField = (index: number, field: keyof QuizQuestion, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  // Bật/tắt khối tuỳ chọn nâng cao cho câu X
  const toggleAdvanced = (index: number) => {
    setExpandedAdvanced((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Xử lý Lưu Đề Thi
  const handleSaveExam = () => {
    try {
      if (!examFileUrl && !examFileName) {
        triggerToast?.('Vui lòng chọn 1 file đề thi chính thức (PDF/Ảnh) trước khi lưu!', 'danger');
        return;
      }

      if (questions.length === 0) {
        triggerToast?.('Vui lòng tạo khung câu hỏi và thiết lập đáp án đúng!', 'danger');
        return;
      }

      const updatedAssignmentPayload: Partial<Assignment> = {
        maxPoints: 10,
        type: 'quiz',
        examFileUrl: examFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        examFileName: examFileName || 'DE_THI_CHINH_THUC.PDF',
        examFileType: examFileType,
        questionCount: questions.length,
      };

      onSave(updatedAssignmentPayload, questions);
      triggerToast?.('Đã lưu đề thi trắc nghiệm thành công!', 'success');
      onClose();
    } catch (err) {
      console.error('QuizExamBuilderView: save exam error', err);
      triggerToast?.('Có lỗi khi lưu đề thi.', 'danger');
    }

  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Soạn Đề Thi Trắc Nghiệm (Dựa Trên File Đề Mẫu)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bài tập: <span className="text-slate-200 font-semibold">{assignment.title}</span> • Thang điểm cố định: 10đ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính Soạn đề */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          {/* HƯỚNG DẪN TÓM TẮT */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-950 mb-0.5">Quy trình soạn đề trắc nghiệm chuẩn:</p>
              <p className="text-indigo-800">
                1. Upload 1 file đề thi duy nhất (PDF/Ảnh) đã in sẵn toàn bộ câu hỏi & đáp án.{' '}
                2. Nhập số câu hỏi để tự chia đều 10 điểm.{' '}
                3. Tick chọn đáp án đúng A/B/C/D cho từng câu. Sinh viên sẽ mở file đề bên cạnh và chỉ việc chọn đáp án.
              </p>
            </div>
          </div>

          {/* BƯỚC 1: UPLOAD FILE ĐỀ THI & NHẬP SỐ CÂU HỎI */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              File Đề Thi & Khung Số Câu Hỏi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Ô upload file */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chọn file đề thi chính thức (PDF hoặc Ảnh) *
                </label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-50 hover:bg-indigo-50/30 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {examFileName ? (
                    <div className="flex items-center justify-center gap-3">
                      {examFileType === 'pdf' ? (
                        <FileText className="w-8 h-8 text-rose-500" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-indigo-500" />
                      )}
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[200px]">{examFileName}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã sẵn sàng
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">Bấm để tải file đề (PDF / PNG / JPG)</p>
                      <p className="text-[10px] text-slate-400">File chứa toàn bộ câu hỏi và đáp án in sẵn</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ô số câu hỏi & nút tạo khung */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Số lượng câu hỏi (Chia đều thang 10 điểm) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={questionCountInput}
                    onChange={(e) => setQuestionCountInput(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="VD: 5, 10, 20..."
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Điểm mỗi câu dự kiến: <span className="font-bold text-indigo-600">{(10 / (questionCountInput || 1)).toFixed(2)}đ</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCreateQuestionFrames}
                  className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                >
                  Tạo khung {questionCountInput} câu hỏi
                </button>
              </div>
            </div>
          </div>

          {/* BƯỚC 2: DANH SÁCH CÂU HỎI & TICK ĐÁP ÁN ĐÚNG */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
                Thiết Lập Đáp Án Đúng Cho Từng Câu ({questions.length} câu)
              </h3>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Thang điểm: 10.0đ
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                Chưa có câu hỏi nào. Nhập số câu và bấm "Tạo khung câu hỏi" ở trên.
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((q, index) => {
                  const isExpanded = expandedAdvanced[index] || false;
                  return (
                    <div
                      key={q.id || index}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-all space-y-3"
                    >
                      {/* Dòng chính: Nhãn câu + điểm + 4 nút chọn đáp án */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">
                            Câu {q.order || index + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {q.points.toFixed(2)}đ
                          </span>
                        </div>

                        {/* 4 Nút Radio to chọn A/B/C/D */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600 mr-1">Đáp án đúng:</span>
                          {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                            const isSelected = q.correctChoice === choice;
                            return (
                              <button
                                key={choice}
                                type="button"
                                onClick={() => handleSelectCorrectChoice(index, choice)}
                                className={`w-9 h-9 rounded-lg font-bold text-sm transition-all flex items-center justify-center border ${isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                              >
                                {choice}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nút thu gọn / mở rộng khối nâng cao */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => toggleAdvanced(index)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 focus:outline-none"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Tuỳ chọn nâng cao (Gõ lại text câu hỏi/đáp án/giải thích)
                        </button>

                        {/* Khối tuỳ chọn nâng cao (ẩn/hiện) */}
                        {isExpanded && (
                          <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Nội dung câu hỏi (tuỳ chọn - không bắt buộc):
                              </label>
                              <input
                                type="text"
                                value={q.questionText || ''}
                                onChange={(e) => handleUpdateAdvancedField(index, 'questionText', e.target.value)}
                                placeholder="Nhập text câu hỏi nếu muốn hiển thị thay vì chỉ đọc trong PDF..."
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {(['A', 'B', 'C', 'D'] as const).map((ch) => {
                                const fieldKey = `choice${ch}Text` as keyof QuizQuestion;
                                return (
                                  <div key={ch}>
                                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                                      Nội dung phương án {ch} (tuỳ chọn):
                                    </label>
                                    <input
                                      type="text"
                                      value={(q[fieldKey] as string) || ''}
                                      onChange={(e) => handleUpdateAdvancedField(index, fieldKey, e.target.value)}
                                      placeholder={`Nội dung A/B/C/D...`}
                                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded text-xs"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Giải thích lý thuyết cho sinh viên (tuỳ chọn):
                              </label>
                              <textarea
                                rows={2}
                                value={q.explanationText || ''}
                                onChange={(e) => handleUpdateAdvancedField(index, 'explanationText', e.target.value)}
                                placeholder="Giải thích chi tiết vì sao đáp án này đúng để SV học tập sau khi nộp bài..."
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER NÚT BẤM (XEM TRƯỚC / LƯU) */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            disabled={questions.length === 0}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 border border-slate-700"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            Xem trước / Thử bài
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSaveExam}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu Đề Thi Trắc Nghiệm
            </button>
          </div>
        </div>
      </div>

      {/* MODAL XEM TRƯỚC (PREVIEW MODE) */}
      {isPreviewOpen && (
        <QuizReviewPanel
          mode="preview"
          assignment={{
            ...assignment,
            examFileUrl,
            examFileName,
            examFileType,
            maxPoints: 10,
          }}
          questions={questions}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
};
