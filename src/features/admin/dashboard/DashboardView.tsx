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
  PieChart,
  Pie,
  Cell,
  LabelList
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
    },
    {
      title: 'Tỷ Lệ Tín Chỉ (Hoàn thành)',
      value: `${stats.averageCreditCompletionRate ? stats.averageCreditCompletionRate.toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'purple'
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Thống Kê Tổng Quan</h2>
        <p className="text-xs text-slate-500">Dữ liệu thời gian thực của hệ thống</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
        {/* Chart 2: Teacher Distribution */}
        <Card className="p-5 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phân bố Giảng viên</h3>
              <p className="text-xs text-slate-500">Số lượng giảng viên theo khoa</p>
            </div>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-64 w-full mt-auto flex items-center">
            <div className="w-[45%] h-full relative -left-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.teacherChartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats.teacherChartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} giảng viên`, `Tên Khoa: ${props.payload.name}`]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[55%] h-full overflow-y-auto pl-2 py-2 flex flex-col justify-center">
              <ul className="space-y-3 text-xs">
                {(stats.teacherChartData || []).map((entry, index) => {
                  const percentage = stats.totalTeachers > 0 ? ((entry.value / stats.totalTeachers) * 100).toFixed(1) : 0;
                  return (
                    <li key={`item-${index}`} className="flex items-center text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full mr-2.5 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="truncate flex-1 font-medium" title={entry.name}>{entry.shortName || entry.name}</span>
                      <span className="font-bold text-slate-800 ml-2 whitespace-nowrap">
                        {entry.value} <span className="font-normal text-slate-400">({percentage}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Card>

        {/* Chart 3: Student Distribution */}
        <Card className="p-5 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phân bố Sinh viên</h3>
              <p className="text-xs text-slate-500">Số lượng sinh viên theo khoa</p>
            </div>
            <GraduationCap className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-64 w-full mt-auto flex items-center">
            <div className="w-[45%] h-full relative -left-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.studentChartData || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats.studentChartData || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [`${value} sinh viên`, `Tên Khoa: ${props.payload.name}`]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[55%] h-full overflow-y-auto pl-2 py-2 flex flex-col justify-center">
              <ul className="space-y-3 text-xs">
                {(stats.studentChartData || []).map((entry, index) => {
                  const percentage = stats.totalStudents > 0 ? ((entry.value / stats.totalStudents) * 100).toFixed(1) : 0;
                  return (
                    <li key={`item-${index}`} className="flex items-center text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full mr-2.5 shrink-0" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }} />
                      <span className="truncate flex-1 font-medium" title={entry.name}>{entry.shortName || entry.name}</span>
                      <span className="font-bold text-slate-800 ml-2 whitespace-nowrap">
                        {entry.value} <span className="font-normal text-slate-400">({percentage}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Card>

        {/* Chart 1: Grade Distribution (Full Width) */}
        <Card className="p-5 flex flex-col lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phổ điểm / Kết quả học tập</h3>
              <p className="text-xs text-slate-500">Phân loại GPA sinh viên toàn trường</p>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="h-72 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.gradeDistributionData || []} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  formatter={(value, name, props) => [`${value} Sinh viên`, `Mức điểm: ${props.payload.name}`]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar 
                  dataKey="value" 
                  name="Số lượng SV"
                  radius={[4, 4, 0, 0]}
                  barSize={50}
                >
                  {(stats.gradeDistributionData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="value" position="top" fill="#64748b" fontSize={13} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
