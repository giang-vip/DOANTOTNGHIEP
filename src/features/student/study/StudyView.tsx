import React, { useState, useEffect, useRef } from 'react';
import { useStudyViewModel } from './useStudyViewModel';
import { Card, Badge, Modal } from '../../../components/UI';
import { DocumentPreviewer } from '../../../components/DocumentPreviewer';
import { ExamReviewView } from '../../../components/ExamReviewView';
import { Student, Assignment, LearningMaterial, ClassSection, Submission } from '../../../types';
import { useStore } from '../../../models/store';
import {
  BookOpen, Sparkles, Send, Download, HelpCircle, FileText, Bot, User,
  Loader2, ArrowRight, CheckCircle2, MapPin, ShieldAlert, Award, FileSpreadsheet,
  ScanFace, CalendarDays, FileCheck, CheckSquare, Plus, Clock, Eye, AlertCircle,
  X, MessageSquare, RefreshCw, ChevronLeft, ZoomIn, ZoomOut, RotateCcw, Check
} from 'lucide-react';

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

interface StudyViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function StudyView({ studentProfile, triggerToast }: StudyViewProps) {
  const {
    enrolledClasses,
    selectedClass,
    setSelectedClass,
    materials,
    assignments,
    submissions,
    attendanceRecords,
    activeRollCallSessions,
    classSessions,
    hasCheckedIn,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedAssignment,
    setSelectedAssignment,
    essayAnswer,
    setEssayAnswer,
    quizAnswers,
    setQuizAnswers,
    checkIn,
    submitHomework,
    chatInput,
    setChatInput,
    messages,
    isLoading,
    sendAIChat
  } = useStudyViewModel(studentProfile);

  const { addSubmission, updateGrades } = useStore();

