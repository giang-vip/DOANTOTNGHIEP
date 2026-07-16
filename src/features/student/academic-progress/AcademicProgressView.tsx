import React, { useState } from 'react';
import { useAcademicProgressViewModel, SubjectGradeInfo } from './useAcademicProgressViewModel';
import { Card, Badge } from '../../../components/UI';
import { Student } from '../../../types';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Info,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

interface AcademicProgressViewProps {
  studentProfile: Student;
}

export function AcademicProgressView({ studentProfile }: AcademicProgressViewProps) {
  const {
    filteredClassGrades,
    semestersList,
    selectedSemester,
    setSelectedSemester,
    stats,
    semesterChartData
  } = useAcademicProgressViewModel(studentProfile);

  const [activeDetailClass, setActiveDetailClass] = useState<SubjectGradeInfo | null>(null);

  return (
    <div className="space-y-6">
      {/* 1. Header Overview & General Metrics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600 animate-pulse" />
            Theo dõi tiến trình & Kết quả học tập
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Xem chi tiết điểm số, chuyên cần và biểu đồ học tập trực tiếp từ hệ thống Đào tạo
          </p>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500">Lọc Học kỳ:</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 shadow-3xs cursor-pointer"
          >
            {semestersList.map(sem => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top Cumulative Stats Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cumulative GPA */}
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-blue-600 shadow-sm relative overflow-hidden group">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Award className="h-5.5 w-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GPA Tích Lũy</span>
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">
              {stats.cumulativeGpa.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ 4.00</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block font-medium">
              Tính trên các môn học đã hoàn thành điểm
            </span>
          </div>
          <div className="absolute right-2 bottom-1 text-slate-50/50 group-hover:text-slate-100/40 transition-colors duration-300">
            <GraduationCap className="h-24 w-24 stroke-[0.5]" />
          </div>
        </Card>

        {/* Total Accumulated Credits */}
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-emerald-600 shadow-sm relative overflow-hidden group">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tín Chỉ Tích Lũy</span>
            <span className="text-2xl font-black text-slate-800 leading-none block mt-1">
              {stats.totalCredits} <span className="text-xs font-normal text-slate-400">tín chỉ</span>
            </span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-550" 
                style={{ width: `${Math.min(100, (stats.totalCredits / 120) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="absolute right-2 bottom-1 text-slate-50/50 group-hover:text-slate-100/40 transition-colors duration-300">
            <Layers className="h-24 w-24 stroke-[0.5]" />
          </div>
        </Card>

        {/* Academic Classification */}
        <Card className="p-5 flex items-center gap-4 border-l-4 border-l-amber-500 shadow-sm relative overflow-hidden group">
          <div className="h-11 w-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="h-5.5 w-5.5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Xếp loại học lực</span>
            <span className="text-xl font-extrabold text-slate-800 leading-none block mt-1.5">
              {stats.classification}
            </span>
            <div className="mt-2">
              <Badge variant={stats.classificationVariant}>
                Đang nỗ lực học tập
              </Badge>
            </div>
          </div>
          <div className="absolute right-2 bottom-1 text-slate-50/50 group-hover:text-slate-100/40 transition-colors duration-300">
            <Award className="h-24 w-24 stroke-[0.5]" />
          </div>
        </Card>
      </div>

      {/* 3. GPA Chart and Progress Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* GPA Trend Bar Chart */}
        <Card className="p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-blue-600" /> Biểu đồ tiến trình điểm GPA theo Học kỳ
              </h3>
              <p className="text-[10px] text-slate-400">Trực quan hóa xu hướng điểm trung bình tích lũy hệ số 4</p>
            </div>
          </div>

          <div className="h-44 w-full">
            {semesterChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs italic font-medium">
                Chưa có dữ liệu học kỳ hoàn thành để tạo biểu đồ
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 4.0]} 
                    ticks={[0, 1.0, 2.0, 3.0, 4.0]}
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', padding: '8px' }}
                    labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#60a5fa', fontSize: '11px' }}
                    formatter={(value) => [`${value} / 4.0`, 'GPA']}
                  />
                  <Bar dataKey="gpa" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {semesterChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.gpa >= 3.2 ? '#10b981' : entry.gpa >= 2.5 ? '#3b82f6' : '#f59e0b'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Quick Academic Summary Info Card */}
        <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600" /> Tóm tắt trạng thái hoàn thành
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200/50">
                <span className="font-medium">Tổng số môn đăng ký:</span>
                <span className="font-bold text-slate-800">{stats.totalCount} môn</span>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200/50">
                <span className="font-medium">Đã có điểm tổng kết:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {stats.completedCount} / {stats.totalCount} môn
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200/50">
                <span className="font-medium">Đang trong tiến trình học:</span>
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
                  {stats.totalCount - stats.completedCount} môn
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-[10px] text-slate-400 font-medium">
            * Dữ liệu điểm được kết nối trực tiếp với công tác chấm điểm của giảng viên. Mọi thay đổi điểm số sẽ tự động đồng bộ hóa ngay lập tức.
          </div>
        </Card>
      </div>

      {/* 4. Detailed Score Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bảng điểm chi tiết môn học</h3>
            <p className="text-[10px] text-slate-400">Danh sách các học phần có mặt trong học bạ sinh viên</p>
          </div>
          <Badge variant="info">
            Học kỳ hiện tại: {selectedSemester}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-5 py-3 text-center">Mã MH</th>
                <th className="px-5 py-3">Tên Môn học / Lớp HP</th>
                <th className="px-5 py-3 text-center">Tín chỉ</th>
                <th className="px-5 py-3 text-center">Học kỳ</th>
                <th className="px-5 py-3 text-center">Điểm chuyên cần</th>
                <th className="px-5 py-3">Điểm thành phần chi tiết</th>
                <th className="px-5 py-3 text-center">Tổng kết (10)</th>
                <th className="px-5 py-3 text-center">Điểm chữ</th>
                <th className="px-5 py-3 text-center">Hệ số 4</th>
                <th className="px-5 py-3 text-center">Tùy chọn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredClassGrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic font-semibold">
                    Không tìm thấy học phần nào khớp với bộ lọc học kỳ đã chọn.
                  </td>
                </tr>
              ) : (
                filteredClassGrades.map((g, idx) => {
                  const isCompleted = g.final10 !== undefined;
                  
                  return (
                    <tr 
                      key={g.classId} 
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => setActiveDetailClass(g)}
                    >
                      {/* Subject ID */}
                      <td className="px-5 py-4 text-center font-mono font-bold text-slate-400 text-[11px]">
                        {g.subjectId}
                      </td>

                      {/* Name & Class Info */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800 text-xs">
                          {g.subjectName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Lớp: <strong className="text-slate-500 font-bold">{g.classId}</strong> • GV: {g.teacherName}
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="px-5 py-4 text-center font-bold text-slate-600">
                        {g.credits}
                      </td>

                      {/* Semester */}
                      <td className="px-5 py-4 text-center text-[11px] text-slate-500 font-medium whitespace-nowrap">
                        {g.semester.replace('Học kỳ ', 'HK ')}
                      </td>

                      {/* Attendance percent */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-mono font-bold ${g.attendancePercent >= 80 ? 'text-emerald-600' : g.attendancePercent >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>
                            {g.attendancePercent}%
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            ({g.attendanceCount.present}/{g.attendanceCount.total} buổi)
                          </span>
                        </div>
                      </td>

                      {/* Assessments Dynamic Display */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex flex-wrap gap-1.5">
                          {g.assessments.map((ast, i) => (
                            <div 
                              key={i} 
                              className="inline-flex items-center bg-slate-50 border border-slate-200/80 rounded px-1.5 py-0.5 text-[9px] font-medium"
                            >
                              <span className="text-slate-500 mr-1 font-semibold">{ast.name}:</span>
                              <span className={ast.score !== '' ? "text-slate-800 font-bold font-mono" : "text-slate-300 italic"}>
                                {ast.score !== '' ? ast.score.toFixed(1) : 'Chưa nhập'}
                              </span>
                              <span className="text-[8px] text-slate-400 ml-0.5 font-normal">
                                ({Math.round(ast.weight * 100)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Final 10 Grade */}
                      <td className="px-5 py-4 text-center">
                        {isCompleted ? (
                          <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-2 py-1">
                            {g.final10?.toFixed(1)}
                          </span>
                        ) : (
                          <Badge variant="warning" className="text-[9px] font-bold">
                            Chưa có
                          </Badge>
                        )}
                      </td>

                      {/* Letter Grade */}
                      <td className="px-5 py-4 text-center">
                        {isCompleted ? (
                          <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                            g.letterGrade === 'A' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : ['B+', 'B'].includes(g.letterGrade)
                                ? 'bg-blue-100 text-blue-800'
                                : ['C+', 'C', 'D+', 'D'].includes(g.letterGrade)
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                          }`}>
                            {g.letterGrade}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* System 4 Grade */}
                      <td className="px-5 py-4 text-center font-bold font-mono text-slate-700">
                        {isCompleted ? g.gpa4?.toFixed(1) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Details option link */}
                      <td className="px-5 py-4 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDetailClass(g);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors group-hover:translate-x-1 duration-200"
                        >
                          <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. Detailed Drawer/Modal Overlay */}
      {activeDetailClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setActiveDetailClass(null)} 
          />
          
          <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Thông tin chi tiết môn học</h3>
                <span className="text-sm font-extrabold mt-1 block leading-none">{activeDetailClass.subjectName}</span>
              </div>
              <button 
                onClick={() => setActiveDetailClass(null)} 
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-semibold block">Mã học phần</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 block">{activeDetailClass.subjectId}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-semibold block">Mã lớp LHP</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 block">{activeDetailClass.classId}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-semibold block">Số tín chỉ</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{activeDetailClass.credits} tín chỉ</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-semibold block">Học kỳ</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{activeDetailClass.semester}</span>
                </div>
              </div>

              {/* Attendance breakdown */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Thống kê điểm danh</h4>
                <div className="border rounded-lg p-4 bg-emerald-50/20 border-emerald-100 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <span>Tỷ lệ chuyên cần:</span>
                      <span className="text-emerald-600 font-mono text-sm font-black">{activeDetailClass.attendancePercent}%</span>
                    </div>
                    <div className="text-slate-400 font-medium text-[10px]">
                      Có mặt {activeDetailClass.attendanceCount.present}, Muộn {activeDetailClass.attendanceCount.late}, Vắng {activeDetailClass.attendanceCount.absent} trên tổng số {activeDetailClass.attendanceCount.total} phiên điểm danh
                    </div>
                  </div>
                  <Badge variant={activeDetailClass.attendancePercent >= 80 ? 'success' : 'warning'}>
                    {activeDetailClass.attendancePercent >= 80 ? 'Đạt chuẩn chuyên cần' : 'Cần chú ý đi học đầy đủ'}
                  </Badge>
                </div>
              </div>

              {/* Grade breakdown with weight */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Chi tiết trọng số & điểm thi thành phần</h4>
                <div className="border rounded-lg divide-y overflow-hidden bg-white text-xs">
                  {activeDetailClass.assessments.map((ast, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50/40 transition-colors">
                      <div className="font-semibold text-slate-700">
                        {ast.name}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          Trọng số {Math.round(ast.weight * 100)}%
                        </span>
                      </div>
                      <span className={`font-mono font-bold ${ast.score !== '' ? 'text-slate-800 text-sm' : 'text-slate-300 italic'}`}>
                        {ast.score !== '' ? ast.score.toFixed(1) : 'Chưa cập nhật'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Combined academic calculation */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-semibold block">Đánh giá chung học lực môn:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Điểm Chữ:</span>
                    <span className="font-extrabold text-blue-400 text-sm">{activeDetailClass.letterGrade}</span>
                    <span className="text-slate-500 font-mono">|</span>
                    <span className="font-bold text-white text-sm">Hệ 4:</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      {activeDetailClass.gpa4 !== undefined ? activeDetailClass.gpa4.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 font-semibold block">Điểm hệ 10:</span>
                  <span className="text-2xl font-black text-blue-400 font-mono leading-none block mt-1">
                    {activeDetailClass.final10 !== undefined ? activeDetailClass.final10.toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex flex-row-reverse border-t border-slate-100">
              <button 
                onClick={() => setActiveDetailClass(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
