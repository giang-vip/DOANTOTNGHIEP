import React, { useState } from 'react';
import { Card } from '../../../components/UI';
import { Student } from '../../../types';
import { useStore } from '../../../models/store';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyTimetable } from '../../../components/WeeklyTimetable';

interface ScheduleViewProps {
  studentProfile: Student;
}

// Function to calculate the Monday and Sunday dates of the week containing date d
function getWeekRange(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

export function ScheduleView({ studentProfile }: ScheduleViewProps) {
  const { classes } = useStore();

  // Enrolled classes for this student
  const enrolledClasses = classes.filter(c => c.studentIds.includes(studentProfile.id));

  // Current date state for week shifting
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const { monday, sunday } = getWeekRange(currentDate);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 7);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thời Khóa Biểu Học Tập</h2>
          <p className="text-xs text-slate-500">Xem phân bổ lịch trình lên lớp chi tiết theo tuần của bạn</p>
        </div>

        {/* Week navigation controllers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevWeek}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-3xs cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Tuần trước
          </button>
          
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
          >
            Hôm nay
          </button>

          <button
            onClick={handleNextWeek}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-3xs cursor-pointer transition-colors"
          >
            Tuần sau <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Week indicator box */}
      <Card className="p-4 bg-slate-50 border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4.5 w-4.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Tuần học từ {monday.toLocaleDateString('vi-VN')} đến {sunday.toLocaleDateString('vi-VN')}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Dữ liệu tự động cập nhật theo thời hạn ghi danh lớp học phần
        </div>
      </Card>

      {/* Shared WeeklyTimetable Grid calendar view */}
      <WeeklyTimetable enrolledClasses={enrolledClasses} currentDate={currentDate} />
    </div>
  );
}