  // Materials Preview Modal State
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  // Attendance AI biometric States
  const [faceScanning, setFaceScanning] = useState(false);
  const [faceScanPercent, setFaceScanPercent] = useState(0);
  const [faceScanStatus, setFaceScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [gpsChecking, setGpsChecking] = useState(false);

  // Quiz active execution state
  const [activeQuiz, setActiveQuiz] = useState<Assignment | null>(null);
  const [quizTimer, setQuizTimer] = useState<number>(0); // remaining seconds
  const [quizActiveAnswers, setQuizActiveAnswers] = useState<Record<string, string>>({});
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [quizZoom, setQuizZoom] = useState<number>(1.0);
  const [activeQuizTab, setActiveQuizTab] = useState<'answers' | 'expand' | 'info'>('answers');
  const [notesText, setNotesText] = useState<string>('');
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiChatLogs, setAiChatLogs] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Chào bạn! Đây là khung nháp kết hợp Trợ lý AI. Bạn có thể ghi chú bài học tại đây hoặc nhập thắc mắc để mình giải thích nhanh các câu hỏi lý thuyết nhé.' }
  ]);
  const [isQuickFillOpen, setIsQuickFillOpen] = useState<boolean>(false);
  const [quickFillValue, setQuickFillValue] = useState<string>( '');

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

  // Quiz Countdown Timer Effect
  useEffect(() => {
    if (isReviewMode) return;
    if (!activeQuiz || quizTimer <= 0) {
      if (activeQuiz && quizTimer === 0) {
        handleAutoSubmitQuiz();
      }
      return;
    }
    const interval = setInterval(() => {
      setQuizTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, quizTimer, isReviewMode]);

  const handleStartQuiz = (asm: Assignment) => {
    setActiveQuiz(asm);
    setQuizTimer(600); // 10 minutes (600 seconds)
    setQuizActiveAnswers({});
    setIsReviewMode(false);
    setQuizZoom(1.0);
    setActiveQuizTab('answers');
    triggerToast(`Đã bắt đầu làm bài trắc nghiệm: ${asm.title}. Thời gian làm bài là 10 phút.`, 'success');
  };

  const handleReviewQuiz = (asm: Assignment) => {
    const sub = submissions.find(s => s.assignmentId === asm.id && s.studentId === studentProfile.id);
    if (sub) {
      const parsedAnswers: Record<string, string> = {};
      const detailPart = sub.content.split('Chi tiết: ')[1];
      if (detailPart) {
        const pairs = detailPart.split(', ');
        pairs.forEach(p => {
          const match = p.match(/Câu\s*(\d+):\s*([A-D])/i);
          if (match) {
            parsedAnswers[match[1]] = match[2].toLowerCase();
          }
        });
      }
      setQuizActiveAnswers(parsedAnswers);
    } else {
      setQuizActiveAnswers({});
    }
    setActiveQuiz(asm);
    setIsReviewMode(true);
    setQuizTimer(0);
    setQuizZoom(1.0);
    setActiveQuizTab('answers');
  };

  const parseQuickFill = (text: string): Record<string, string> => {
    const results: Record<string, string> = {};
    const cleaned = text.trim();
    const regex = /(\d+)\s*[:.\-–]?\s*([a-dA-D])/g;
    let match;
    while ((match = regex.exec(cleaned)) !== null) {
      const qNum = match[1];
      const answer = match[2].toLowerCase();
      results[qNum] = answer;
    }
    return results;
  };

  const handleQuickFillSubmit = () => {
    const parsed = parseQuickFill(quickFillValue);
    if (Object.keys(parsed).length === 0) {
      triggerToast('Không nhận diện được đáp án nào từ chuỗi đã nhập! Định dạng hợp lệ ví dụ: "1A2B3C4D5B" hoặc "1:A, 2:B".', 'danger');
      return;
    }
    setQuizActiveAnswers(prev => ({ ...prev, ...parsed }));
    setIsQuickFillOpen(false);
    setQuickFillValue('');
    triggerToast(`Đã tự động điền thành công ${Object.keys(parsed).length} câu trả lời trong tích tắc!`, 'success');
  };

  const sendQuickAiQuestion = async () => {
    if (!aiQuestion.trim() || isAiLoading) return;
    const userText = aiQuestion.trim();
    setAiQuestion('');
    setAiChatLogs(prev => [...prev, { role: 'user', text: userText }]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          subjectName: selectedClass?.subjectName || 'Công nghệ thông tin'
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setAiChatLogs(prev => [...prev, { role: 'ai', text: data.text || 'Mình chưa có câu trả lời phù hợp, vui lòng thử lại.' }]);
    } catch (err) {
      // Fallback answers based on keywords
      let reply = 'Cảm ơn bạn đã hỏi. Trợ lý AI đang bận kết nối máy chủ, hãy thử ghi lại sau nhé.';
      const lower = userText.toLowerCase();
      if (lower.includes('câu 1') || lower.includes('định vị') || lower.includes('gps')) {
        reply = 'Giải thích từ AI Buddy:\n- **Câu 1**: Đáp án đúng là **B** (GPS & AI nhận diện diện mạo). Vì đây là hai nhân tố sinh trắc học và vị trí cốt lõi giúp hệ thống tự động xác minh sinh viên có mặt thực tế tại phòng học mà không cần thầy cô điểm danh thủ công.';
      } else if (lower.includes('câu 2') || lower.includes('tiết học')) {
        reply = 'Giải thích từ AI Buddy:\n- **Câu 2**: Đáp án đúng là **C** (Tối đa 12 tiết học mỗi ngày). Ở Hưng Nhân University, mỗi ngày chia tối đa làm 12 tiết: Sáng từ tiết 1 đến tiết 6, chiều từ tiết 7 đến tiết 12.';
      } else if (lower.includes('câu 3') || lower.includes('mvvm')) {
        reply = 'Giải thích từ AI Buddy:\n- **Câu 3**: Đáp án đúng là **B** (ViewModel). Trong MVVM, ViewModel là thành phần chịu trách nhiệm làm cầu nối trung gian, quản lý trạng thái hiển thị và liên kết dữ liệu thô từ Model sang View.';
      } else if (lower.includes('câu 4') || lower.includes('thang điểm')) {
        reply = 'Giải thích từ AI Buddy:\n- **Câu 4**: Đáp án đúng là **B** (Thang điểm 10). Các cột điểm thành phần và điểm kiểm tra giữa kỳ, cuối kỳ đều tính theo thang điểm 10 trước khi quy đổi.';
      } else if (lower.includes('câu 5') || lower.includes('bán kính') || lower.includes('geofence')) {
        reply = 'Giải thích từ AI Buddy:\n- **Câu 5**: Đáp án đúng là **B** (Đảm bảo tính trung thực...). Việc giới hạn khoảng 100m bằng hàng rào địa lý Geo-fencing nhằm ngăn chặn hành vi điểm danh hộ từ xa, xác nhận vị trí địa lý của sinh viên thực tế.';
      } else {
        reply = 'Mình khuyên bạn nên xem kỹ phần nội dung tóm tắt lý thuyết của từng câu hỏi hiển thị trực tiếp ở phần đề bài để làm bài đạt kết quả cao nhất!';
      }
      setAiChatLogs(prev => [...prev, { role: 'ai', text: reply }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAutoSubmitQuiz = () => {
    if (!activeQuiz) return;
    triggerToast('Hết giờ làm bài! Hệ thống tự động nộp kết quả trắc nghiệm của bạn.', 'danger');
    submitQuizAnswers(quizActiveAnswers, activeQuiz);
  };

  const submitQuizAnswers = (answers: Record<string, string>, quizAsm: Assignment) => {
    const hasCustomQuestions = (quizAsm as any).questions && (quizAsm as any).questions.length > 0;
    const questionsList = hasCustomQuestions ? (quizAsm as any).questions : mockQuizQuestions;
    
    let correctCount = 0;
    questionsList.forEach((qItem: any) => {
      const qIdStr = qItem.id.toString();
      if (answers[qIdStr]?.toLowerCase() === qItem.correct?.toLowerCase()) {
        correctCount += 1;
      }
    });

    const totalQ = questionsList.length;
    const score = totalQ > 0 ? Math.round(((correctCount / totalQ) * (quizAsm.maxPoints || 10)) * 10) / 10 : 0;

    const contentStr = Object.entries(answers)
      .map(([q, a]) => `Câu ${q}: ${a.toUpperCase()}`)
      .join(', ') || 'Không làm câu nào';

    // Save submission as graded
    addSubmission({
      assignmentId: quizAsm.id,
      classId: quizAsm.classId,
      studentId: studentProfile.id,
      studentName: studentProfile.name,
      content: `Kết quả Trắc Nghiệm: ${score}/${quizAsm.maxPoints || 10}đ. Chi tiết: ${contentStr}`,
      status: 'graded',
      score,
      feedback: `Tự động chấm điểm trắc nghiệm: Đúng ${correctCount}/${totalQ} câu.`
    } as any);

    // Sync to GradeRecord directly
    const gradeId = `${quizAsm.classId}_${studentProfile.id}`;
    updateGrades([
      {
        id: gradeId,
        classId: quizAsm.classId,
        studentId: studentProfile.id,
        studentName: studentProfile.name,
        scores: {
          col_1: score // auto saves to TX2 / Quiz score
        }
      } as any]
    );

    setActiveQuiz(null);
    setIsReviewMode(false);
    triggerToast(`Nộp bài Trắc Nghiệm thành công! Bạn đạt ${score} / 10 điểm. Điểm số đã đồng bộ vào bảng điểm.`, 'success');
  };

  const handleHandSubmitQuiz = () => {
    if (confirm('Bạn có chắc chắn muốn nộp bài trắc nghiệm này không?')) {
      submitQuizAnswers(quizActiveAnswers, activeQuiz!);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendAIChat();
    }
  };

  // Simulated GPS positioning check
  const handleGPSCheckIn = (sessionId: string) => {
    setGpsChecking(true);
    setTimeout(() => {
      setGpsChecking(false);
      checkIn(sessionId, 'gps', triggerToast);
    }, 1500);
  };

  // Face ID biometrics scanning simulation
  const startBiometricFaceScan = (forceSuccess: boolean) => {
    setFaceScanning(true);
    setFaceScanStatus('scanning');
    setFaceScanPercent(15);
    
    // Simulate progression
    const intervals = [
      setTimeout(() => setFaceScanPercent(42), 500),
      setTimeout(() => setFaceScanPercent(78), 1100),
      setTimeout(() => setFaceScanPercent(98), 1700),
    ];

    setTimeout(() => {
      setFaceScanning(false);
      if (forceSuccess) {
        setFaceScanPercent(100);
        setFaceScanStatus('success');
        const activeSession = activeRollCallSessions[0];
        if (activeSession) {
          checkIn(activeSession.id, 'face', triggerToast);
        } else {
          triggerToast('Không tìm thấy phiên điểm danh hoạt động!', 'danger');
        }
      } else {
        setFaceScanStatus('failed');
        triggerToast('Lỗi quét: Không tìm thấy khuôn mặt khớp với ID sinh viên trong cơ sở dữ liệu. Vui lòng căn chỉnh lại góc camera hoặc chụp ở nơi đủ sáng.', 'danger');
      }
    }, 2200);
  };

  // Categorize enrolled classes for selecting
  const currentDateStr = new Date().toISOString().split('T')[0];
  const ongoingClasses = enrolledClasses.filter(c => !c.endDate || c.endDate >= currentDateStr);
  const endedClasses = enrolledClasses.filter(c => c.endDate && c.endDate < currentDateStr);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <div className="h-9 w-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-red-150">PDF</div>;
      case 'doc':
        return <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-blue-150">DOC</div>;
      case 'ppt':
        return <div className="h-9 w-9 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-orange-150">PPT</div>;
      case 'video':
        return <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-emerald-150">MP4</div>;
      default:
        return <div className="h-9 w-9 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center shrink-0"><FileText className="h-4 w-4" /></div>;
    }
  };

  // Get status for each homework assignment
  const getAssignmentStatus = (asm: Assignment) => {
    const sub = submissions.find(s => s.assignmentId === asm.id && s.studentId === studentProfile.id);
    if (!sub) return { label: 'Chưa làm', variant: 'gray' as const, submitted: false };
    if (sub.status === 'graded') return { label: `Đã chấm: ${sub.score}đ`, variant: 'success' as const, submitted: true, graded: true, feedback: sub.feedback, submission: sub };
    return { label: 'Đã nộp, chờ chấm', variant: 'info' as const, submitted: true, graded: false, submission: sub };
  };

  const formatMsgText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content: React.ReactNode = line;
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      if (isBullet) {
        const rawContent = line.trim().substring(2);
        content = <li className="ml-4 list-disc pl-1">{formatInlineMarkdown(rawContent)}</li>;
      } else {
        content = formatInlineMarkdown(line);
      }
      return <p key={idx} className="min-h-[1rem] leading-relaxed">{content}</p>;
    });
  };

  const formatInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6 relative min-h-[550px]">
      {/* CASE 1: NO CLASS SELECTED - SHOW RICH GRID OPTIONS WITH ACTIVE vs COMPLETED CATEGORIZATION */}
      {!selectedClass ? (
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lớp Học Học Phần & Góc Học Tập</h2>
            <p className="text-xs text-slate-500">Chọn một lớp học phần bên dưới để bắt đầu điểm danh sinh trắc, tải học liệu và nộp bài tập trực tuyến</p>
          </div>

          {/* Ongoing classes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Học phần đang diễn ra học kỳ</h3>
            </div>

            {ongoingClasses.length === 0 ? (
              <Card className="p-10 text-center text-xs text-slate-400 font-medium">Bạn chưa đăng ký lớp học phần đang diễn ra nào.</Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {ongoingClasses.map(cls => (
                  <div
                    key={cls.id}
                    onClick={() => setSelectedClass(cls)}
                    className="p-5 border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl shadow-sm overflow-hidden transition-all duration-200 bg-white cursor-pointer group flex flex-col justify-between h-52 relative"
                  >
                    {/* Background accent */}
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

                    <div className="space-y-1 border-t pt-3 border-slate-100">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Giảng viên: <strong className="text-slate-700">{cls.teacherName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Phòng học: <strong className="text-slate-700">P.{cls.room}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Vào góc học tập <ArrowRight className="h-3 w-3" />
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

          {/* Completed classes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-1">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Học phần đã hoàn thành</h3>
            </div>

            {endedClasses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa có lớp học phần nào đã kết thúc trong lịch sử.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-85">
                {endedClasses.map(cls => (
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

                    <div className="space-y-1 border-t pt-3 border-slate-200">
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Giảng viên: {cls.teacherName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Phòng học cũ: P.{cls.room}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Xem tài liệu/điểm số <ArrowRight className="h-3 w-3" />
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
        /* CASE 2: DETAILED STUDENT CLASS WORKSPACE */
        <div className="space-y-6 animate-fade-in">
          {/* Workspace Upper Navigation */}
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
              <Badge variant={ongoingClasses.some(c => c.id === selectedClass.id) ? 'success' : 'gray'}>
                {ongoingClasses.some(c => c.id === selectedClass.id) ? 'Học phần đang học' : 'Học phần đã kết thúc'}
              </Badge>
            </div>
          </div>

          {/* Navigation Workspace Tabs: EXACTLY THE 3 REQUIRED LABELS */}
          <div className="flex border-b border-slate-200 gap-6">
            <button
              onClick={() => setActiveTab('materials')}
              className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              Tài liệu học tập
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'assignments'
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
              className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'attendance'
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

          {/* TAB CONTENT 1: TÀI LIỆU HỌC TẬP */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Kho dữ liệu học liệu học phần</h3>
                <div className="relative w-48">
                  <input
                    type="text"
                    placeholder="Tìm tài liệu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline bg-white text-slate-850"
                  />
                </div>
              </div>

              {materials.length === 0 ? (
                <Card className="p-12 text-center text-xs text-slate-400 font-medium">Không tìm thấy bài giảng hoặc giáo trình nào.</Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((mat) => (
                    <Card
                      key={mat.id}
                      className="p-4 flex items-center justify-between gap-3 hover:border-blue-200 transition-all bg-white shadow-3xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(mat.type)}
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-800 truncate" title={mat.title}>
                            {mat.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium">{mat.fileSize || '2.4 MB'} • Đăng lúc: {new Date(mat.uploadedAt || '').toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Preview button */}
                        <button
                          onClick={() => setPreviewMaterial(mat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Xem trước nội dung"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {/* Download button */}
                        <button
                          type="button"
                          onClick={() => triggerRealDownload(mat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
                          title="Tải tệp"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: BÀI TẬP TRỰC TUYẾN (With Quiz Mode & Re-submission) */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Yêu cầu bài tập học tập trực tuyến</h3>

              {assignments.length === 0 ? (
                <Card className="p-12 text-center text-xs text-slate-400 font-medium">Lớp học phần này chưa có bài tập trực tuyến nào từ giảng viên.</Card>
              ) : (
                <div className="space-y-3">
                  {assignments.map((asm) => {
                    const status = getAssignmentStatus(asm);
                    const isQuiz = (asm as any).type === 'tracnghiem';
                    return (
                      <Card key={asm.id} className="p-5 hover:border-slate-300 transition-all bg-white shadow-3xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-850">{asm.title}</h4>
                              <Badge variant={status.variant}>{status.label}</Badge>
                              <Badge variant="gray">Loại: {isQuiz ? 'Trắc nghiệm' : 'Tự luận'}</Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold">Hạn nộp bài: {new Date(asm.dueDate).toLocaleString('vi-VN')} • Thang điểm tối đa: {asm.maxPoints}đ</p>
                          </div>

                          {/* Submit controls */}
                          <div className="flex gap-2 shrink-0">
                            {/* Option 1: Not submitted yet */}
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
                                {isQuiz ? 'Bắt đầu làm bài thi' : 'Làm bài nộp'}
                              </button>
                            )}

                            {/* Option 2: Re-submission is allowed for Essay before deadline */}
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

                            {/* Option 3: Review Quiz for Submitted Quizzes */}
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

                        {/* Review submitted content detail if submitted */}
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
          )}

          {/* TAB CONTENT 3: ĐIỂM DANH (With Face ID Biometric overlay & Camera simulation) */}
          {activeTab === 'attendance' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Điểm danh sinh trắc học Face ID & Vị trí</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Xác thực sinh trắc học khuôn mặt thông minh và GPS Geo-fence trường học</p>
                </div>
                <Badge variant={activeRollCallSessions.length > 0 ? 'success' : 'gray'}>
                  {activeRollCallSessions.length > 0 ? `${activeRollCallSessions.length} phiên đang mở` : 'Không có phiên điểm danh'}
                </Badge>
              </div>

              {activeRollCallSessions.length > 0 ? (
                <div className="space-y-3">
                  {activeRollCallSessions.map(session => {
                    const checkedIn = hasCheckedIn(session.id);
                    return (
                      <Card key={session.id} className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{session.title}</h4>
                          <Badge variant="success">Đang mở</Badge>
                        </div>
                        <button
                          onClick={() => checkIn(session.id, 'gps', triggerToast)}
                          disabled={checkedIn}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            checkedIn ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {checkedIn ? 'Đã điểm danh' : 'Điểm danh'}
                        </button>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <p className="text-xs text-slate-400">Hiện không có phiên điểm danh nào đang mở.</p>
                </div>
              )}

              {/* Attendance historical record sheet */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-750 uppercase tracking-wider">Lịch sử điểm danh chi tiết môn</h4>
                {classSessions.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic font-semibold">Chưa có phiên điểm danh nào được ghi nhận cho môn học này.</p>
                ) : (
                  <div className="bg-white border rounded-xl divide-y overflow-hidden shadow-3xs">
                    {classSessions.map((ses) => {
                      const record = attendanceRecords.find(r => r.sessionId === ses.id);
                      return (
                        <div key={ses.id} className="p-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            <div>
                                <span className="font-bold text-slate-700 block">{ses.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Ngày: {ses.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <Badge variant={ses.status === 'open' ? 'success' : 'gray'}>
                                {ses.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                             </Badge>
                             {record && (
                                <Badge variant={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'danger'}>
                                    {record.status === 'present' ? 'Có mặt' : record.status === 'late' ? 'Muộn' : 'Vắng'}
                                </Badge>
                             )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}





        </div>
      )}

      {/* DETAILED MATERIAL PREVIEW MODAL */}
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

      {/* HOMEWORK SOLVER MODAL (For Essays) */}
      {selectedAssignment && (selectedAssignment as any).type !== 'tracnghiem' && (
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

      {/* HIGHLY POLISHED FULL-SCREEN PROFESSIONAL QUIZ WORKSPACE */}
      {activeQuiz && isReviewMode && (
        <ExamReviewView
          assignment={activeQuiz}
          submission={submissions.find(s => s.assignmentId === activeQuiz.id && s.studentId === studentProfile.id)}
          onClose={() => {
            setActiveQuiz(null);
            setIsReviewMode(false);
          }}
        />
      )}

      {activeQuiz && !isReviewMode && (
        <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col font-sans text-slate-800">
          {/* Immersive Top Bar Header */}
          <div className="h-16 bg-slate-950 text-white px-6 flex items-center justify-between border-b border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white leading-tight">
                  {isReviewMode ? 'Xem Lại Kết Quả Trắc Nghiệm' : 'Phòng Thi Trắc Nghiệm Trực Tuyến'}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Học phần: {selectedClass?.subjectName} • {activeQuiz.title}
                </p>
              </div>
            </div>

            {/* Middle: Countdown Timer */}
            {!isReviewMode ? (
              <div className="flex items-center gap-2.5 bg-slate-900/80 px-4 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
                <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Thời gian còn lại:</span>
                <span className="text-sm font-mono font-bold tracking-wider text-amber-300">
                  {Math.floor(quizTimer / 60).toString().padStart(2, '0')}:{(quizTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-emerald-950/80 px-4 py-1.5 rounded-2xl border border-emerald-900 shadow-inner">
                <Award className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">Chế độ xem lại lời giải</span>
              </div>
            )}

            {/* Right Side Control Buttons */}
            <div className="flex items-center gap-2">
              {!isReviewMode && (
                <button
                  type="button"
                  onClick={handleHandSubmitQuiz}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" /> Nộp bài ngay
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isReviewMode) {
                    setActiveQuiz(null);
                    setIsReviewMode(false);
                  } else {
                    if (confirm('Lịch trình làm bài thi đang diễn ra! Bạn có chắc chắn muốn thoát? Kết quả hiện tại sẽ không được lưu.')) {
                      setActiveQuiz(null);
                    }
                  }
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                {isReviewMode ? 'Đóng lại' : 'Thoát phòng thi'}
              </button>
            </div>
          </div>

          {/* Main Workspace Frame */}
          <div className="flex-1 grid grid-cols-12 overflow-hidden h-[calc(100vh-64px)] bg-slate-100">
            {/* LEFT COLUMN: Đề bài (Interactive Zoomable Paper Viewer) */}
            <div className="col-span-12 lg:col-span-7 h-full flex flex-col relative overflow-hidden bg-slate-200 border-r border-slate-350">
              <div className="bg-slate-300/80 px-4 py-2 border-b border-slate-350 flex justify-between items-center z-10 shrink-0">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">ĐỀ THI CHÍNH THỨC (ĐỌC TRỰC TIẾP)</span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">MÃ ĐỀ: HN-688 • FILE TRỰC TUYẾN</span>
              </div>

              {/* Document Scroll Canvas */}
              <div className="flex-1 overflow-auto p-6 md:p-8 flex justify-center items-start">
                <div 
                  className="bg-white shadow-lg border border-slate-300 p-8 md:p-12 rounded-xs max-w-2xl w-full min-h-[850px] transition-transform duration-200 text-slate-800 space-y-6 select-none"
                  style={{ transform: `scale(${quizZoom})`, transformOrigin: 'top center' }}
                >
                  {/* Exam School Header Branding */}
                  <div className="border-b-2 border-double border-slate-900 pb-4 flex justify-between items-start">
                    <div className="text-center font-bold text-[11px] leading-tight text-slate-900 uppercase">
                      HỘI ĐỒNG TUYỂN SINH<br />
                      <span className="tracking-wide">ĐẠI HỌC HƯNG NHÂN</span><br />
                      <span className="text-[9px] font-medium font-serif italic capitalize">---***---</span>
                    </div>
                    <div className="text-center font-bold text-[11px] leading-tight text-slate-900">
                      ĐỀ THI KIỂM TRA ĐỊNH KỲ CHUYÊN NGÀNH<br />
                      HỌC KỲ THỬ NGHIỆM TRÊN HỆ THỐNG<br />
                      <span className="text-[9px] font-medium font-mono text-slate-600">Thời gian làm bài: 10 phút</span>
                    </div>
                  </div>

                  {/* Exam Title Meta Data */}
                  <div className="text-center space-y-1 py-2">
                    <h3 className="font-bold font-serif text-sm uppercase tracking-wide">ĐỀ BÀI KIỂM TRA ĐÁNH GIÁ CHẤT LƯỢNG</h3>
                    <p className="text-[10px] text-slate-600 font-medium italic">Môn học: {selectedClass?.subjectName || 'Công nghệ thông tin'}</p>
                    <p className="text-[9px] font-mono font-bold text-slate-500">Mã đề thi: HN-688 (Đề gồm 05 câu trắc nghiệm khách quan)</p>
                  </div>

                  {/* Document Body Questions */}
                  <div className="space-y-6 text-xs font-serif text-slate-900 leading-relaxed text-justify">
                    {mockQuizQuestions.map((qItem) => (
                      <div key={qItem.id} className="space-y-2">
                        <p className="font-bold text-slate-950">
                          Câu {qItem.id}: {qItem.q}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pl-4 font-normal text-slate-800">
                          <p><span className="font-bold">A.</span> {qItem.choices.a}</p>
                          <p><span className="font-bold">B.</span> {qItem.choices.b}</p>
                          <p><span className="font-bold">C.</span> {qItem.choices.c}</p>
                          <p><span className="font-bold">D.</span> {qItem.choices.d}</p>
                        </div>
                      </div>
                    ))}
                    <div className="text-center font-bold pt-8 text-[11px] text-slate-900 border-t-2 border-dashed border-slate-300 tracking-widest font-mono">
                      --- HẾT ĐỀ BÀI ---
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Center Zoom Control HUD */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-950/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 flex items-center gap-3.5 shadow-xl">
                <button
                  type="button"
                  onClick={() => setQuizZoom(prev => Math.max(0.7, prev - 0.1))}
                  className="h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer border border-slate-700"
                  title="Thu nhỏ đề"
                >
                  <ZoomOut className="h-3.5 w-3.5 text-slate-300 hover:text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => setQuizZoom(1.0)}
                  className="text-[10px] font-mono font-bold tracking-wide hover:text-blue-400 transition-colors px-1 cursor-pointer"
                  title="Khôi phục kích cỡ gốc"
                >
                  {Math.round(quizZoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setQuizZoom(prev => Math.min(1.5, prev + 0.1))}
                  className="h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 active:scale-90 flex items-center justify-center transition-all cursor-pointer border border-slate-700"
                  title="Phóng to đề"
                >
                  <ZoomIn className="h-3.5 w-3.5 text-slate-300 hover:text-white" />
                </button>
                <div className="h-4 w-px bg-slate-850"></div>
                <button
                  type="button"
                  onClick={() => setQuizZoom(1.0)}
                  className="h-7 w-7 rounded-full bg-slate-850 hover:bg-slate-750 flex items-center justify-center transition-all cursor-pointer"
                  title="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Khu vực nộp bài / Trợ lý / Thông tin (3-tab Workspace Layout) */}
            <div className="col-span-12 lg:col-span-5 h-full flex flex-col bg-white overflow-hidden shadow-inner">
              {/* Tab Header Selector */}
              <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 select-none">
                <button
                  type="button"
                  onClick={() => setActiveQuizTab('answers')}
                  className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                    activeQuizTab === 'answers'
                      ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-3xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  1. Đáp án
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuizTab('expand')}
                  className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                    activeQuizTab === 'expand'
                      ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-3xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  2. Mở rộng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuizTab('info')}
                  className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-wider border-b-2 text-center transition-all cursor-pointer ${
                    activeQuizTab === 'info'
                      ? 'border-blue-600 text-blue-600 bg-white font-bold shadow-3xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  3. Thông tin bài tập
                </button>
              </div>

              {/* Tab Content Canvas Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* TAB 1: ĐÁP ÁN (Questions Selection & Grading review) */}
                {activeQuizTab === 'answers' && (
                  <div className="space-y-4">
                    {/* Action Panel Header */}
                    {!isReviewMode ? (
                      <div className="bg-slate-50 p-4 border rounded-xl flex items-center justify-between shadow-3xs gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Bảng nhập câu trả lời</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">Tích chọn đáp án hoặc nạp chuỗi nhanh</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsQuickFillOpen(true)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg transition-colors border border-blue-200 cursor-pointer shadow-3xs inline-flex items-center gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-blue-600 animate-pulse" /> Nạp Đáp Án Nhanh
                        </button>
                      </div>
                    ) : (
                      (() => {
                        const sub = submissions.find(s => s.assignmentId === activeQuiz.id && s.studentId === studentProfile.id);
                        return (
                          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-3xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">KẾT QUẢ BÀI THI CỦA BẠN</span>
                              <Badge variant="success">ĐÃ CHẤM ĐIỂM</Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-mono font-bold text-emerald-700">{sub?.score || 0}</span>
                              <span className="text-xs font-bold text-slate-400">/ 10 điểm</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                              Nhận xét: {sub?.feedback || 'Tự động chấm điểm trắc nghiệm hoàn tất.'}
                            </p>
                          </div>
                        );
                      })()
                    )}

                    {/* Question Row List */}
                    <div className="space-y-4">
                      {mockQuizQuestions.map((qItem) => {
                        const userAns = quizActiveAnswers[qItem.id.toString()];
                        const isCorrect = userAns === qItem.correct;
                        return (
                          <div
                            key={qItem.id}
                            className={`p-4 rounded-xl border transition-all space-y-3.5 ${
                              isReviewMode
                                ? isCorrect
                                  ? 'bg-emerald-50/40 border-emerald-200 shadow-3xs'
                                  : 'bg-rose-50/40 border-rose-200 shadow-3xs'
                                : 'bg-white border-slate-200 shadow-3xs hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                Câu hỏi {qItem.id}
                              </span>
                              {isReviewMode && (
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                  {isCorrect ? (
                                    <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                      <Check className="h-3 w-3" /> Đúng
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                      <X className="h-3 w-3" /> Sai
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Option circles wrapper */}
                            <div className="grid grid-cols-4 gap-2.5">
                              {['a', 'b', 'c', 'd'].map((choiceKey) => {
                                const isSelected = userAns === choiceKey;
                                const isChoiceCorrect = qItem.correct === choiceKey;

                                let btnStyles = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';
                                if (isSelected) {
                                  btnStyles = 'bg-blue-600 border-blue-600 text-white font-bold shadow-3xs';
                                }

                                if (isReviewMode) {
                                  if (isChoiceCorrect) {
                                    btnStyles = 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-3xs';
                                  } else if (isSelected && !isCorrect) {
                                    btnStyles = 'bg-rose-600 border-rose-600 text-white font-bold shadow-3xs';
                                  } else {
                                    btnStyles = 'bg-slate-100/50 border-slate-150 text-slate-400 opacity-60';
                                  }
                                }

                                return (
                                  <button
                                    key={choiceKey}
                                    type="button"
                                    disabled={isReviewMode}
                                    onClick={() => setQuizActiveAnswers(prev => ({ ...prev, [qItem.id.toString()]: choiceKey }))}
                                    className={`py-3.5 px-2 border rounded-xl text-center text-xs font-bold uppercase transition-all duration-150 relative cursor-pointer ${btnStyles}`}
                                  >
                                    {choiceKey}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Detailed explanation for Review Mode */}
                            {isReviewMode && (
                              <div className="p-3 bg-white/80 border rounded-lg text-[10px] leading-relaxed text-slate-600 shadow-3xs space-y-1 mt-1">
                                <div className="flex items-center gap-1 font-bold text-slate-800 uppercase tracking-wide">
                                  <HelpCircle className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                  <span>Đáp án đúng: {qItem.correct.toUpperCase()}</span>
                                </div>
                                <p className="font-medium text-slate-600">{qItem.explain}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Submit Actions (only in work mode) */}
                    {!isReviewMode && (
                      <div className="pt-4 border-t border-slate-150 flex flex-col gap-2.5">
                        <button
                          type="button"
                          onClick={handleHandSubmitQuiz}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-2"
                        >
                          <CheckSquare className="h-4 w-4" /> Nộp Bài & Chấm Điểm Ngay
                        </button>
                        <p className="text-[10px] text-slate-400 font-medium text-center leading-relaxed">
                          Sau khi nộp bài, hệ thống sẽ tự động chấm điểm và đồng bộ vào học bạ học tập của bạn lập tức.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: MỞ RỘNG (Notes scribbling + AI tutor proxy box) */}
                {activeQuizTab === 'expand' && (
                  <div className="space-y-4">
                    {/* Scribble Notes Pad */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Vở Nháp Học Viên
                        </label>
                        <span className="text-[9px] text-slate-400 font-medium italic">Không lưu lại khi thoát phòng thi</span>
                      </div>
                      <textarea
                        value={notesText}
                        onChange={(e) => setNotesText(e.target.value)}
                        rows={5}
                        placeholder="Ghi chú nhanh lý thuyết, tính toán nháp hoặc tóm tắt ý kiến..."
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline bg-white text-slate-850 leading-relaxed shadow-3xs"
                      />
                    </div>

                    {/* AI Buddy Tutor Assistant */}
                    <div className="border border-slate-150 rounded-xl overflow-hidden shadow-3xs flex flex-col bg-slate-50 min-h-[350px]">
                      {/* Box header */}
                      <div className="bg-slate-900 text-white p-3.5 flex items-center gap-2">
                        <Bot className="h-4 w-4 text-blue-400 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold leading-none text-white">AI Study Buddy Hỏi Đáp</h4>
                          <span className="text-[9px] text-slate-400 mt-1 block">Giải đáp kiến thức thắc mắc</span>
                        </div>
                      </div>

                      {/* Chat Logs scroll region */}
                      <div className="flex-1 p-3.5 space-y-3 max-h-[250px] overflow-y-auto">
                        {aiChatLogs.map((log, idx) => {
                          const isAI = log.role === 'ai';
                          return (
                            <div key={idx} className={`flex gap-1.5 max-w-[90%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                              <div className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                                isAI ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-blue-600 text-white'
                              }`}>
                                {isAI ? <Bot className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                              </div>
                              <div className={`p-2.5 rounded-xl text-[10px] leading-relaxed border whitespace-pre-wrap ${
                                isAI ? 'bg-white border-slate-200 text-slate-700 shadow-3xs' : 'bg-blue-600 border-blue-600 text-white'
                              }`}>
                                {log.text}
                              </div>
                            </div>
                          );
                        })}
                        {isAiLoading && (
                          <div className="flex gap-1.5 mr-auto max-w-[90%]">
                            <div className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                              <Bot className="h-2.5 w-2.5" />
                            </div>
                            <div className="p-2.5 bg-white border rounded-xl text-[10px] flex items-center gap-1.5 shadow-3xs text-slate-450">
                              <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                              AI đang giải tích...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input controls box */}
                      <div className="p-2 bg-white border-t border-slate-150 flex gap-2 items-center">
                        <input
                          type="text"
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              sendQuickAiQuestion();
                            }
                          }}
                          placeholder="Hỏi AI lý thuyết (Ví dụ: OOP là gì, GPS...)"
                          disabled={isAiLoading}
                          className="flex-1 px-3 py-2 text-[10px] rounded-lg border border-slate-200 focus:outline bg-slate-50/50 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={sendQuickAiQuestion}
                          disabled={isAiLoading || !aiQuestion.trim()}
                          className="h-7 w-7 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-3xs"
                        >
                          <Send className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: THÔNG TIN BÀI TẬP (Description, due date and rules) */}
                {activeQuizTab === 'info' && (
                  <Card className="p-4 border-slate-150 space-y-4 bg-slate-50/50 shadow-3xs">
                    <div className="space-y-1 border-b pb-2.5">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Quy chế phòng thi kiểm tra</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Vui lòng đọc kỹ trước khi bắt đầu nộp bài làm</p>
                    </div>

                    <div className="text-[10px] text-slate-600 space-y-3 leading-relaxed">
                      <div className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-750">Thang điểm đánh giá tối đa</p>
                          <p className="text-slate-500">Mỗi câu hỏi tương đương 2.0 điểm, tổng điểm tối đa là {activeQuiz.maxPoints} điểm (thang 10).</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-750">Giới hạn thời gian làm bài</p>
                          <p className="text-slate-500">Bài thi có giới hạn là 10 phút. Khi đồng hồ đếm ngược về 00:00, hệ thống sẽ tự động thu bài và tự động chấm điểm.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-750">Quy định trung thực học thuật</p>
                          <p className="text-slate-500">Học viên tuyệt đối không mở tab phụ lục gian lận hoặc copy đề giải bên ngoài. Các hành động thoát màn hình liên tục sẽ bị hệ thống phát hiện ghi nhận.</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t mt-2 space-y-1">
                        <p className="font-bold text-slate-700">Mô tả chi tiết từ Giảng viên:</p>
                        <p className="italic font-medium text-slate-500 bg-white p-3 border rounded-xl leading-relaxed">
                          "{activeQuiz.description}"
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK FILL MODAL FOR TEST EXAM ANSWER KEYS */}
      {isQuickFillOpen && (
        <div className="fixed inset-0 bg-slate-950/80 z-[110] flex items-center justify-center p-4 backdrop-blur-3xs animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" /> Nạp Đáp Án Nhanh Trắc Nghiệm
              </h3>
              <button 
                type="button"
                onClick={() => setIsQuickFillOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-normal">
              <p className="text-slate-500 leading-normal font-semibold">
                Dán chuỗi ký tự đáp án học tập vào ô dưới đây (hỗ trợ định dạng chuỗi dính liền hoặc cách rời):
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl border font-mono text-[9px] text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-600">Định dạng chấp nhận:</p>
                <p>• Cách viết liền: <span className="text-blue-600 font-bold">1B2C3B4B5B</span></p>
                <p>• Cách viết rời: <span className="text-blue-600 font-bold">1:B, 2:C, 3:B, 4:B, 5:B</span></p>
                <p>• Viết xuống dòng: <span className="text-blue-600 font-bold">Câu 1: B \n Câu 2: C</span></p>
              </div>

              <input
                type="text"
                value={quickFillValue}
                onChange={(e) => setQuickFillValue(e.target.value)}
                placeholder="Ví dụ: 1B2C3B4B5B"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white text-slate-850 focus:outline tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleQuickFillSubmit}
                disabled={!quickFillValue.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-3xs"
              >
                Xác nhận nạp
              </button>
              <button
                type="button"
                onClick={() => setIsQuickFillOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
