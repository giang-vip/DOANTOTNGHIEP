import React from 'react';
import { Card } from '../../../components/UI';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useDashboardViewModel } from './useDashboardViewModel';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export function DashboardView() {
  const { stats, isLoading, error } = useDashboardViewModel();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-rose-700">Lỗi tải dữ liệu</p>
          <p className="mt-1 text-rose-600">{error || 'Không có dữ liệu'}</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Tổng Sinh Viên',
      value: stats.totalStudents,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Tổng Giảng Viên',
      value: stats.totalTeachers,
      icon: GraduationCap,
      color: 'emerald'
    },
    {
      title: 'Lớp Học Đang Mở',
      value: stats.totalClasses,
      icon: BookOpen,
      color: 'indigo'
    },
    {
      title: 'Tỷ Lệ Điểm Danh',
      value: `${stats.attendanceRate}%`,
      icon: Calendar,
      color: 'amber'
    },
    {
      title: 'Sinh Viên Cảnh Báo (GPA < 1.0)',
      value: stats.lowGpaStudentsCount,
      icon: AlertTriangle,
      color: 'rose'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Thống Kê Tổng Quan</h2>
        <p className="text-xs text-slate-500">Dữ liệu thời gian thực của hệ thống</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-${kpi.color}-50 shrink-0`}>
                <Icon className={`h-6 w-6 text-${kpi.color}-600`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold text-slate-900 leading-none">
                  {kpi.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <Card className="p-5 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tỷ lệ đi học theo tháng</h3>
              <p className="text-xs text-slate-500">Thống kê điểm danh toàn trường</p>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.attendanceChartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name="Tỷ lệ (%)"
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2 */}
        <Card className="p-5 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phân bố Giảng viên</h3>
              <p className="text-xs text-slate-500">Số lượng giảng viên theo khoa</p>
            </div>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-64 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.teacherChartData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="department" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar 
                  dataKey="count" 
                  name="Số lượng"
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
