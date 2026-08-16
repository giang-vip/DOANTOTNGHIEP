export interface ChartData {
  [key: string]: any;
}

export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  lowGpaStudentsCount: number;
  averageCreditCompletionRate: number;
  teacherChartData: ChartData[];
  studentChartData: ChartData[];
  gradeDistributionData: ChartData[];
}
