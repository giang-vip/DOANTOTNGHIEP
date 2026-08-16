export interface ClassSection {
  id?: number;
  departmentId?: number;
  departmentName?: string;
  majorId?: number;
  majorName?: string;
  subjectId: number;
  subjectName?: string;
  teacherId: number;
  teacherName?: string;
  semesterId: number;
  semesterCode?: string;
  sectionCode: string;
  room?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status?: string;
  enrolledCount?: number;
}

export interface ClassSectionRequest {
  departmentId?: number;
  majorId?: number;
  subjectId: number;
  teacherId: number;
  semesterId: number;
  sectionCode: string;
  room?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status?: string;
}
