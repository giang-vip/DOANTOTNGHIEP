
export interface AttendanceSession {
  id: string | number;
  classId: string | number;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "Buổi 1"
  status: 'open' | 'closed';
  createdAt?: string;
  sessionDate?: string;
  sessionTitle?: string;
  sessionStatus?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: string | number;
  sessionId?: string | number;
  attendanceSessionId?: string | number;
  classId: string | number;
  studentId: string | number;
  studentName?: string;
  status: AttendanceStatus;
  noted?: string;
  updatedAt?: string;
  method?: 'manual' | 'gps' | 'face';
  faceMatchConfidence?: number;
  faceMatchStatus?: 'not_applicable' | 'pending' | 'matched' | 'not_matched';
}

export interface LearningMaterial {
  id: string | number;
  classId: string | number;
  title: string;
  type: 'pdf' | 'doc' | 'ppt' | 'video' | 'image' | string;
  url?: string;
  fileUrl?: string;
  fileName: string;
  fileSize?: string;
  uploadedAt?: string;
  description?: string;
}

export interface Assignment {
  id: string | number;
  classId: string | number;
  title: string;
  description: string;
  dueDate: string; 
  maxPoints?: number; 
  createdAt?: string;
  type?: 'essay' | 'quiz' | string;
  examFileUrl?: string;
  examFileName?: string;
  examFileType?: 'pdf' | 'image';
  questionCount?: number;
  submissionId?: number | string;
  submittedAt?: string;
  submissionScore?: number;
  submissionStatus?: string;
}

export interface QuizQuestion {
  id: string | number;
  assignmentId: string | number;
  order?: number;
  correctChoice?: 'A' | 'B' | 'C' | 'D' | string;
  points?: number;
  explanationText?: string;
  questionText?: string;
  choiceAText?: string;
  choiceBText?: string;
  choiceCText?: string;
  choiceDText?: string;
  ocrStatus?: 'not_processed' | 'pending' | 'done' | 'failed';
  ocrExtractedText?: string;
}

export interface QuizAnswer {
  id: string | number;
  submissionId: string | number;
  questionId: string | number;
  selectedChoice: 'A' | 'B' | 'C' | 'D' | string | null;
  isCorrect?: boolean;
}

export interface Submission {
  id: string | number;
  assignmentId: string | number;
  classId?: string | number;
  studentId: string | number;
  studentName?: string;
  content: string; 
  fileUrl?: string;
  fileName?: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'PENDING' | 'GRADED' | string;
}

export interface SystemNotification {
  id: string | number;
  title: string;
  content: string;
  recipientGroup: 'all' | 'teachers' | 'students' | 'class' | string;
  classId?: string | number; 
  sender?: string; 
  createdAt?: string;
}
