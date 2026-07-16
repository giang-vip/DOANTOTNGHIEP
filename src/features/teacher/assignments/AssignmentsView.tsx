import React from 'react';
import { useAssignmentsViewModel } from './useAssignmentsViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { ExamReviewView } from '../../../components/ExamReviewView';
import { Award, Search, Plus, Trash2, Calendar, FileText, CheckCircle2, UserCheck, Play, ChevronRight, X, Sparkles } from 'lucide-react';

interface AssignmentsViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function AssignmentsView({ teacherId, triggerToast }: AssignmentsViewProps) {
  const {
    myClasses,
    selectedClass,
    setSelectedClass,
    assignments,
    selectedAssignment,
    setSelectedAssignment,
    submissions,
    isModalOpen,
    setIsModalOpen,
    openAddModal,
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    maxPoints,
    setMaxPoints,
    asmType,
    setAsmType,
    correctAnswers,
    setCorrectAnswers,
    errors,
    createAssignment,
    deleteAssignment,
    activeSubmission,
    setActiveSubmission,
    gradeScore,
    setGradeScore,
    gradeFeedback,
    setGradeFeedback,
    openGradeModal,
    saveGrade,
    isTestSolving,
    testAnswers,
    setTestAnswers,
    testResult,
    startTestSolve,
    cancelTestSolve,
    submitTestSolve
  } = useAssignmentsViewModel(teacherId);

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [reviewSubmission, setReviewSubmission] = React.useState<any | null>(null);

  const handleCreateAction = () => {
    createAssignment((msg) => triggerToast(msg, 'success'));
  };

  const handleSaveGradeAction = () => {
    saveGrade((msg) => triggerToast(msg, 'success'));
  };

  const handleSubmitSolveAction = () => {
    submitTestSolve((msg) => triggerToast(msg, 'success'));
  };

