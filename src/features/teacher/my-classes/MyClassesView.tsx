import React, { useState } from 'react';
import { useMyClassesViewModel } from './useMyClassesViewModel';
import { Card, Table, FormInput, Badge } from '../../../components/UI';
import { BookOpen, Users, Megaphone, Calendar, Send, Trash2, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyTimetable } from '../../../components/WeeklyTimetable';
import { ClassSection } from '../../../models';

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

interface MyClassesViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function MyClassesView({ teacherId, triggerToast }: MyClassesViewProps) {
  const [showTimetable, setShowTimetable] = useState(true);
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

  const {
    myClasses,
    selectedClass,
    setSelectedClass,
    classStudents,
    classAnnouncements,
    annTitle,
    setAnnTitle,
    annContent,
    setAnnContent,
    errors,
    postAnnouncement,
    deleteAnnouncement,
    isLoadingClasses,
    isLoadingStudents,
    isLoadingAnnouncements,
    isPosting
  } = useMyClassesViewModel(teacherId);

  const [detailTab, setDetailTab] = useState<'roster' | 'announcements'>('roster');

  const handlePostAction = (e: React.FormEvent) => {
    e.preventDefault();
    postAnnouncement(
      (msg) => triggerToast(msg, 'success'),
      (msg) => triggerToast(msg, 'danger')
    );
  };

  const studentColumns = [
    {
      header: 'Mã SV',
      accessor: (s: any) => <span className="font-mono font-bold text-slate-800">{s.studentCode || s.id}</span>
    },
    {
      header: 'Họ và Tên',
      accessor: (s: any) => <span className="font-semibold text-slate-800">{s.studentName || s.name || 'N/A'}</span>
    },
    {
      header: 'Trạng thái',
      accessor: (s: any) => (
        <Badge variant={s.status === 'ENROLLED' ? 'success' : s.status === 'DROPPED' ? 'danger' : 'gray'}>
          {s.status === 'ENROLLED' ? 'Đang học' : s.status === 'DROPPED' ? 'Đã hủy' : s.status || 'N/A'}
        </Badge>
      )
    },
    {
      header: 'Ngày đăng ký',
      accessor: (s: any) => (
        <span className="text-xs text-slate-500">
          {s.enrolledAt ? new Date(s.enrolledAt).toLocaleDateString('vi-VN') : 'N/A'}
        </span>
      )
    },
    {
      header: 'Ghi chú',
      accessor: (s: any) => <span className="text-xs text-slate-400">{s.note || '—'}</span>
    }
  ];

  // Helper to map backend ClassSectionResponse to ClassSection model for WeeklyTimetable
  const mappedTimetableClasses = myClasses.map((cls: any) => {
    const parseHour = (timeStr: string) => {
      if (!timeStr) return 0;
      const parts = timeStr.split(':');
      return parseInt(parts[0], 10);
    };

    const startHour = parseHour(cls.startTime);
    const endHour = parseHour(cls.endTime);

    let periodStart = 1;
    if (startHour >= 7 && startHour < 8) periodStart = 1;
    else if (startHour >= 8 && startHour < 9) periodStart = 2;
    else if (startHour >= 9 && startHour < 10) periodStart = 3;
    else if (startHour >= 10 && startHour < 11) periodStart = 4;
    else if (startHour >= 11 && startHour < 12) periodStart = 5;
    else if (startHour >= 13 && startHour < 14) periodStart = 7;
    else if (startHour >= 14 && startHour < 15) periodStart = 8;
    else if (startHour >= 15 && startHour < 16) periodStart = 9;
    else if (startHour >= 16 && startHour < 17) periodStart = 10;
    else if (startHour >= 17 && startHour < 18) periodStart = 11;

    let periodEnd = periodStart + 2;
    if (endHour > startHour) {
      const diff = endHour - startHour;
      periodEnd = periodStart + Math.max(1, Math.min(4, diff));
    }

    return {
      id: cls.sectionCode || `LHP-${cls.id}`,
      subjectId: String(cls.subjectId || ''),
      subjectName: cls.subjectName || '',
      credits: cls.credits || 3,
      teacherId: String(cls.teacherId || ''),
      teacherName: cls.teacherName || 'Giảng viên',
      schedule: `${cls.weekday ? `Thứ ${cls.weekday}` : ''} (${cls.startTime || ''} - ${cls.endTime || ''})`,
      dayOfWeek: cls.weekday || 2,
      timeSlot: `${cls.startTime || ''} - ${cls.endTime || ''}`,
      room: cls.room || 'N/A',
      capacity: cls.capacity || 0,
      studentIds: [],
      startDate: cls.startDate || '',
      endDate: cls.endDate || '',
      semesterId: cls.semesterId || 0,
      sectionCode: cls.sectionCode || '',
      weekday: cls.weekday || 2,
      startTime: cls.startTime || '',
      endTime: cls.endTime || '',
      periodStart,
      periodEnd
    } as unknown as ClassSection;
  });

