import React, { useState } from 'react';
import { Card } from '../../../components/UI';
import { Search, AlertTriangle, HelpCircle, Calendar, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useRegistrationViewModel } from './useRegistrationViewModel';
import { Student, ClassSection } from '../../../models';
import { WeeklyTimetable } from '../../../components/WeeklyTimetable';

export interface RegistrationViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function RegistrationView({ studentProfile, triggerToast }: RegistrationViewProps) {
  const {
    registrationPeriod,
    isWindowActive,
    enrolledClasses,
    searchTerm,
    setSearchTerm,
    handleEnroll,
    handleDrop,
    checkScheduleConflict,
    loading,
    groupedSubjects
  } = useRegistrationViewModel(studentProfile);

  const [activeTab, setActiveTab] = useState<'ct1' | 'ct2' | 'nk'>('ct1');
  const [expandedSubjectId, setExpandedSubjectId] = useState<number | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [classToDrop, setClassToDrop] = useState<ClassSection | null>(null);

  const onDropAction = (cls: ClassSection) => {
    setClassToDrop(cls);
    setIsConfirmModalOpen(true);
  };

  const onEnrollAction = (cls: ClassSection) => {
    handleEnroll(cls, 
      (msg) => triggerToast(msg, 'success'),
      (msg) => triggerToast(msg, 'danger')
    );
  };

  const handleConfirmDrop = () => {
    if (!classToDrop) return;
    handleDrop(
      classToDrop,
      (msg) => triggerToast(msg, 'success'),
      (msg) => triggerToast(msg, 'danger')
    );
    setIsConfirmModalOpen(false);
    setClassToDrop(null);
  };

  const toggleSubject = (subjectId: number) => {
    if (expandedSubjectId === subjectId) {
      setExpandedSubjectId(null);
    } else {
      setExpandedSubjectId(subjectId);
    }
  };

