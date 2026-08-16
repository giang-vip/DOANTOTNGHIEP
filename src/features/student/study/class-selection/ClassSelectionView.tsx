import React, { useState } from 'react';
import { useClassSelectionViewModel } from './useClassSelectionViewModel';
import { Student, ClassSection } from '../../../../models';
import { getClassStatus } from '../../schedule/useScheduleViewModel';

export interface ClassSelectionViewProps {
  studentProfile: Student;
  onSelectClass: (cls: ClassSection) => void;
}

export function ClassSelectionView({ studentProfile, onSelectClass }: ClassSelectionViewProps) {
  const { enrolledClasses, classPendingMap, loading } = useClassSelectionViewModel(studentProfile);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Đang tải danh sách lớp học...</div>;
  }

  // Lấy học kỳ mới nhất (có ID lớn nhất) làm "Học kỳ hiện tại"
  const currentActiveSemesterId = enrolledClasses.length > 0 
    ? Math.max(...enrolledClasses.map((cls: any) => cls.semesterId || 0)) 
    : 0;

  const filteredClasses = enrolledClasses.filter((cls: any) => {
    if (activeTab === 'ongoing') {
      return (cls.semesterId || 0) >= currentActiveSemesterId; // "Đang học"
    } else {
      return (cls.semesterId || 0) < currentActiveSemesterId; // "Đã kết thúc"
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Vui lòng chọn lớp học phần</h2>
        <p className="text-xs text-slate-500 mt-1">Chọn một môn học bên dưới để truy cập vào không gian học tập trực tuyến (tài liệu, bài tập, điểm danh).</p>
      </div>

      <div className="flex gap-4 border-b">
        <button 
          onClick={() => setActiveTab('ongoing')}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ongoing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Lớp đang học
        </button>
        <button 
          onClick={() => setActiveTab('ended')}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'ended' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Lớp đã kết thúc
        </button>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-500 bg-slate-50 border border-dashed rounded-xl font-medium">
          Không có lớp học phần nào trong mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              onClick={() => onSelectClass(cls)}
              className="group relative bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 cursor-pointer shadow-3xs hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]"
            >
              {/* Red dot indicator if pending assignments */}
              {classPendingMap[String(cls.id)] && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4" title="Có bài tập chưa nộp">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
                </span>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                    {cls.subjectName}
                  </h3>
                </div>
                <div className="inline-block text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {cls.id}
                </div>
              </div>

              <div className="space-y-1 border-t pt-3 border-slate-200 text-[10px] text-slate-400">
                <p>Giảng viên: {cls.teacherName}</p>
                <p>Phòng học: P.{cls.room}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Vào không gian học <span className="text-xs">→</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">
                  {(cls as any).credits || 3} TC
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
