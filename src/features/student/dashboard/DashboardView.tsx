import React from 'react';
import { useDashboardViewModel } from './useDashboardViewModel';
import { Card, Badge } from '../../../components/UI';
import { Student } from '../../../types';
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
    announcements
  } = useDashboardViewModel(studentProfile);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-blue-700 via-indigo-750 to-slate-900 border-none text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-bold tracking-widest text-blue-200 uppercase inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 animate-spin" /> Học viên thông minh Hưng Nhân
          </span>
          <h2 className="text-xl font-bold leading-tight">Chào mừng trở lại, {studentProfile.name}!</h2>
          <p className="text-xs text-slate-300">Hôm nay là một ngày tuyệt vời để tiếp thu thêm kiến thức và tích lũy kỹ năng mới.</p>
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
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">{gpa.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 mt-1 block">Xếp loại: <strong className="text-slate-600">{gpa >= 3.6 ? 'Xuất sắc' : gpa >= 3.2 ? 'Giỏi' : gpa >= 2.5 ? 'Khá' : 'Trung bình'}</strong></span>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-600 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tín Chỉ Học Phần</span>
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">{accumulatedCredits} tín chỉ</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (accumulatedCredits / 120) * 100)}%` }}></div>
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
                        Phát từ <strong className="text-slate-600">{notif.sender}</strong> • {new Date(notif.createdAt).toLocaleDateString('vi-VN')} {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <Badge variant={notif.recipientGroup === 'all' ? 'info' : 'gray'} className="text-[9px] shrink-0 leading-none">
                    {notif.recipientGroup === 'all' ? 'Tin chung' : 'Tin lớp học'}
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
