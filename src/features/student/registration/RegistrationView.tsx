import React, { useState } from 'react';
import { useRegistrationViewModel } from './useRegistrationViewModel';
import { Card, Table, Badge } from '../../../components/UI';
import { Student, ClassSection } from '../../../types';
import {
  Calendar, Search, BookOpen, Clock, AlertTriangle, CheckCircle2,
  AlertCircle, Info, Trash2
} from 'lucide-react';
import { WeeklyTimetable } from '../../../components/WeeklyTimetable';

interface RegistrationViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function RegistrationView({ studentProfile, triggerToast }: RegistrationViewProps) {
  const {
    registrationPeriod,
    isWindowActive,
    availableClasses,
    enrolledClasses,
    searchTerm,
    setSearchTerm,
    handleEnroll,
    handleDrop,
    checkScheduleConflict
  } = useRegistrationViewModel(studentProfile);

  const [activeSubTab, setActiveSubTab] = useState<'available' | 'registered'>('available');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [classToDrop, setClassToDrop] = useState<ClassSection | null>(null);

  const onEnrollAction = (cls: ClassSection) => {
    handleEnroll(
      cls,
      (msg) => triggerToast(msg, 'success'),
      (msg) => triggerToast(msg, 'danger')
    );
  };

  const onDropAction = (cls: ClassSection) => {
    setClassToDrop(cls);
    setIsConfirmModalOpen(true);
  };

  const totalCredits = enrolledClasses.reduce((sum, c) => sum + c.credits, 0);

