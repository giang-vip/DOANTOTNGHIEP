import React, { useState } from 'react';
import { useStudyViewModel } from './useStudyViewModel';
import { Card, Badge, Modal } from '../../../components/UI';
import { DocumentPreviewer } from '../../../components/DocumentPreviewer';
import { QuizTakingView } from './QuizTakingView';
import { QuizReviewPanel } from '../../../components/QuizReviewPanel';
import { useStore } from '../../../models/store';
import { useStudentViewModel } from '../../../viewmodels/useStudentViewModel';
import { Student, Assignment, LearningMaterial } from '../../../types';
import { ChevronLeft } from 'lucide-react';

// Import các sub-panels giao diện đã được tách biệt
import { MaterialsPanel } from './components/MaterialsPanel';
import { AssignmentsPanel } from './components/AssignmentsPanel';
import { AttendancePanel } from './components/AttendancePanel';

interface StudyViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

/**
 * Góc Học Tập của Sinh viên (StudyView)
 * Giao diện chính để sinh viên thực hiện: điểm danh sinh trắc học, tải học liệu và nộp bài kiểm tra.
 * Đã được tái cấu trúc (refactored) tách các tab giao diện ra các component riêng để dễ mở rộng & bảo trì.
 */
export function StudyView({ studentProfile, triggerToast }: StudyViewProps) {
  // Trạng thái & Logic được quản lý thông qua useStudyViewModel
  const {
    selectedClass,
    setSelectedClass,
    searchTerm,
    setSearchTerm,
    materials,
    assignments,
    activeRollCallSessions,
    classSessions,
    attendanceRecords,
    hasCheckedIn,
    activeTab,
    setActiveTab,
    selectedAssignment,
    setSelectedAssignment,
    essayAnswer,
    setEssayAnswer,
    checkIn,
    submitHomework,
    enrolledClasses,
    submissions,
  } = useStudyViewModel(studentProfile);

  // Lấy danh sách câu hỏi và bài làm trắc nghiệm từ Store chính của ứng dụng
  const { quizQuestions, quizAnswers: allQuizAnswers } = useStore();
  const { submitQuizAnswers: submitQuizAnswersToStore } = useStudentViewModel(studentProfile.id);

  // Quản lý trạng thái xem thử tài liệu học tập
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  // Quản lý trạng thái làm bài trắc nghiệm
  const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);

  /**
   * Giả lập tải tệp học liệu thật về máy tính (Xuất định dạng văn bản đính kèm)
   */
  const triggerRealDownload = (mat: LearningMaterial) => {
    const mockContent = `Trường Đại Học Hưng Nhân
Tài liệu học tập chính thức: ${mat.title}
File đính kèm gốc: ${mat.fileName}
Dung lượng: ${mat.fileSize}
Mã tài liệu học liệu: ${mat.id}
Ngày đăng tải: ${mat.uploadedAt || new Date().toISOString()}

Mô tả bài học:
${mat.description || 'Không có mô tả chi tiết từ giảng viên.'}

---
Nội dung tài liệu học tập được phân phối độc quyền trên Cổng Thông Tin Đào Tạo của Đại học Hưng Nhân.
Nghiêm cấm sao chép, chia sẻ hoặc bán lại tài liệu học tập này ra ngoài dưới mọi hình thức trái phép.
Chúc các bạn sinh viên học tập đạt kết quả tốt nhất!`;

    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mat.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Đã tải thành công tệp học liệu thật: "${mat.fileName}"`, 'success');
  };

  /**
   * Khởi động quá trình làm bài trắc nghiệm của sinh viên
   */
  const handleStartQuiz = (asm: Assignment) => {
    setActiveQuiz(asm);
    setIsReviewMode(false);
    triggerToast(`Đã bắt đầu làm bài trắc nghiệm: ${asm.title}.`, 'success');
  };

  /**
   * Kích hoạt chế độ xem lại chi tiết bài làm trắc nghiệm đã nộp trước đó
   */
  const handleReviewQuiz = (asm: Assignment) => {
    setActiveQuiz(asm);
    setIsReviewMode(true);
  };

  // Lọc danh sách lớp học phần dựa trên học kỳ diễn ra / kết thúc
  const currentDateStr = new Date().toISOString().split('T')[0];
  const ongoing = enrolledClasses.filter(c => !c.endDate || c.endDate >= currentDateStr);
  const ended = enrolledClasses.filter(c => c.endDate && c.endDate < currentDateStr);

  return (
    <div className="space-y-6 relative min-h-[550px]">
      {/* TRƯỜNG HỢP 1: CHƯA CHỌN LỚP - HIỂN THỊ DANH SÁCH HỌC PHẦN */}
      {!selectedClass ? (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lớp Học Học Phần & Góc Học Tập</h2>
            <p className="text-xs text-slate-500">Chọn một lớp học phần bên dưới để bắt đầu điểm danh sinh trắc, tải học liệu và nộp bài tập trực tuyến</p>
          </div>

          {/* Học phần đang diễn ra */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Học phần đang diễn ra học kỳ</h3>
            </div>

            {ongoing.length === 0 ? (
              <Card className="p-10 text-center text-xs text-slate-400 font-medium">Bạn chưa đăng ký lớp học phần đang diễn ra nào.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ongoing.map(cls => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className="p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl shadow-sm overflow-hidden transition-all duration-200 bg-white cursor-pointer group flex flex-col justify-between h-52 relative"
                  >
                    <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-3xl opacity-50 group-hover:scale-110 transition-transform"></div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <Badge variant="success" className="text-[9px]">Lớp đang học</Badge>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{cls.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-850 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 pr-4 pt-1">
                        {cls.subjectName}
                      </h4>
                    </div>

                    <div className="space-y-1 border-t pt-3 border-slate-100 text-[10px] text-slate-500">
                      <p>Giảng viên: <strong className="text-slate-700">{cls.teacherName}</strong></p>
                      <p>Phòng học: <strong className="text-slate-700">P.{cls.room}</strong></p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Vào góc học tập <span className="text-xs">→</span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                        {cls.credits} TC
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Học phần đã hoàn thành */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-1">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Học phần đã hoàn thành</h3>
            </div>

            {ended.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có lớp học phần nào đã kết thúc trong lịch sử.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-85">
                {ended.map(cls => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className="p-5 border border-slate-200 hover:border-slate-400 hover:shadow-sm rounded-xl shadow-sm overflow-hidden transition-all duration-200 bg-slate-50/50 cursor-pointer group flex flex-col justify-between h-52"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <Badge variant="gray" className="text-[9px]">Đã kết thúc</Badge>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{cls.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors leading-snug line-clamp-2 pt-1">
                        {cls.subjectName}
                      </h4>
                    </div>

                    <div className="space-y-1 border-t pt-3 border-slate-200 text-[10px] text-slate-400">
                      <p>Giảng viên: {cls.teacherName}</p>
                      <p>Phòng học cũ: P.{cls.room}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem tài liệu/điểm số <span className="text-xs">→</span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">
                        {cls.credits} TC
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: ĐÃ CHỌN LỚP - HIỂN THỊ KHÔNG GIAN HỌC TẬP CHI TIẾT */
        <div className="space-y-6 animate-fade-in">
          {/* Thanh dẫn đường hướng & Tên lớp */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setSelectedClass(null)}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-3xs shrink-0"
                title="Quay lại danh sách lớp"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight">
                  Góc Học Tập: {selectedClass.subjectName}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="font-mono font-bold text-slate-700">{selectedClass.id}</span>
                  <span>•</span>
                  <span>Giảng viên: <strong className="text-slate-700">{selectedClass.teacherName}</strong></span>
                  <span>•</span>
                  <span>Phòng: <strong className="text-slate-700">P.{selectedClass.room}</strong></span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Badge variant={enrolledClasses.some(c => c.id === selectedClass.id && (!c.endDate || c.endDate >= currentDateStr)) ? 'success' : 'gray'}>
                {enrolledClasses.some(c => c.id === selectedClass.id && (!c.endDate || c.endDate >= currentDateStr)) ? 'Học phần đang học' : 'Học phần đã kết thúc'}
              </Badge>
            </div>
          </div>

          {/* Menu chọn các tab chức năng */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${activeTab === 'materials'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-450 hover:text-slate-700'
                }`}
            >
              Tài liệu học tập
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'assignments'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-450 hover:text-slate-700'
                }`}
            >
              Bài tập trực tuyến
              {assignments.length > 0 && (
                <span className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {assignments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'attendance'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-450 hover:text-slate-700'
                }`}
            >
              Điểm danh
              {activeRollCallSessions.length > 0 && activeRollCallSessions.some(s => !hasCheckedIn(s.id)) && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          </div>

          {/* HIỂN THỊ NỘI DUNG TỪNG TAB THÔNG QUA CÁC PANEL RỜI */}
          {activeTab === 'materials' && (
            <MaterialsPanel
              materials={materials}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setPreviewMaterial={setPreviewMaterial}
              triggerRealDownload={triggerRealDownload}
            />
          )}

          {activeTab === 'assignments' && (
            <AssignmentsPanel
              assignments={assignments}
              submissions={submissions}
              studentProfile={studentProfile}
              handleStartQuiz={handleStartQuiz}
              handleReviewQuiz={handleReviewQuiz}
              setSelectedAssignment={setSelectedAssignment}
              setEssayAnswer={setEssayAnswer}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePanel
              activeRollCallSessions={activeRollCallSessions}
              classSessions={classSessions}
              attendanceRecords={attendanceRecords}
              hasCheckedIn={hasCheckedIn}
              checkIn={checkIn}
              triggerToast={triggerToast}
            />
          )}
        </div>
      )}

      {/* MODAL XEM CHI TIẾT TÀI LIỆU HỌC TẬP */}
      {previewMaterial && (
        <Modal
          isOpen={!!previewMaterial}
          onClose={() => setPreviewMaterial(null)}
          title={`Xem Học Liệu Trực Tiếp`}
          size="xl"
        >
          <DocumentPreviewer
            material={previewMaterial}
            onClose={() => setPreviewMaterial(null)}
          />
        </Modal>
      )}

      {/* MODAL LÀM BÀI TẬP TỰ LUẬN (ESSAY) */}
      {selectedAssignment && (selectedAssignment as any).type !== 'quiz' && (
        <Modal
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Làm Bài Tập Tự Luận: ${selectedAssignment.title}`}
          size="lg"
          footer={
            <div className="flex gap-2 justify-end w-full">
              <button
                onClick={() => submitHomework(triggerToast)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Nộp bài giải
              </button>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-1">
              <h4 className="text-xs font-bold text-slate-800">Yêu cầu từ giảng viên:</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{selectedAssignment.description}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Lời giải tự luận của bạn</label>
              <textarea
                value={essayAnswer}
                onChange={(e) => setEssayAnswer(e.target.value)}
                rows={8}
                placeholder="Nhập câu trả lời chi tiết hoặc dán đường dẫn tài liệu Google Drive bài giải của bạn tại đây..."
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline bg-white text-slate-850 leading-relaxed"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* MÀN HÌNH LÀM BÀI TRẮC NGHIỆM VÀ XEM LẠI KẾT QUẢ MỚI */}
      {activeQuiz && !isReviewMode && (
        <QuizTakingView
          assignment={activeQuiz}
          questions={quizQuestions.filter(q => q.assignmentId === activeQuiz.id)}
          onSubmit={(userAnswers) => {
            submitQuizAnswersToStore(activeQuiz.id, activeQuiz.classId, userAnswers);
            triggerToast(`Nộp bài trắc nghiệm thành công!`, 'success');
            setActiveQuiz(null);
          }}
          onCancel={() => setActiveQuiz(null)}
        />
      )}

      {activeQuiz && isReviewMode && (
        <QuizReviewPanel
          mode="result"
          assignment={activeQuiz}
          questions={quizQuestions.filter(q => q.assignmentId === activeQuiz.id)}
          answers={allQuizAnswers.filter(a => {
            const sub = submissions.find(s => s.assignmentId === activeQuiz.id && s.studentId === studentProfile.id);
            return sub ? a.submissionId === sub.id : false;
          })}
          totalScore={
            submissions.find(s => s.assignmentId === activeQuiz.id && s.studentId === studentProfile.id)?.score || 0
          }
          onClose={() => {
            setActiveQuiz(null);
            setIsReviewMode(false);
          }}
        />
      )}
    </div>
  );
}
