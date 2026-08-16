import React from 'react';
import { useAssignmentsViewModel } from './useAssignmentsViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { ExamReviewView } from '../../../components/ExamReviewView';
import { DocumentPreviewer } from '../../../components/DocumentPreviewer';
import { Award, Search, Plus, Trash2, Calendar, FileText, CheckCircle2, UserCheck, Play, ChevronRight, X, Sparkles, Upload, Eye, Download, Edit2, BookOpen } from 'lucide-react';
import { QuizExamBuilderView } from './QuizExamBuilderView';
import { teacherApi } from '../../../api/services/teacherApi';

interface AssignmentsViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info' | 'warning') => void;
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
    quizQuestions,
    configureQuiz,
    isModalOpen,
    setIsModalOpen,
    openAddModal,
    fetchClassAssignments,
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
    examFileUrl,
    setExamFileUrl,
    examFileName,
    setExamFileName,
    examFileType,
    setExamFileType,
    questionCount,
    setQuestionCount,
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
  const [isQuizManagerOpen, setIsQuizManagerOpen] = React.useState(false);
  const [isPreviewExamOpen, setIsPreviewExamOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editDueDate, setEditDueDate] = React.useState('');
  const [editMaxPoints, setEditMaxPoints] = React.useState(10);

  const handleOpenEditModal = () => {
    if (!selectedAssignment) return;
    setEditTitle(selectedAssignment.title);
    setEditDescription(selectedAssignment.description || '');
    
    if (selectedAssignment.dueDate) {
      const date = new Date(selectedAssignment.dueDate);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditDueDate(localTime);
    } else {
      setEditDueDate('');
    }
    
    setEditMaxPoints(selectedAssignment.maxPoints || 10);
    setExamFileUrl(selectedAssignment.examFileUrl || '');
    setExamFileName(selectedAssignment.examFileName || '');
    setExamFileType(selectedAssignment.examFileType || 'pdf');
    setIsEditModalOpen(true);
  };

  const handleSaveEditAction = async () => {
    if (!selectedAssignment) return;
    if (!editTitle.trim()) {
      triggerToast('Tiêu đề không được để trống', 'danger');
      return;
    }
    if (!editDueDate) {
      triggerToast('Hạn nộp không được để trống', 'danger');
      return;
    }

    try {
      await teacherApi.updateAssignment(Number(selectedAssignment.id), {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueAt: new Date(editDueDate).toISOString(),
        maxPoints: editMaxPoints,
        type: selectedAssignment.type,
        examFileUrl: examFileUrl || undefined,
        examFileName: examFileName || undefined,
        examFileType: examFileType || undefined,
        questionCount: selectedAssignment.questionCount || 4
      });

      const updated = {
        ...selectedAssignment,
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: new Date(editDueDate).toISOString(),
        maxPoints: editMaxPoints,
        examFileUrl: examFileUrl,
        examFileName: examFileName,
        examFileType: examFileType
      };
      setSelectedAssignment(updated);

      triggerToast('Cập nhật bài tập thành công!', 'success');
      setIsEditModalOpen(false);
      fetchClassAssignments();
    } catch (err: any) {
      console.error(err);
      triggerToast('Lỗi khi cập nhật bài tập: ' + (err.message || 'Lỗi hệ thống'), 'danger');
    }
  };

  const handleCreateAction = () => {
    createAssignment((msg) => triggerToast(msg, 'success'));
  };

  const handleSaveGradeAction = () => {
    saveGrade((msg) => triggerToast(msg, 'success'));
  };

  const handleSubmitSolveAction = () => {
    submitTestSolve((msg) => triggerToast(msg, 'success'));
  };

  const [isUploading, setIsUploading] = React.useState(false);

  const handleAssignmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | undefined;
    if ('files' in e.target) {
      file = e.target.files?.[0];
    } else if ('dataTransfer' in e) {
      e.preventDefault();
      file = e.dataTransfer.files?.[0];
    }

    if (!file) return;

    const isPdfFile = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    const isImgFile = file.type.startsWith('image/');
    const fileType: 'pdf' | 'image' = isPdfFile ? 'pdf' : 'image';

    try {
      setIsUploading(true);
      triggerToast('Đang tải tệp đính kèm bài tập lên Cloudinary...', 'info');
      const url = await teacherApi.uploadFile(file);
      setExamFileUrl(url as any);
      setExamFileName(file.name);
      setExamFileType(fileType);
      triggerToast('Đã tải lên tệp đính kèm bài tập thành công!', 'success');
    } catch (err: any) {
      console.error(err);
      triggerToast('Lỗi tải tệp lên Cloudinary: ' + (err.message || 'Lỗi hệ thống'), 'danger');
    } finally {
      setIsUploading(false);
    }
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
          {selectedAssignment && (selectedAssignment as any).type === 'quiz' && (
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
                const found = myClasses.find(c => String(c.id) === e.target.value);
                if (found) setSelectedClass(found);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
            >
              {myClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.sectionCode || `LHP-${cls.id}`} - {cls.subjectName}
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
                  const isQuiz = (asm as any).type === 'quiz' || (asm as any).type === 'tracnghiem';
                  return (
                    <button
                      key={asm.id}
                      onClick={() => setSelectedAssignment(asm)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 shadow-xs ${isSelected
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
                  {(selectedAssignment as any).type === 'quiz' || (selectedAssignment as any).type === 'tracnghiem' ? (
                    <div className="space-y-4 pt-2">
                      <p className="text-xs font-bold text-slate-700">Bộ câu hỏi trắc nghiệm đã cấu hình:</p>

                      {(() => {
                        const activeQs = quizQuestions.filter(q => q.assignmentId === selectedAssignment.id);
                        const displayQs = activeQs.length > 0 
                          ? activeQs 
                          : Array.from({ length: selectedAssignment.questionCount || 4 }, (_, i) => ({
                              id: `mock_${i}`,
                              order: i + 1,
                              questionText: `Câu hỏi ${i + 1}`,
                              correctChoice: 'A'
                            }));

                        return displayQs.map((q) => {
                          const qNum = q.order;
                          return (
                            <div key={q.id || qNum} className="p-3 bg-white border border-slate-150 rounded-lg space-y-2">
                              <p className="text-xs font-bold text-slate-700">Câu hỏi {qNum}: {q.questionText || 'Chọn đáp án đúng?'}</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {['A', 'B', 'C', 'D'].map((ans) => {
                                  const isChecked = testAnswers[qNum] === ans;
                                  return (
                                    <button
                                      key={ans}
                                      type="button"
                                      onClick={() => setTestAnswers(prev => ({ ...prev, [qNum]: ans }))}
                                      className={`py-1.5 px-3 rounded-lg border text-xs font-bold capitalize transition-all cursor-pointer ${isChecked
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-750 hover:bg-slate-100'
                                        }`}
                                    >
                                      Đáp án {ans}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Soạn thảo văn bản bài làm</label>
                        <textarea
                          rows={4}
                          value={testAnswers['essayText'] || ''}
                          onChange={(e) => setTestAnswers(prev => ({ ...prev, essayText: e.target.value }))}
                          placeholder="Mô phỏng nội dung sinh viên soạn thảo bài giải tự luận..."
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden bg-white text-slate-750"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Hoặc Nộp bằng link Drive/Github</label>
                          <input
                            type="text"
                            value={testAnswers['essayLink'] || ''}
                            onChange={(e) => setTestAnswers(prev => ({ ...prev, essayLink: e.target.value }))}
                            placeholder="Ví dụ: Link Google Drive bài giải..."
                            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-750"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-650 mb-1.5 uppercase tracking-wide">Hoặc Đính kèm tệp tin giải pháp</label>
                          <div className="relative border border-dashed border-slate-300 bg-white rounded-lg p-2.5 text-center text-xs text-slate-500 hover:border-blue-500 transition-all cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf,image/*,.docx,.zip"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  triggerToast('Đang tải tệp bài làm lên Cloudinary...', 'info');
                                  const res: any = await teacherApi.uploadFile(file);
                                  const fileUrl = res.url || res.data?.url || res;
                                  setTestAnswers(prev => ({ 
                                    ...prev, 
                                    essayFileUrl: typeof fileUrl === 'string' ? fileUrl : String(fileUrl), 
                                    essayFileName: file.name 
                                  }));
                                  triggerToast('Đã đính kèm tệp bài làm giải thử!', 'success');
                                } catch (err: any) {
                                  triggerToast('Lỗi tải tệp: ' + (err.message || 'Lỗi hệ thống'), 'danger');
                                }
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {testAnswers['essayFileName'] ? (
                              <div className="text-emerald-600 font-bold truncate">
                                ✓ Đính kèm: {testAnswers['essayFileName']}
                              </div>
                            ) : (
                              <div className="text-slate-400">
                                Kéo thả hoặc chọn tệp (.pdf, .docx, .zip)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
                      <Badge variant={(selectedAssignment as any).type === 'quiz' || (selectedAssignment as any).type === 'tracnghiem' ? 'info' : 'gray'}>
                        {(selectedAssignment as any).type === 'quiz' || (selectedAssignment as any).type === 'tracnghiem' ? 'Trắc nghiệm' : 'Tự luận'}
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
                    {selectedAssignment && ((selectedAssignment as any).type === 'quiz' || (selectedAssignment as any).type === 'tracnghiem') ? (
                      <button
                        onClick={() => setIsQuizManagerOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <FileText className="h-3.5 w-3.5" /> Quản lý câu hỏi ảnh
                      </button>
                    ) : (
                      <button
                        onClick={startTestSolve}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Play className="h-3.5 w-3.5" /> Giải thử bài tập
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors cursor-pointer"
                      title="Sửa bài tập"
                    >
                      <Edit2 className="h-4 w-4" />
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

                {/* Attached Exam File Previewer / Information block */}
                {selectedAssignment.examFileUrl && (
                  <Card className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-3xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-tight">Đề bài đính kèm</p>
                        <p className="text-[10px] text-slate-450 mt-1 font-semibold truncate max-w-[240px]">
                          {selectedAssignment.examFileName || 'de_bai.pdf'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPreviewExamOpen(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-3xs flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> Xem đề bài
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(selectedAssignment.examFileUrl, '_blank')}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-800 rounded-lg border border-slate-200/50 transition-colors cursor-pointer"
                        title="Tải về file đề bài"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                )}

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
                  <option value="quiz">Trắc nghiệm (Tự động chấm)</option>
                  <option value="essay">Tự luận (Chấm thủ công)</option>
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
                className={`w-full px-3.5 py-2 rounded-lg border text-xs focus:outline bg-white text-slate-750 ${errors.description ? 'border-rose-300' : 'border-slate-200'
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

            {asmType === 'quiz' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Số lượng câu hỏi</label>
                <input
                  type="number"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value) || 4)}
                  min={1}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline bg-white text-slate-750 font-mono"
                />
                <p className="mt-1.5 text-[10px] text-slate-400">Sau khi tạo, bạn có thể cấu hình file đề và đáp án chi tiết.</p>
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
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleAssignmentFileUpload}
                className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 bg-white text-center text-xs text-slate-500 transition-all hover:bg-slate-50/50"
              >
                <input 
                  type="file"
                  accept=".pdf,image/*,.zip,.docx,.doc"
                  onChange={handleAssignmentFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="space-y-1">
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-1.5"></div>
                    <p className="text-blue-600 font-semibold">Đang tải lên Cloudinary...</p>
                  </div>
                ) : examFileName ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-slate-800 truncate max-w-[180px]">{examFileName}</p>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExamFileUrl('');
                          setExamFileName('');
                        }}
                        className="text-[10px] text-rose-600 hover:underline font-semibold block mt-0.5"
                      >
                        Gỡ bỏ file
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1.5" />
                    <span className="font-medium text-blue-600 hover:underline">Chọn tệp đính kèm</span> hoặc kéo thả tại đây
                    <span className="block text-[9px] text-slate-400 mt-0.5">Hỗ trợ PDF, Image, ZIP, DOCX tối đa 15MB</span>
                  </>
                )}
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

              {asmType === 'quiz' ? (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Phần bài làm trắc nghiệm</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="italic text-slate-400">Sinh viên sẽ làm bài trực tuyến với bộ câu hỏi cấu hình.</p>
                    <div className="p-3 bg-blue-50/20 border border-blue-100 rounded-lg space-y-2 font-mono">
                      <p className="font-bold text-blue-800">Cấu hình tự động chấm:</p>
                      <p>Số câu hỏi: {selectedAssignment ? (quizQuestions.filter(q => q.assignmentId === selectedAssignment.id).length || selectedAssignment.questionCount || 4) : 4} câu</p>
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
          size="xl"
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
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-150 text-sm">
              <span className="font-semibold block text-slate-500 uppercase text-[10px] tracking-wider mb-2">Nội dung bài làm của học viên</span>
              <div className="max-h-96 overflow-y-auto pr-2">
                <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{activeSubmission.content || 'Sinh viên nộp đính kèm link/file.'}</p>
              </div>
              {activeSubmission.fileUrl && (
                <div className="mt-3">
                  <a
                    href={activeSubmission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-bold transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Mở / Tải về file bài làm
                  </a>
                </div>
              )}
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
              <label className="block text-sm font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nhận xét bài làm</label>
              <textarea
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                rows={5}
                placeholder="Ví dụ: Bài giải tốt, trình bày khoa học..."
                className="w-full px-3.5 py-3 rounded-lg border border-slate-200 text-sm focus:outline-blue-500 bg-white text-slate-800 resize-y"
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

      {isQuizManagerOpen && selectedAssignment && (
        <QuizExamBuilderView
          teacherId={teacherId}
          assignment={selectedAssignment}
          existingQuestions={quizQuestions.filter(q => q.assignmentId === selectedAssignment.id)}
          onSave={async (assignmentUpdates, newQuestions) => {
            try {
              const { teacherApi } = await import('../../../api/services/teacherApi');
              await teacherApi.updateAssignment(Number(selectedAssignment.id), {
                title: selectedAssignment.title,
                description: selectedAssignment.description,
                dueAt: selectedAssignment.dueDate,
                maxPoints: selectedAssignment.maxPoints,
                type: selectedAssignment.type,
                examFileUrl: assignmentUpdates.examFileUrl || selectedAssignment.examFileUrl,
                examFileName: assignmentUpdates.examFileName || selectedAssignment.examFileName,
                examFileType: assignmentUpdates.examFileType || selectedAssignment.examFileType,
                questionCount: assignmentUpdates.questionCount || selectedAssignment.questionCount
              });
              await configureQuiz(newQuestions, (msg) => triggerToast(msg, 'success'));
              setIsQuizManagerOpen(false);
            } catch (err: any) {
              triggerToast(err.message || 'Lỗi khi cấu hình bài trắc nghiệm', 'danger');
            }
          }}
          onClose={() => setIsQuizManagerOpen(false)}
          triggerToast={triggerToast}
        />
      )}

      {/* Edit Assignment Modal */}
      {isEditModalOpen && selectedAssignment && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Chỉnh Sửa Bài Tập Lớp Học"
          footer={
            <>
              <button
                onClick={handleSaveEditAction}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <FormInput
              label="Tiêu đề bài tập"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Nhập tiêu đề cho bài tập..."
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mô tả và Hướng dẫn</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                placeholder="Nhập hướng dẫn làm bài cho sinh viên..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-750"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Hạn nộp bài"
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />

              <FormInput
                label="Thang điểm tối đa"
                type="number"
                value={editMaxPoints}
                onChange={(e) => setEditMaxPoints(parseInt(e.target.value) || 10)}
                min={1}
                max={100}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Thay đổi tệp đề bài đính kèm (.pdf, .zip, hình ảnh)
              </label>
              <div className="relative border border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-6 text-center text-xs text-slate-500 hover:border-blue-500 transition-all cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,image/*,.docx,.zip"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      triggerToast('Đang tải tệp đề bài lên Cloudinary...', 'info');
                      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
                      const url = await teacherApi.uploadFile(file);
                      setExamFileUrl(url as any);
                      setExamFileName(file.name);
                      setExamFileType(fileType);
                      triggerToast('Đã cập nhật tệp đề bài đính kèm!', 'success');
                    } catch (err: any) {
                      triggerToast('Lỗi tải tệp: ' + (err.message || 'Lỗi hệ thống'), 'danger');
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                {examFileName ? (
                  <p className="font-bold text-blue-700 truncate">{examFileName}</p>
                ) : (
                  <p className="text-slate-400">Kéo thả tệp đề bài mới hoặc bấm để duyệt tệp</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Visual Exam File Preview Modal */}
      {isPreviewExamOpen && selectedAssignment && selectedAssignment.examFileUrl && (
        <Modal
          isOpen={isPreviewExamOpen}
          onClose={() => setIsPreviewExamOpen(false)}
          title={`Xem đề bài: ${selectedAssignment.title}`}
          size="xl"
        >
          <DocumentPreviewer
            material={{
              id: selectedAssignment.id,
              classId: selectedAssignment.classId || '0',
              title: selectedAssignment.title,
              type: selectedAssignment.examFileType || 'pdf',
              fileName: selectedAssignment.examFileName || 'de_bai.pdf',
              fileSize: 'Tệp đính kèm',
              url: selectedAssignment.examFileUrl
            }}
            onClose={() => setIsPreviewExamOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