  // Corrected Vietnamese lecture hours mappings for periods
  const getPeriodTime = (period: number, isEnd: boolean) => {
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

  const getTimeLabel = (start: number, end: number) => {
    return `${getPeriodTime(start, false)} - ${getPeriodTime(end, true)}`;
  };

  const availableColumns = [
    {
      header: 'Mã Lớp HP',
      accessor: (cls: ClassSection) => <span className="font-mono font-bold text-slate-800 text-xs">{cls.id}</span>
    },
    {
      header: 'Học Phần',
      accessor: (cls: ClassSection) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 text-xs">{cls.subjectName}</span>
          <div className="text-[10px] text-slate-400 font-semibold">Tiên quyết: {cls.id.startsWith('INT102') ? 'INT101' : cls.id.startsWith('MAT102') ? 'MAT101' : 'Không có'}</div>
        </div>
      )
    },
    {
      header: 'Tín Chỉ',
      accessor: (cls: ClassSection) => <span className="font-bold text-slate-700 text-xs">{cls.credits} TC</span>
    },
    {
      header: 'Giảng Viên',
      accessor: (cls: ClassSection) => <span className="text-slate-600 text-xs">{cls.teacherName}</span>
    },
    {
      header: 'Thời Khóa Biểu',
      accessor: (cls: ClassSection) => {
        const isEnrolled = cls.studentIds.includes(studentProfile.id);
        const conflictCheck = !isEnrolled ? checkScheduleConflict(cls) : { conflict: false };
        return (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-150 block w-max">
              Thứ {cls.dayOfWeek} (Tiết {cls.periodStart}-{cls.periodEnd})
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">
              ({getTimeLabel(cls.periodStart, cls.periodEnd)})
            </span>
            {conflictCheck.conflict && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-sm flex items-center gap-1 w-max" title={conflictCheck.message}>
                <AlertCircle className="h-3 w-3 text-amber-600" /> Trùng lịch
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Sĩ Số',
      accessor: (cls: ClassSection) => {
        const currentCount = cls.studentIds.length;
        const maxCap = cls.capacity || 40;
        const isFull = currentCount >= maxCap;
        return (
          <span className={`font-mono text-xs font-semibold ${isFull ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
            {currentCount} / {maxCap}
          </span>
        );
      }
    },
    {
      header: 'Thao Tác',
      accessor: (cls: ClassSection) => {
        const isEnrolled = cls.studentIds.includes(studentProfile.id);
        const currentCount = cls.studentIds.length;
        const maxCap = cls.capacity || 40;
        const isFull = currentCount >= maxCap;
        const conflictCheck = !isEnrolled ? checkScheduleConflict(cls) : { conflict: false };

        if (isEnrolled) {
          return (
            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Đăng ký thành công</span>
              <button
                disabled={!isWindowActive}
                onClick={() => onDropAction(cls)}
                className="px-2 py-1 border border-rose-200 hover:bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md disabled:opacity-50 cursor-pointer transition-colors"
              >
                Hủy
              </button>
            </div>
          );
        }

        return (
          <div className="text-right">
            <button
              disabled={!isWindowActive || isFull || conflictCheck.conflict}
              onClick={() => onEnrollAction(cls)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                isFull
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : conflictCheck.conflict
                    ? 'bg-amber-50 text-amber-500 border border-amber-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:scale-102 active:scale-98'
              }`}
            >
              {isFull ? 'Lớp đầy' : conflictCheck.conflict ? 'Trùng lịch học' : 'Đăng ký'}
            </button>
          </div>
        );
      },
      className: 'text-right'
    }
  ];

  const daysOfWeekHeader = [2, 3, 4, 5, 6, 7]; // Mon - Sat

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Đăng Ký Học Phần Trực Tuyến</h2>
          <p className="text-xs text-slate-500">Đăng ký lịch trình học, rút môn, hoặc bổ sung tín chỉ theo quy chế của nhà trường</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveSubTab('available')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              activeSubTab === 'available' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Lớp Học Phần Mở
          </button>

          <button
            onClick={() => setActiveSubTab('registered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border relative ${
              activeSubTab === 'registered' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Đã đăng ký ({enrolledClasses.length})
            {totalCredits > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {totalCredits}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Registration Timeline indicator banner */}
      {isWindowActive ? (
        <Card className="p-4 bg-emerald-50/50 border-emerald-150 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <div className="text-xs text-emerald-800 leading-normal">
            <strong>Cổng đăng ký học phần đang mở!</strong> Bạn có thể bổ sung, sửa đổi hoặc rút môn học. Tổng số tín chỉ tối thiểu: 12 TC, tối đa: 25 TC. Hạn đóng: {registrationPeriod.endDate ? new Date(registrationPeriod.endDate).toLocaleDateString('vi-VN') : 'Khi có chỉ thị mới'}.
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-slate-50 border-slate-150 flex items-center gap-3">
          <AlertTriangle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
          <div className="text-xs text-slate-500 leading-normal">
            <strong>Hệ thống đăng ký hiện đang đóng.</strong> Bạn chỉ có thể xem danh mục lớp học phần đang mở hoặc rà soát phiếu đăng ký học tập cũ. Vui lòng quay lại khi có thông báo chính thức từ Phòng Đào Tạo.
          </div>
        </Card>
      )}

      {/* CHUYỂN KHUNG THỜI KHÓA BIỂU DỰ KIẾN LÊN TRÊN CÙNG - HIỂN THỊ SẴN */}
      <Card className="p-4 bg-white border border-slate-150 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Calendar className="h-4.5 w-4.5 text-blue-600" />
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Thời Khóa Biểu Lên Lớp Dự Kiến (Cập Nhật Tức Thời)</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Lịch trình tự động đồng bộ ngay khi bạn ấn nút Đăng ký hoặc Hủy môn bên dưới</p>
          </div>
        </div>

        {/* Timetable Grid Preview always rendered here */}
        <WeeklyTimetable enrolledClasses={enrolledClasses} />
      </Card>

      {activeSubTab === 'available' ? (
        <div className="space-y-4">
          {/* Search bar & Prerequisite notice info box */}
          <Card className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên môn học, mã lớp..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-750"
              />
            </div>

            <div className="flex flex-col gap-2 text-[10px] text-slate-400 font-semibold">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0" />
                <span>Danh sách lớp học phần chỉ hiển thị theo ngành bạn đang theo học.</span>
              </div>
              <span>Học phần nâng cao <strong className="text-slate-600">INT102</strong> yêu cầu môn tiên quyết <strong className="text-slate-600">INT101</strong>; Học phần <strong className="text-slate-600">MAT102</strong> yêu cầu <strong className="text-slate-600">MAT101</strong>.</span>
            </div>
          </Card>

          {/* Table display */}
          <Card>
            <Table
              data={availableClasses}
              columns={availableColumns}
              emptyMessage="Không tìm thấy lớp học phần mở nào phù hợp với ngành của bạn hoặc từ khóa tìm kiếm."
            />
          </Card>
        </div>
      ) : (
        /* Enrolled classes overview */
        <div className="space-y-5">
          <Card className="p-5 bg-blue-50/25 border-blue-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Phiếu đăng ký tín chỉ cá nhân</span>
              <p className="text-sm font-bold text-slate-800 mt-1">Đã đăng ký thành công: <strong className="text-blue-600 text-base">{totalCredits}</strong> tín chỉ ({enrolledClasses.length} lớp học phần)</p>
            </div>
            {totalCredits < 12 && (
              <Badge variant="danger" className="text-[10px] font-bold">Chưa đạt mức tối thiểu (12 TC)</Badge>
            )}
          </Card>

          <Card>
            <Table
              data={enrolledClasses}
              columns={availableColumns}
              emptyMessage="Bạn chưa đăng ký lớp học phần nào cho học kỳ này."
            />
          </Card>
        </div>
      )}

      {isConfirmModalOpen && classToDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Xác nhận</h3>
            <p className="text-xs text-slate-600 mb-6">
              Bạn có chắc chắn muốn rút đăng ký học phần "{classToDrop.subjectName}" không? Mọi điểm số thành phần sẽ bị xóa.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  handleDrop(
                    classToDrop,
                    (msg) => triggerToast(msg, 'success'),
                    (msg) => triggerToast(msg, 'danger')
                  );
                  setIsConfirmModalOpen(false);
                  setClassToDrop(null);
                }}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
