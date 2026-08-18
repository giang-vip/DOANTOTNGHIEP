import React from 'react';
import { Card } from '../../../components/UI';
import { SearchableSelect } from '../../../components/SearchableSelect';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronRight
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
import { convertToGpa4, getAcademicClassification } from '../../../utils/gradeUtils';

export function DashboardView() {
  const {
    stats,
    gradeDistribution,
    filters,
    options,
    handleFilterChange,
    handleBatchFilterChange,
    isLoading,
    error
  } = useDashboardViewModel();

  const currentSemester = React.useMemo(() => {
    return options.semesters.find((s: any) => s.isCurrent) || options.semesters[0];
  }, [options.semesters]);

  const currentYear = React.useMemo(() => {
    if (currentSemester) {
      return options.years.find((y: any) => y.id === currentSemester.academicYearId);
    }
    return options.years.find((y: any) => y.isCurrent) || options.years[0];
  }, [options.years, currentSemester]);

  const gpaData = React.useMemo(() => {
    const classificationCounts: Record<string, number> = {
      'Xuất sắc (3.6-4.0)': 0,
      'Giỏi (3.2-3.59)': 0,
      'Khá (2.5-3.19)': 0,
      'Trung bình (2.0-2.49)': 0,
      'Yếu (< 2.0)': 0
    };

    if (gradeDistribution) {
      Object.entries(gradeDistribution).forEach(([grade, count]) => {
        const gpa = convertToGpa4(grade);
        const classification = getAcademicClassification(gpa);

        if (classification === 'Xuất sắc') classificationCounts['Xuất sắc (3.6-4.0)'] += count;
        else if (classification === 'Giỏi') classificationCounts['Giỏi (3.2-3.59)'] += count;
        else if (classification === 'Khá') classificationCounts['Khá (2.5-3.19)'] += count;
        else if (classification === 'Trung bình') classificationCounts['Trung bình (2.0-2.49)'] += count;
        else classificationCounts['Yếu (< 2.0)'] += count;
      });
    }

    const colorMap: Record<string, string> = {
      'Xuất sắc (3.6-4.0)': '#22c55e',
      'Giỏi (3.2-3.59)': '#3b82f6',
      'Khá (2.5-3.19)': '#eab308',
      'Trung bình (2.0-2.49)': '#f97316',
      'Yếu (< 2.0)': '#ef4444'
    };

    return Object.entries(classificationCounts).map(([name, value]) => ({
      name,
      value,
      color: colorMap[name]
    }));
  }, [gradeDistribution]);

  // --- Filter: compute available class sections based on active filters ---
  const hasAnyParentFilter = !!(filters.yearId || filters.semesterId || filters.departmentId || filters.majorId);

  const filteredClassesOptions = React.useMemo(() => {
    if (!hasAnyParentFilter) return [];

    let result = options.classes;

    // Time filter (semester > year fallback)
    if (filters.semesterId) {
      result = result.filter((c: any) => String(c.semesterId) === String(filters.semesterId));
    } else if (filters.yearId) {
      const semesterIdsOfYear = options.semesters
        .filter((s: any) => String(s.academicYearId) === String(filters.yearId))
        .map((s: any) => String(s.id));
      result = result.filter((c: any) => semesterIdsOfYear.includes(String(c.semesterId)));
    }

    // Department/Major filter (major > department fallback)
    if (filters.majorId) {
      result = result.filter((c: any) => String(c.majorId) === String(filters.majorId));
    } else if (filters.departmentId) {
      const majorIdsOfDept = options.majors
        .filter((m: any) => String(m.departmentId) === String(filters.departmentId))
        .map((m: any) => String(m.id));
      result = result.filter((c: any) =>
        String(c.departmentId) === String(filters.departmentId) || majorIdsOfDept.includes(String(c.majorId))
      );
    }

    return result.map((c: any) => ({ value: c.id, label: `${c.sectionCode} - ${c.subjectName}` }));
  }, [hasAnyParentFilter, options.classes, options.semesters, options.majors, filters.semesterId, filters.yearId, filters.majorId, filters.departmentId]);

  // Auto-reset classSectionId when it's no longer in the filtered list
  React.useEffect(() => {
    if (filters.classSectionId) {
      const stillValid = filteredClassesOptions.some(
        (opt: any) => String(opt.value) === String(filters.classSectionId)
      );
      if (!stillValid) {
        handleFilterChange('classSectionId', undefined);
      }
    }
  }, [filteredClassesOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Dropdown open/close state ---
  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = React.useState(false);
  const [isMajorMenuOpen, setIsMajorMenuOpen] = React.useState(false);
  const semesterMenuRef = React.useRef<HTMLDivElement>(null);
  const majorMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (semesterMenuRef.current && !semesterMenuRef.current.contains(event.target as Node)) {
        setIsSemesterMenuOpen(false);
      }
      if (majorMenuRef.current && !majorMenuRef.current.contains(event.target as Node)) {
        setIsMajorMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Button labels ---
  const timeButtonLabel = React.useMemo(() => {
    if (filters.semesterId) {
      const sem = options.semesters.find((s: any) => String(s.id) === String(filters.semesterId));
      if (sem) {
        const year = options.years.find((y: any) => String(y.id) === String(sem.academicYearId));
        return year ? `${year.code} - ${sem.name}` : sem.name;
      }
      return 'Tất cả thời gian';
    }
    if (filters.yearId) {
      const year = options.years.find((y: any) => String(y.id) === String(filters.yearId));
      return year ? year.code : 'Tất cả thời gian';
    }
    return 'Tất cả thời gian';
  }, [filters.yearId, filters.semesterId, options.semesters, options.years]);

  const majorButtonLabel = React.useMemo(() => {
    if (filters.majorId) {
      const major = options.majors.find((m: any) => String(m.id) === String(filters.majorId));
      return major ? major.name : 'Tất cả khoa viện';
    }
    if (filters.departmentId) {
      const dept = options.departments.find((d: any) => String(d.id) === String(filters.departmentId));
      return dept ? (dept.shortName || dept.name) : 'Tất cả khoa viện';
    }
    return 'Tất cả khoa viện';
  }, [filters.departmentId, filters.majorId, options.departments, options.majors]);

  const classButtonLabel = React.useMemo(() => {
    if (filters.classSectionId) {
      const cls = filteredClassesOptions.find((o: any) => String(o.value) === String(filters.classSectionId));
      return cls ? cls.label : 'Tất cả Lớp học phần';
    }
    return 'Tất cả Lớp học phần';
  }, [filters.classSectionId, filteredClassesOptions]);

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
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Tổng Giảng Viên',
      value: stats.totalTeachers,
      icon: GraduationCap,
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20'
    },
    {
      title: 'Lớp Học Đang Mở',
      value: stats.totalClasses,
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-600',
      shadow: 'shadow-purple-500/20'
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  const GRADE_COLORS: Record<string, string> = {
    'A': '#22c55e',
    'B+': '#3b82f6',
    'B': '#0ea5e9',
    'C+': '#eab308',
    'C': '#f59e0b',
    'D+': '#f97316',
    'D': '#ef4444',
    'F': '#94a3b8'
  };


  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg shadow-blue-900/10 text-white flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-200" />
            <h2 className="text-xl font-bold tracking-tight">Chào mừng trở lại, Admin!</h2>
          </div>
          <div className="flex items-center gap-4 text-blue-100 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Hệ thống đang hoạt động ở: <strong className="text-white">{currentSemester?.name || 'Đang cập nhật'}</strong></span>
            </div>
            <div className="h-4 w-px bg-blue-400/50"></div>
            <span>Năm học: <strong className="text-white">{currentYear?.code || 'Đang cập nhật'}</strong></span>
          </div>
        </div>
        {/* Background decorative elements */}
        <div className="absolute right-0 top-0 w-64 h-full bg-white opacity-5 transform skew-x-12 translate-x-10"></div>
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Bảng Thống Kê Tổng Quan</h2>
        <p className="text-xs text-slate-500">Dữ liệu thời gian thực của hệ thống</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="group relative overflow-hidden p-6 flex items-center gap-5 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 border-none bg-white ring-1 ring-slate-100 shadow-lg">
              {/* Decorative Background Blob */}
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${kpi.gradient} rounded-full blur-3xl -mr-20 -mt-20 opacity-10 transition-transform duration-500 group-hover:scale-150`}></div>

              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${kpi.gradient} ${kpi.shadow} shadow-lg shrink-0 text-white transform transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 z-10`}>
                <Icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 z-10">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider truncate mb-1.5">
                  {kpi.title}
                </p>
                <p className="text-4xl font-extrabold text-slate-800 tracking-tight">
                  {kpi.value}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Teacher Distribution */}
        <Card className="p-6 flex flex-col hover:shadow-xl transition-shadow duration-300 border-none ring-1 ring-slate-100 bg-white shadow-lg rounded-2xl">
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
        <Card className="p-6 flex flex-col hover:shadow-xl transition-shadow duration-300 border-none ring-1 ring-slate-100 bg-white shadow-lg rounded-2xl">
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
        <Card className="p-6 flex flex-col lg:col-span-2 hover:shadow-xl transition-shadow duration-300 border-none ring-1 ring-slate-100 bg-white shadow-lg rounded-2xl">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phổ Điểm Chi Tiết</h3>
              <p className="text-xs text-slate-500">Thống kê số lượng điểm chữ theo bộ lọc</p>
            </div>
            <TrendingUp className="h-4 w-4 text-slate-400 hidden sm:block" />
          </div>

          {/* Filters for Grade Distribution */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-8 bg-slate-50 p-4 rounded-xl ring-1 ring-slate-100 relative z-40">
            <div className="flex items-center gap-2 mr-2 shrink-0">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Bộ lọc phổ điểm</span>
            </div>

            {/* Dropdown 1: Thời gian (Năm → Kỳ) */}
            <div className="relative" ref={semesterMenuRef}>
              <button
                onClick={() => setIsSemesterMenuOpen(!isSemesterMenuOpen)}
                className="flex items-center justify-between w-56 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <span className="truncate">
                  {timeButtonLabel}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
              </button>

              {isSemesterMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-100 rounded-lg shadow-xl z-50 py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => {
                      handleBatchFilterChange({ yearId: undefined, semesterId: undefined, classSectionId: undefined });
                      setIsSemesterMenuOpen(false);
                    }}
                  >
                    Tất cả kỳ học
                  </button>
                  {options.years.map((year: any) => (
                    <div key={`year-${year.id}`} className="relative group">
                      <button
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => {
                          handleBatchFilterChange({ yearId: year.id, semesterId: undefined, classSectionId: undefined });
                          setIsSemesterMenuOpen(false);
                        }}
                      >
                        <span>{year.code}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </button>
                      <div className="absolute top-0 left-full -ml-1 pl-1 w-56 hidden group-hover:block z-50">
                        <div className="bg-white border border-slate-100 rounded-lg shadow-xl py-1">
                          {options.semesters.filter((s: any) => String(s.academicYearId) === String(year.id)).map((semester: any) => (
                            <button
                              key={`sem-${semester.id}`}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => {
                                handleBatchFilterChange({ yearId: year.id, semesterId: semester.id, classSectionId: undefined });
                                setIsSemesterMenuOpen(false);
                              }}
                            >
                              {semester.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown 2: Khoa/Viện (Khoa → Ngành) */}
            <div className="relative" ref={majorMenuRef}>
              <button
                onClick={() => setIsMajorMenuOpen(!isMajorMenuOpen)}
                className="flex items-center justify-between w-56 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              >
                <span className="truncate">
                  {majorButtonLabel}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
              </button>

              {isMajorMenuOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-100 rounded-lg shadow-xl z-50 py-1 max-h-96 overflow-y-visible">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => {
                      handleBatchFilterChange({ departmentId: undefined, majorId: undefined, classSectionId: undefined });
                      setIsMajorMenuOpen(false);
                    }}
                  >
                    Tất cả khoa viện
                  </button>
                  {options.departments.map((dept: any) => (
                    <div key={`dept-${dept.id}`} className="relative group">
                      <button
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        onClick={() => {
                          handleBatchFilterChange({ departmentId: dept.id, majorId: undefined, classSectionId: undefined });
                          setIsMajorMenuOpen(false);
                        }}
                      >
                        <span className="truncate text-left max-w-[80%]">{dept.shortName || dept.name}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      </button>
                      <div className="absolute top-0 left-full -ml-1 pl-1 w-60 hidden group-hover:block z-50">
                        <div className="bg-white border border-slate-100 rounded-lg shadow-xl py-1 max-h-96 overflow-y-auto">
                          {options.majors.filter((m: any) => String(m.departmentId) === String(dept.id)).length === 0 ? (
                            <div className="px-4 py-2 text-xs text-slate-400 italic">Không có dữ liệu</div>
                          ) : (
                            options.majors.filter((m: any) => String(m.departmentId) === String(dept.id)).map((major: any) => (
                              <button
                                key={`major-${major.id}`}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                onClick={() => {
                                  handleBatchFilterChange({ departmentId: dept.id, majorId: major.id, classSectionId: undefined });
                                  setIsMajorMenuOpen(false);
                                }}
                              >
                                {major.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dropdown 3: Lớp Học Phần (SearchableSelect, phụ thuộc 2 bộ lọc trên) */}
            <div className="flex-1 min-w-[200px] max-w-xs relative z-30">
              <SearchableSelect
                name="classSectionId"
                value={filters.classSectionId}
                onChange={(val) => handleFilterChange('classSectionId', val ? Number(val) : undefined)}
                options={filteredClassesOptions}
                placeholder={!hasAnyParentFilter ? "Vui lòng chọn Năm/Kỳ hoặc Khoa/Ngành trước" : "Tất cả Lớp học phần"}
                disabled={isLoading || !hasAnyParentFilter}
                allowClear
              />
            </div>
          </div>

          {/* Charts Area */}
          <div className="flex flex-col gap-12 w-full mt-auto relative z-10">
            {/* Bar Chart 1 */}
            <div className="h-[300px] w-full">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Chi Tiết Từng Điểm Chữ</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(gradeDistribution || {}).map(([name, value]) => ({ name, value })).sort((a, b) => {
                  const order = ['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
                  return order.indexOf(a.name) - order.indexOf(b.name);
                })} layout="horizontal" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [`${value} Sinh viên`, `Điểm ${props.payload.name}`]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar
                    dataKey="value"
                    name="Số lượng SV"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                  >
                    {Object.entries(gradeDistribution).map(([name, value], index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[name] || COLORS[index % COLORS.length]} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="#475569" fontSize={13} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart 2 */}
            <div className="h-[300px] w-full pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">Thống Kê Theo Phân Loại Học Lực (GPA)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gpaData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => [`${value} sinh viên`, `Học lực: ${props.payload.name}`]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    barSize={60}
                  >
                    {gpaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                    <LabelList dataKey="value" position="top" fill="#475569" fontSize={12} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