  // Tính tổng TC đã ĐK
  const totalCredits = enrolledClasses.reduce((acc, c) => acc + ((c as any).credits || 3), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* HEADER TÌM KIẾM VÀ TRẠNG THÁI */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Đăng Ký Học Phần</h2>
          <p className="text-xs text-slate-500">
            {isWindowActive ? 
              `Cổng mở từ ${new Date(registrationPeriod.startDate).toLocaleDateString('vi-VN')} đến ${new Date(registrationPeriod.endDate).toLocaleDateString('vi-VN')}` 
              : 'Hệ thống đăng ký hiện đang đóng.'
            }
          </p>
        </div>
        
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên môn học..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline bg-white text-slate-800"
          />
        </div>
      </div>

      {!isWindowActive && (
        <Card className="p-4 bg-slate-50 border-slate-200 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
          <div className="text-sm text-slate-600">
            <strong>Hệ thống đang đóng.</strong> Bạn chỉ có thể xem thời khóa biểu hoặc lịch sử phiếu đăng ký. Vui lòng quay lại khi có thông báo.
          </div>
        </Card>
      )}

      {/* 1. THỜI KHÓA BIỂU ĐĂNG KÝ (TIMETABLE) */}
      <Card className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Thời khóa biểu Đăng ký (Dự kiến)</h3>
        <WeeklyTimetable 
          enrolledClasses={enrolledClasses} 
          onDropClass={isWindowActive ? onDropAction : undefined} 
          ignoreDateFilter={true}
        />
      </Card>

      {/* 2. DANH SÁCH ĐƠN ĐĂNG KÝ / HỦY ĐĂNG KÝ */}
      <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-center text-lg font-bold text-slate-800">Danh sách đơn đăng ký/hủy đăng ký</h3>
          <p className="text-center text-xs text-slate-500 mt-1">Tổng cộng: {totalCredits} tín chỉ</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-700 w-16">STT</th>
                <th className="px-4 py-3 font-bold text-slate-700">Mã học phần</th>
                <th className="px-4 py-3 font-bold text-slate-700">Tên học phần</th>
                <th className="px-4 py-3 font-bold text-slate-700">Mã lớp</th>
                <th className="px-4 py-3 font-bold text-slate-700">Thời gian</th>
                <th className="px-4 py-3 font-bold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 font-bold text-slate-700 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {enrolledClasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                    Chưa đăng ký môn học nào.
                  </td>
                </tr>
              ) : (
                enrolledClasses.map((cls, idx) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs">{cls.subjectId}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{cls.subjectName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600">{cls.id}</td>
                    <td className="px-4 py-3 text-xs">
                      {cls.weekday ? `Thứ ${cls.weekday}` : ''} ({cls.startTime} - {cls.endTime})
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Đã đăng ký</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onDropAction(cls)}
                        disabled={!isWindowActive}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200 hover:bg-rose-50 px-2 py-1 rounded cursor-pointer transition-colors"
                      >
                        Hủy
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. DANH SÁCH HỌC PHẦN MỞ (GOM THEO MÔN HỌC) */}
      <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('ct1')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'ct1' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
          >
            Chương trình 1
          </button>
          <button
            onClick={() => setActiveTab('ct2')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'ct2' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
          >
            Chương trình 2
          </button>
          <button
            onClick={() => setActiveTab('nk')}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${activeTab === 'nk' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
          >
            Ngoài khung
          </button>
        </div>
        
        <div className="p-3 bg-slate-50/30">
          <p className="text-xs italic text-slate-500 mb-2">(Ghi chú: Nhấn vào Tên học phần màu xanh để xem danh sách lớp mở)</p>
          
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700 w-12">STT</th>
                  <th className="px-4 py-3 font-bold text-slate-700 w-32">Mã học phần</th>
                  <th className="px-4 py-3 font-bold text-slate-700">Tên học phần</th>
                  <th className="px-4 py-3 font-bold text-slate-700 w-24 text-center">Tổng số TC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupedSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">Không có lớp học phần nào mở.</td>
                  </tr>
                ) : (
                  groupedSubjects.map((subjectGroup, idx) => (
                    <React.Fragment key={subjectGroup.subjectId}>
                      {/* Row Môn Học */}
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">{idx + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs">{subjectGroup.subjectId}</td>
                        <td className="px-4 py-3">
                          {subjectGroup.classes.length > 0 ? (
                            <button
                              onClick={() => toggleSubject(subjectGroup.subjectId)}
                              className="text-blue-600 font-semibold hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer transition-all focus:outline-none"
                            >
                              {expandedSubjectId === subjectGroup.subjectId ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              {subjectGroup.subjectName}
                            </button>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <span className="w-4 h-4 inline-block" /> {/* Placeholder cho icon */}
                              {subjectGroup.subjectName} <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded ml-2">Chưa mở</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700">
                          {(subjectGroup.classes[0] as any)?.credits || 3}
                        </td>
                      </tr>
                      
                      {/* Bảng Xổ Xuống Danh Sách Lớp (Expanded) */}
                      {expandedSubjectId === subjectGroup.subjectId && (
                        <tr>
                          <td colSpan={4} className="p-0 border-b-2 border-blue-100 bg-blue-50/10">
                            <div className="p-4 bg-slate-50/50 shadow-inner">
                              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded overflow-hidden">
                                <thead className="bg-slate-200/50 border-b border-slate-200">
                                  <tr>
                                    <th className="px-3 py-2 font-bold text-slate-700">Mã lớp</th>
                                    <th className="px-3 py-2 font-bold text-slate-700">Giáo viên</th>
                                    <th className="px-3 py-2 font-bold text-slate-700">Ngày bắt đầu</th>
                                    <th className="px-3 py-2 font-bold text-slate-700">Địa điểm</th>
                                    <th className="px-3 py-2 font-bold text-slate-700">Thời gian</th>
                                    <th className="px-3 py-2 font-bold text-slate-700 text-center">Sĩ số</th>
                                    <th className="px-3 py-2 font-bold text-slate-700 text-center">Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {subjectGroup.classes.map(cls => {
                                    const isEnrolled = enrolledClasses.some(e => e.id === cls.id);
                                    const isFull = (cls.enrolledCount || 0) >= (cls.capacity || 40);
                                    const conflictCheck = checkScheduleConflict(cls);
                                    
                                    return (
                                      <tr key={cls.id} className={isEnrolled ? 'bg-emerald-50/30' : 'hover:bg-slate-50'}>
                                        <td className="px-3 py-2 font-mono text-blue-600 font-semibold">{cls.id}</td>
                                        <td className="px-3 py-2">{cls.teacherName || 'Đang cập nhật'}</td>
                                        <td className="px-3 py-2">{cls.startDate ? new Date(cls.startDate).toLocaleDateString('vi-VN') : '--'}</td>
                                        <td className="px-3 py-2 font-mono">P.{cls.room || 'N/A'}</td>
                                        <td className="px-3 py-2">
                                          {cls.weekday ? `Thứ ${cls.weekday}` : ''} {cls.startTime}-{cls.endTime}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          <span className={`${isFull ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
                                            {cls.enrolledCount || 0}/{cls.capacity || 40}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                          {isEnrolled ? (
                                            <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                                              <Check className="w-3.5 h-3.5" /> Đã ĐK
                                            </span>
                                          ) : (
                                            <button
                                              onClick={() => onEnrollAction(cls)}
                                              disabled={!isWindowActive || isFull || conflictCheck.conflict}
                                              className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition-all ${
                                                isFull
                                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                  : conflictCheck.conflict
                                                    ? 'bg-amber-50 text-amber-500 border border-amber-200 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                              }`}
                                              title={conflictCheck.conflict ? conflictCheck.message : ''}
                                            >
                                              {isFull ? 'Đầy' : conflictCheck.conflict ? 'Trùng' : 'Đăng ký'}
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal Xác nhận hủy đăng ký */}
      {isConfirmModalOpen && classToDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white p-5 rounded-xl shadow-xl max-w-xs w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mb-3 text-rose-500">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Hủy đăng ký lớp học phần?
              </h3>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed px-2">
                Bạn có chắc muốn hủy lớp <span className="font-bold text-blue-600">{classToDrop.subjectName}</span>?
              </p>
              
              <div className="flex items-center justify-center gap-3 w-full">
                <button
                  onClick={() => {
                    setIsConfirmModalOpen(false);
                    setClassToDrop(null);
                  }}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Không
                </button>
                <button
                  onClick={handleConfirmDrop}
                  className="flex-1 py-2 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