  const submissionColumns = [
    {
      header: 'MSSV',
      accessor: (s: any) => <span className="font-mono font-semibold text-slate-800">{s.studentId}</span>
    },
    {
      header: 'Học Viên',
      accessor: (s: any) => <span className="font-semibold text-slate-800">{s.studentName}</span>
    },
    {
      header: 'Thời Gian Nộp',
      accessor: (s: any) => <span className="text-xs text-slate-500">{new Date(s.submittedAt).toLocaleString('vi-VN')}</span>
    },
    {
      header: 'Trạng Thái',
      accessor: (s: any) => (
        <Badge variant={s.status === 'graded' ? 'success' : 'gray'}>
          {s.status === 'graded' ? 'Đã chấm điểm' : 'Chờ chấm điểm'}
        </Badge>
      )
    },
    {
      header: 'Điểm Số',
      accessor: (s: any) => (
        <span className="font-bold text-slate-800">
          {s.score !== undefined ? `${s.score} / ${selectedAssignment?.maxPoints || 10}` : 'Chưa chấm'}
        </span>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (s: any) => (
        <div className="flex gap-1.5 justify-end">
          {selectedAssignment && (selectedAssignment as any).type === 'tracnghiem' && (
            <button
              type="button"
              onClick={() => setReviewSubmission(s)}
              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-blue-200"
            >
              Xem bài thi
            </button>
          )}
          <button
            type="button"
            onClick={() => openGradeModal(s)}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {s.status === 'graded' ? 'Sửa điểm' : 'Chấm điểm'}
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upper select and controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bài Tập Trực Tuyến</h2>
          <p className="text-xs text-slate-500">Thiết lập bài trắc nghiệm tự chấm hoặc bài tự luận, nhận xét bài làm học viên</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-56">
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const found = myClasses.find(c => c.id === e.target.value);
                if (found) setSelectedClass(found);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
            >
              {myClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.id} - {cls.subjectName}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Giao bài tập mới
            </button>
          )}
        </div>
      </div>

      {selectedClass ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left block: Assignments list */}
          <div className="lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Danh sách bài tập</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Chọn một bài làm để xem kết quả nộp bài</p>
            </div>

            <div className="space-y-2">
              {assignments.length === 0 ? (
                <Card className="p-4 text-center text-xs text-slate-400 font-medium">
                  Chưa giao bài tập nào kỳ này.
                </Card>
              ) : (
                assignments.map((asm) => {
                  const isSelected = selectedAssignment?.id === asm.id;
                  const isQuiz = (asm as any).type === 'tracnghiem';
                  return (
                    <button
                      key={asm.id}
                      onClick={() => setSelectedAssignment(asm)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 shadow-xs ${
                        isSelected
                          ? 'bg-slate-900 border-slate-950 text-white'
                          : 'bg-white border-slate-150 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant={isQuiz ? 'info' : 'gray'}>
                          {isQuiz ? 'Trắc nghiệm' : 'Tự luận'}
                        </Badge>
                        <span className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-450'}`}>
                          Hạn: {new Date(asm.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold truncate mt-1">{asm.title}</h4>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right block: Work board */}
          <div className="lg:col-span-3 space-y-5">
            {isTestSolving && selectedAssignment ? (
              /* Student Test Solve Simulation Block */
              <Card className="p-6 border-2 border-dashed border-emerald-300 bg-emerald-50/10 space-y-5">
                <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-600 animate-bounce" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-800">Trình Giải Thử (Student View)</h4>
                      <p className="text-[10px] text-emerald-600">Đang trải nghiệm giao diện nộp bài giống hệt như một Sinh Viên</p>
                    </div>
                  </div>
                  <button
                    onClick={cancelTestSolve}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-850">{selectedAssignment.title}</h3>
                  <div className="text-xs text-slate-600 bg-white rounded-lg p-3.5 border border-slate-100 leading-relaxed whitespace-pre-line">
                    {selectedAssignment.description}
                  </div>

                  {/* Quiz questions or text input */}
                  {(selectedAssignment as any).type === 'tracnghiem' ? (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs font-bold text-slate-700">Bộ câu hỏi kiểm tra:</p>
                      
                      {/* Questions loop */}
                      {[1, 2, 3, 4].map((qNum) => (
                        <div key={qNum} className="p-3 bg-white border border-slate-150 rounded-lg space-y-2">
                          <p className="text-xs font-bold text-slate-700">Câu hỏi {qNum}: Chọn đáp án đúng?</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {['a', 'b', 'c', 'd'].map((ans) => {
                              const isChecked = testAnswers[qNum] === ans;
                              return (
                                <button
                                  key={ans}
                                  onClick={() => setTestAnswers(prev => ({ ...prev, [qNum]: ans }))}
                                  className={`py-1.5 px-3 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${
                                    isChecked
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  Đáp án {ans}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Nội dung bài làm (văn bản hoặc link nộp tài liệu)</label>
                      <textarea
                        rows={4}
                        placeholder="Mô phỏng nội dung sinh viên soạn thảo..."
                        className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-750"
                      />
                    </div>
                  )}

                  {testResult && (
                    <div className="p-3.5 bg-emerald-100 text-emerald-800 font-semibold rounded-lg border border-emerald-200 text-xs leading-relaxed">
                      {testResult}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={handleSubmitSolveAction}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Nộp Bài Thử Nghiệm
                    </button>
                    <button
                      onClick={cancelTestSolve}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Thoát Giải Thử
                    </button>
                  </div>
                </div>
              </Card>
            ) : selectedAssignment ? (
              <>
                {/* Assignment Detail summary card */}
                <Card className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={(selectedAssignment as any).type === 'tracnghiem' ? 'info' : 'gray'}>
                        {(selectedAssignment as any).type === 'tracnghiem' ? 'Trắc nghiệm' : 'Tự luận'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {selectedAssignment.id}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-850 mt-1.5 leading-tight">{selectedAssignment.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Hạn nộp: <strong className="text-slate-700">{new Date(selectedAssignment.dueDate).toLocaleString('vi-VN')}</strong> • Thang điểm tối đa: <strong className="text-slate-700">{selectedAssignment.maxPoints}</strong>
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={startTestSolve}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5" /> Giải thử bài tập
                    </button>
                    <button
                      onClick={() => deleteAssignment(selectedAssignment.id, selectedAssignment.title, (msg) => triggerToast(msg, 'success'))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>

                {/* Submissions list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Dữ liệu nộp bài của sinh viên</h4>
                  <Card>
                    <Table
                      data={submissions}
                      columns={submissionColumns}
                      emptyMessage="Chưa có học viên nào nộp bài giải cho bài tập này."
                    />
                  </Card>
                </div>
              </>
            ) : (
              <Card className="p-16 text-center text-slate-400 text-xs font-medium">
                <Award className="h-10 w-10 text-slate-300 mx-auto mb-3 animate-pulse" />
                Vui lòng chọn bài tập bên trái để quản lý hoặc giao bài tập mới.
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-16 text-center text-slate-400 text-sm font-medium">
          Vui lòng chọn một lớp học phần để xem bài tập trực tuyến.
        </Card>
      )}

      {/* Save Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Giao Bài Tập Mới"
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                if (!title.trim()) {
                  triggerToast('Vui lòng nhập tiêu đề để xem trước!', 'danger');
                  return;
                }
                setIsPreviewOpen(true);
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Xem trước (Preview)
            </button>
            <button
              onClick={handleCreateAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Phát hành bài tập
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Soạn thảo đề bài / câu hỏi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-1">Cột trái: Nội dung & Câu hỏi</h4>
            
            <FormInput
              label="Tiêu đề bài tập"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bài tập trắc nghiệm Chương 1..."
              error={errors.title}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Định dạng nộp bài</label>
                <select
                  value={asmType}
                  onChange={(e: any) => setAsmType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline bg-white text-slate-700"
                >
                  <option value="tracnghiem">Trắc nghiệm (Tự động chấm)</option>
                  <option value="tuluan">Tự luận (Chấm thủ công)</option>
                </select>
              </div>

              <FormInput
                label="Hạn nộp bài"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                error={errors.dueDate}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Hướng dẫn / Đề bài chi tiết</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Nhập yêu cầu làm bài, câu hỏi chi tiết..."
                className={`w-full px-3.5 py-2 rounded-lg border text-xs focus:outline bg-white text-slate-750 ${
                  errors.description ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.description && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>}
            </div>
          </div>

          {/* Right Column: Tài liệu đính kèm & Ma trận Rubric */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b pb-1">Cột phải: Đính kèm & Tiêu chí Rubric</h4>
            
            <FormInput
              label="Thang điểm tối đa"
              type="number"
              value={maxPoints}
              onChange={(e) => setMaxPoints(parseInt(e.target.value) || 10)}
              min={1}
              max={100}
            />

            {asmType === 'tracnghiem' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Đáp án đúng (Nhập nhanh)</label>
                <input
                  type="text"
                  value={correctAnswers}
                  onChange={(e) => setCorrectAnswers(e.target.value)}
                  placeholder="Ví dụ: 1-a,2-c,3-b,4-d..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline bg-white text-slate-750 font-mono"
                />
                <p className="mt-1.5 text-[10px] text-slate-400">Định dạng phân tách bằng dấu phẩy: `Câu-Đáp án`. Ví dụ: `1-a,2-c,3-b` (Viết thường)</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tiêu chí đánh giá mẫu (Rubric)</label>
                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-150 text-xs">
                    <p className="font-semibold text-slate-700">1. Đúng định dạng & đủ nội dung (4 điểm)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Trình bày cấu trúc khoa học, giải quyết đủ câu hỏi.</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-150 text-xs">
                    <p className="font-semibold text-slate-700">2. Tính chiều sâu & lập luận (4 điểm)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Có dẫn chứng minh họa, phân tích cốt lõi của bài.</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-150 text-xs">
                    <p className="font-semibold text-slate-700">3. Sáng tạo và chuyên cần (2 điểm)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Nộp đúng hạn chót và có đề xuất tối ưu.</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Đính kèm file đề bài (Tùy chọn)</label>
              <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-white text-center text-xs text-slate-500">
                <FileText className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                <span className="font-medium text-blue-600 hover:underline cursor-pointer">Chọn tệp đính kèm</span> hoặc kéo thả tại đây
                <span className="block text-[9px] text-slate-400 mt-0.5">Hỗ trợ PDF, ZIP, DOCX tối đa 15MB</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Live Preview Modal for Student's View */}
      {isPreviewOpen && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Góc Nhìn Sinh Viên (Xem Trước): ${title}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-700 flex gap-2">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Chế độ xem trước bài phát hành</p>
                <p className="mt-0.5">Đây là cách giao diện bài tập hiển thị trên cổng thông tin sinh viên Hưng Nhân Thông Minh.</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{title || 'Tiêu đề bài tập mới'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Lớp: <span className="font-mono font-semibold">{selectedClass?.id}</span> • Môn học: {selectedClass?.subjectName}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">Thang điểm: {maxPoints}</Badge>
                  <Badge variant="warning">Hạn nộp: {dueDate ? new Date(dueDate).toLocaleString('vi-VN') : 'Không có'}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Yêu cầu & Đề bài chi tiết</h4>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 text-xs text-slate-700 whitespace-pre-line leading-relaxed min-h-[100px]">
                  {description || 'Chưa nhập mô tả hướng dẫn làm bài.'}
                </div>
              </div>

              {asmType === 'tracnghiem' ? (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phần bài làm trắc nghiệm</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="italic text-slate-400">Sinh viên sẽ đánh dấu câu trả lời tương ứng với các đáp án đúng của bạn.</p>
                    <div className="p-3 bg-blue-50/20 border border-blue-100 rounded-lg space-y-2 font-mono">
                      <p className="font-bold text-blue-800">Cấu hình tự động chấm của bạn:</p>
                      <p>{correctAnswers || 'Chưa nhập đáp án'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Khu vực nộp bài của sinh viên</h4>
                  <textarea
                    disabled
                    placeholder="Sinh viên sẽ nhập lời giải bài tự luận hoặc đính kèm link Driver tại đây..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 text-slate-400 cursor-not-allowed focus:outline-hidden"
                  />
                  <div className="border border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 text-center text-xs text-slate-400">
                    Kéo thả file đính kèm câu trả lời của sinh viên tại đây
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Đóng Xem Trước
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Grading Score Submission Modal */}
      {activeSubmission && (
        <Modal
          isOpen={!!activeSubmission}
          onClose={() => setActiveSubmission(null)}
          title={`Chấm Điểm: ${activeSubmission.studentName}`}
          footer={
            <>
              <button
                onClick={handleSaveGradeAction}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Lưu điểm & Nhận xét
              </button>
              <button
                onClick={() => setActiveSubmission(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-150 text-xs">
              <span className="font-semibold block text-slate-500 uppercase text-[9px] tracking-wider mb-1">Nội dung bài làm của học viên</span>
              <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{activeSubmission.content || 'Sinh viên nộp đính kèm link/file.'}</p>
            </div>

            <FormInput
              label={`Điểm số (Thang điểm tối đa: ${selectedAssignment?.maxPoints || 10})`}
              type="number"
              value={gradeScore}
              onChange={(e) => setGradeScore(parseFloat(e.target.value) || 0)}
              min={0}
              max={selectedAssignment?.maxPoints || 10}
              step={0.5}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nhận xét bài làm</label>
              <textarea
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                rows={3}
                placeholder="Ví dụ: Bài giải tốt, trình bày khoa học..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-750"
              />
            </div>
          </div>
        </Modal>
      )}

      {reviewSubmission && selectedAssignment && (
        <ExamReviewView
          assignment={selectedAssignment}
          submission={reviewSubmission}
          studentInfo={{
            name: reviewSubmission.studentName,
            id: reviewSubmission.studentId
          }}
          onClose={() => setReviewSubmission(null)}
        />
      )}
    </div>
  );
}
