import React from 'react';
import { useDashboardViewModel } from './useDashboardViewModel';
import { Card, Badge } from '../../../components/UI';
import { Student } from '../../../models';
import { Award, BookOpen, Clock, Bell, Calendar, Sparkles } from 'lucide-react';

interface DashboardViewProps {
  studentProfile: Student;
}

export function DashboardView({ studentProfile }: DashboardViewProps) {
  const {
    gpa,
    accumulatedCredits,
    enrolledClassesCount,
    pendingAsmsCount,
    announcements,
    currentSemesterName,
    currentYearName
  } = useDashboardViewModel(studentProfile);

  return (
    <div className="space-y-6">
      {/* Top Banner (Greeting Card) */}
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-900/10 border-none text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-3 relative z-10 w-full">
          <span className="text-[10px] font-bold tracking-widest text-blue-200 uppercase inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-spin" /> Hệ thống quản lý học tập Hưng Nhân
          </span>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
            <div>
              <h2 className="text-2xl font-black leading-tight mb-1">✨ Chào mừng trở lại, {studentProfile.fullName || studentProfile.name}!</h2>
              <p className="text-sm text-blue-100 font-medium">📅 Hệ thống đang hoạt động ở: {currentSemesterName} | Năm học: {currentYearName}</p>
            </div>
            
            {/* Student Info Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex flex-col gap-1.5 min-w-[200px]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Mã SV</span>
                <span className="font-mono text-sm font-bold text-white bg-black/20 px-1.5 py-0.5 rounded">{studentProfile.studentCode}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Chuyên ngành</span>
                <span className="text-xs font-bold text-white text-right truncate max-w-[150px]">{studentProfile.majorName || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-600 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Điểm Trung Bình (GPA)</span>
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">{gpa.toFixed(2)} <span className="text-sm font-bold text-slate-400">/ 4.0</span></span>
            <span className="text-[10px] text-slate-400 mt-1 block">Xếp loại: <strong className="text-slate-600">{gpa >= 3.6 ? 'Xuất sắc' : gpa >= 3.2 ? 'Giỏi' : gpa >= 2.5 ? 'Khá' : gpa >= 2.0 ? 'Trung bình' : 'Yếu'}</strong></span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-600 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tín Chỉ Học Phần</span>
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">
              {accumulatedCredits} <span className="text-sm font-medium text-slate-400">/ <span className="text-base font-bold text-slate-400">{studentProfile.majorTotalCredits || '140'}</span> tín chỉ</span>
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (accumulatedCredits / (studentProfile.majorTotalCredits || 140)) * 100)}%` }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-rose-600 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bài Tập Chờ Nộp</span>
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">{pendingAsmsCount} nhiệm vụ</span>
            {pendingAsmsCount > 0 ? (
              <Badge variant="danger" className="text-[9px] mt-1 text-center font-bold">Cần hoàn thành gấp</Badge>
            ) : (
              <Badge variant="success" className="text-[9px] mt-1 text-center font-bold">Đã hoàn thành hết</Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Main Announcements / Mail flow feed */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="h-4 w-4 text-blue-600" /> Bảng tin thông cáo & Email toàn trường
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Cập nhật chỉ thị học tập từ phòng Đào Tạo và thông cáo chuyên sâu từ các lớp học phần đăng ký</p>
        </div>

        <div className="space-y-3.5">
          {announcements.length === 0 ? (
            <Card className="p-12 text-center text-slate-400 text-xs font-medium">
              Hiện tại không có thông cáo hoặc email mới nào gửi tới bạn.
            </Card>
          ) : (
            announcements.map((notif) => (
              <Card key={notif.id} className="p-4.5 border border-slate-200 hover:border-slate-350 transition-all space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-850 leading-snug">{notif.title}</h4>
                      <span className="text-[9px] text-slate-400 block mt-1 font-medium">
                        Phát từ <strong className="text-slate-600">{notif.createdByUsername || 'Hệ thống'}</strong> • {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString('vi-VN') : ''} {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>

                  <Badge variant={notif.classSectionId ? 'gray' : 'info'} className="text-[9px] shrink-0 leading-none">
                    {notif.classSectionId ? 'Tin lớp học' : 'Tin chung'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50/40 rounded-lg p-3 whitespace-pre-line border border-slate-100/50 leading-relaxed">
                  {notif.content}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
