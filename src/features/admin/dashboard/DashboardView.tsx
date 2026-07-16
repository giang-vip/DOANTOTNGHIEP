import React from 'react';
import { useDashboardViewModel } from './useDashboardViewModel';
import { Card, Badge, DateRangePicker } from '../../../components/UI';
import { Users, BookOpen, GraduationCap, Percent, Calendar, MessageSquare } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export function DashboardView() {
  const {
    stats,
    registrationPeriod,
    updateRegistration,
    toggleRegistration,
    teacherChartData,
    attendanceChartData,
    recentNotifications
  } = useDashboardViewModel();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Thống Kê Tổng Quan</h2>
        <p className="text-xs text-slate-500">Giám sát các chỉ số hoạt động chính của hệ thống giáo dục Hưng Nhân</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-600">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tổng Sinh Viên</span>
            <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.totalStudents}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-600">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tổng Giảng Viên</span>
            <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.totalTeachers}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-indigo-600">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Lớp Học Phần</span>
            <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.totalClasses}</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Điểm Danh TB</span>
            <p className="text-2xl font-bold text-slate-800 leading-none mt-1">{stats.attendanceRate}%</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Tỷ lệ chuyên cần theo lớp học phần (%)</h3>
            <div className="h-64 w-full">
              {attendanceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceChartData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu điểm danh</div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Phân bổ giảng viên theo Khoa</h3>
              <div className="h-48 w-full flex items-center justify-center">
                {teacherChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teacherChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {teacherChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-slate-400 text-sm">Chưa có dữ liệu</div>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
                {teacherChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-[11px] text-slate-600 font-medium">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Thông báo mới gửi</h3>
                <span className="text-slate-400"><MessageSquare className="h-4 w-4" /></span>
              </div>
              <div className="space-y-3">
                {recentNotifications.length > 0 ? (
                  recentNotifications.map((notif, idx) => (
                    <div key={idx} className="border-b border-slate-50 last:border-none pb-2 last:pb-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <Badge variant={notif.recipientGroup === 'all' ? 'info' : 'gray'}>
                          {notif.recipientGroup === 'all' ? 'Toàn trường' : notif.recipientGroup === 'teachers' ? 'Giảng viên' : 'Sinh viên'}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-semibold text-slate-700 truncate">{notif.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{notif.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-center py-8 text-xs font-medium">Chưa có thông báo nào</div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right: System Actions (Registration Window) */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Đăng Ký Học Phần</h3>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Trạng thái cổng đăng ký</span>
                <Badge variant={registrationPeriod.isOpen ? 'success' : 'danger'}>
                  {registrationPeriod.isOpen ? 'Đang mở' : 'Đang đóng'}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Khi mở, sinh viên được phép đăng ký/hủy học phần trực tuyến trong khoảng thời gian đã định.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Thời hạn cổng mở (Từ ngày - Đến ngày)
                </label>
                <DateRangePicker
                  startDate={registrationPeriod.startDate}
                  endDate={registrationPeriod.endDate}
                  onRangeChange={(start, end) => updateRegistration(start, end, registrationPeriod.isOpen)}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={toggleRegistration}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors text-white ${
                    registrationPeriod.isOpen
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {registrationPeriod.isOpen ? 'Đóng đăng ký ngay' : 'Kích hoạt mở cổng'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
