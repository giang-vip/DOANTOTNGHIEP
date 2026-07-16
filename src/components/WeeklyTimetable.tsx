import React from 'react';
import { Card, Badge } from './UI';
import { ClassSection } from '../types';
import { Clock, MapPin, User } from 'lucide-react';

interface WeeklyTimetableProps {
  enrolledClasses: ClassSection[];
  currentDate?: Date;
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

// Convert period to correct clock hours
export const getPeriodTime = (period: number, isEnd: boolean) => {
  const startTimes: Record<number, string> = {
    1: '07:00',
    2: '07:50',
    3: '08:45',
    4: '09:35',
    5: '10:30',
    6: '11:20',
    7: '13:00',
    8: '13:50',
    9: '14:45',
    10: '15:35',
    11: '16:30',
    12: '17:20'
  };
  const endTimes: Record<number, string> = {
    1: '07:45',
    2: '08:35',
    3: '09:30',
    4: '10:20',
    5: '11:15',
    6: '12:05',
    7: '13:45',
    8: '14:35',
    9: '15:30',
    10: '16:20',
    11: '17:15',
    12: '18:05'
  };
  return isEnd ? (endTimes[period] || '12:05') : (startTimes[period] || '07:00');
};

export const getTimeLabel = (start: number, end: number) => {
  return `${getPeriodTime(start, false)} - ${getPeriodTime(end, true)}`;
};

export function WeeklyTimetable({ enrolledClasses, currentDate = new Date() }: WeeklyTimetableProps) {
  const { monday, sunday } = getWeekRange(currentDate);

  const daysOfWeek = [
    { num: 2, label: 'Thứ Hai' },
    { num: 3, label: 'Thứ Ba' },
    { num: 4, label: 'Thứ Tư' },
    { num: 5, label: 'Thứ Năm' },
    { num: 6, label: 'Thứ Sáu' },
    { num: 7, label: 'Thứ Bảy' }
  ];

  // Format dates for comparing
  const monStr = monday.toISOString().split('T')[0];
  const sunStr = sunday.toISOString().split('T')[0];

  // Helper to check if a class falls in the active week
  const isClassActiveInWeek = (cls: ClassSection) => {
    if (!cls.startDate || !cls.endDate) return true;
    return cls.startDate <= sunStr && cls.endDate >= monStr;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {daysOfWeek.map((day) => {
        // Filter classes for this day and active in this week
        const dayClasses = enrolledClasses.filter(c => c.dayOfWeek === day.num && isClassActiveInWeek(c));
        const hasClasses = dayClasses.length > 0;

        return (
          <div key={day.num} className="space-y-3">
            {/* Day Header Badge */}
            <div className={`p-2.5 text-center rounded-xl font-bold text-xs border ${
              hasClasses
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 text-slate-450 border-slate-150'
            }`}>
              {day.label}
            </div>

            {/* Day classes lane */}
            <div className="space-y-3 min-h-[160px] md:min-h-[220px]">
              {hasClasses ? (
                dayClasses.map((cls) => (
                  <Card key={cls.id} className="p-3.5 border border-slate-150 hover:border-blue-300 transition-all flex flex-col justify-between h-48 gap-2 text-left bg-white relative group">
                    <span className="absolute top-2 right-2 text-[9px] font-bold text-blue-600/80 font-mono bg-blue-50 px-1 py-0.5 rounded leading-none">
                      {cls.credits} TC
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Badge variant="success" className="text-[9px]">Lớp đang mở</Badge>
                      </div>
                      <h4 className="text-[11px] font-bold text-slate-850 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mt-1">
                        {cls.subjectName}
                      </h4>
                      <span className="text-[9px] font-mono text-slate-400 block font-semibold">{cls.id}</span>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 leading-none">
                        <Clock className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                        <span className="font-bold text-slate-800">{getTimeLabel(cls.periodStart, cls.periodEnd)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 leading-none">
                        <MapPin className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                        <span className="font-bold text-slate-700 truncate font-mono">P.{cls.room}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-600 leading-none">
                        <User className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                        <span className="truncate">{cls.teacherName}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="h-44 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-center p-4 text-[10px] text-slate-400 bg-slate-50/10 font-medium select-none">
                  Không có lịch học
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