  return (
    <div className="space-y-6">
      {/* Timetable toggle panel */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Lịch Dạy Học Phần</h3>
              <p className="text-[11px] text-slate-400">
                Tuần học từ <span className="text-blue-600 font-semibold">{monday.toLocaleDateString('vi-VN')}</span> đến <span className="text-blue-600 font-semibold">{sunday.toLocaleDateString('vi-VN')}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={currentDate.toISOString().split('T')[0]}
              onChange={(e) => setCurrentDate(new Date(e.target.value))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm cursor-pointer transition-colors focus:outline-none focus:border-blue-500"
              title="Chọn ngày bất kỳ để xem thời khóa biểu tuần đó"
            />
            
            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
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

            <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
            <button
              onClick={() => setShowTimetable(!showTimetable)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {showTimetable ? 'Thu gọn' : 'Mở rộng'}
            </button>
          </div>
        </div>

        {showTimetable && (
          <div className="p-4 bg-slate-50/50">
            <WeeklyTimetable enrolledClasses={mappedTimetableClasses} currentDate={currentDate} ignoreDateFilter={false} />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Assigned Classes list */}
      <div className="lg:col-span-1 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Lớp được phân công</h2>
          <p className="text-[11px] text-slate-400">Chọn một lớp học để quản lý học viên & thông báo</p>
        </div>

        <div className="flex flex-col gap-3">
          {isLoadingClasses ? (
             <div className="p-4 text-center text-slate-400 text-xs">Đang tải danh sách lớp...</div>
          ) : myClasses.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-400 text-xs border border-dashed border-slate-200">
              Chưa có phân công lớp học phần nào cho giảng viên này.
            </div>
          ) : (
            myClasses.map((cls) => {
              const isSelected = selectedClass?.id === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 text-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {cls.sectionCode || `LHP-${cls.id}`}
                    </span>
                    <Badge variant={isSelected ? 'success' : 'info'}>{cls.semesterCode || 'N/A'}</Badge>
                  </div>
                  <h4 className={`text-sm font-bold truncate leading-snug ${isSelected ? 'text-white' : 'text-slate-850'}`}>
                    {cls.subjectName}
                  </h4>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {cls.weekday ? `Thứ ${cls.weekday}` : ''}
                      {cls.startTime && cls.endTime ? ` (${cls.startTime} - ${cls.endTime})` : ''}
                      {cls.room ? ` • ${cls.room}` : ''}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Class detail and workspace */}
      <div className="lg:col-span-3 space-y-5">
        {selectedClass ? (
          <>
            {/* Detail Class Header Card */}
            <Card className="p-5 bg-gradient-to-r from-slate-900 to-slate-850 border-none text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Chi tiết học phần</span>
                <h3 className="text-lg font-bold leading-none mt-1.5">{selectedClass.subjectName}</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Lớp: <strong className="font-mono text-slate-200">{selectedClass.sectionCode || `LHP-${selectedClass.id}`}</strong> • Phòng học: <strong className="text-slate-200">{selectedClass.room || 'N/A'}</strong> • Sức chứa: <strong className="text-slate-200">{selectedClass.capacity || 0} chỗ</strong>
                </p>
              </div>

              {/* Detail Tabs */}
              <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setDetailTab('roster')}
                  className={`flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    detailTab === 'roster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 inline mr-1" /> Sĩ số ({classStudents.length})
                </button>
                <button
                  onClick={() => setDetailTab('announcements')}
                  className={`flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    detailTab === 'announcements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Megaphone className="h-3.5 w-3.5 inline mr-1" /> Thông báo ({classAnnouncements.length})
                </button>
              </div>
            </Card>

            {/* Tab: Student Roster */}
            {detailTab === 'roster' && (
              <div className="p-4 bg-white rounded-b-xl border border-slate-200 border-t-0">
                {isLoadingStudents ? (
                  <div className="py-12 text-center text-slate-400 text-sm">Đang tải danh sách học viên...</div>
                ) : classStudents.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Users className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm">Chưa có sinh viên nào đăng ký vào lớp học phần này.</p>
                  </div>
                ) : (
                  <Table
                    columns={studentColumns}
                    data={classStudents}
                    emptyMessage="Lớp chưa có sinh viên nào đăng ký."
                  />
                )}
              </div>
            )}

            {/* Tab: Class Announcements */}
            {detailTab === 'announcements' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Announcement Post form */}
                <div className="md:col-span-1">
                  <Card className="p-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Đăng Thông Báo Mới</h4>
                    <form onSubmit={handlePostAction} className="space-y-3">
                      <FormInput
                        label="Tiêu đề"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Tiêu đề..."
                        error={errors.title}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Nội dung
                        </label>
                        <textarea
                          value={annContent}
                          onChange={(e) => setAnnContent(e.target.value)}
                          rows={4}
                          placeholder="Nhập thông báo gửi lớp..."
                          className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 ${
                            errors.content ? 'border-rose-300' : 'border-slate-200'
                          }`}
                        />
                        {errors.content && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.content}</p>}
                      </div>
                      <button
                        type="submit"
                        disabled={isPosting}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors ${isPosting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        <Send className="h-4 w-4" /> {isPosting ? 'Đang gửi...' : 'Đăng & Gửi Email'}
                      </button>
                    </form>
                  </Card>
                </div>

                {/* Announcement Feed */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Lịch sử thông báo</h4>
                  <div className="p-5 flex flex-col gap-4">
                    {isLoadingAnnouncements ? (
                      <div className="py-8 text-center text-slate-400 text-sm">Đang tải lịch sử thông báo...</div>
                    ) : classAnnouncements.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-sm">
                        Chưa có thông báo nào được đăng cho lớp học phần này.
                      </div>
                    ) : (
                      classAnnouncements.map((notif) => (
                        <Card key={notif.id} className="p-4 space-y-2 relative group border border-slate-250">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">{notif.title}</h5>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                Đăng bởi {notif.createdByUsername || notif.sender || 'Giảng viên'} • {notif.createdAt ? new Date(notif.createdAt).toLocaleString('vi-VN') : ''}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteAnnouncement(
                                notif.id,
                                (msg) => triggerToast(msg, 'success'),
                                (msg) => triggerToast(msg, 'danger')
                              )}
                              className="p-1 rounded-md text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Xóa thông báo"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-600 bg-slate-50/50 rounded-lg p-2.5 whitespace-pre-line leading-relaxed">
                            {notif.content}
                          </p>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-16 text-center text-slate-400 text-sm font-medium">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            Vui lòng chọn một lớp bên trái để xem thông tin chi tiết.
          </Card>
        )}
      </div>
    </div>
  </div>
);
}
