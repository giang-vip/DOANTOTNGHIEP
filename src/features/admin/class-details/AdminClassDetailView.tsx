import React from 'react';
import { useAdminClassDetailViewModel } from './useAdminClassDetailViewModel';
import { ClassSection } from '../../../models/ClassSection';
import { Card } from '../../../components/UI';
import { GradingView } from '../../teacher/grading/GradingView';
import { ChevronLeft, Info, FileSpreadsheet } from 'lucide-react';

interface AdminClassDetailViewProps {
  classSection: ClassSection;
  onBack: () => void;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function AdminClassDetailView({ classSection: initialClass, onBack, triggerToast }: AdminClassDetailViewProps) {
  const { activeTab, setActiveTab, classSection } = useAdminClassDetailViewModel(initialClass);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <button
          onClick={onBack}
          className="w-fit px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm mb-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Quay lại danh sách lớp
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Chi tiết Lớp học phần: {classSection.sectionCode}
        </h2>
        <p className="text-sm text-slate-500">Môn: {classSection.subjectName} | Giảng viên: {classSection.teacherName}</p>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Info className="h-4 w-4" /> Thông tin chung
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'grades'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" /> Quản lý điểm số
        </button>
      </div>

      {activeTab === 'info' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Thông tin lớp học phần</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Mã LHP:</span> {classSection.sectionCode}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Môn học:</span> {classSection.subjectName}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Số TC:</span> {classSection.credits}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Sĩ số giới hạn:</span> {classSection.capacity}</p>
            </div>
            <div>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Giảng viên:</span> {classSection.teacherName}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Kỳ học:</span> {classSection.semesterName}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Trạng thái:</span> {classSection.status === 'ACTIVE' ? 'Đang mở' : classSection.status === 'COMPLETED' ? 'Đã đóng' : 'Đã hủy'}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Ghi chú:</span> {classSection.note || 'Không có'}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {/* We pass isAdmin=true and the adminClassSection */}
          <GradingView 
            teacherId="" 
            triggerToast={triggerToast} 
            isAdmin={true} 
            adminClassSection={classSection} 
          />
        </div>
      )}
    </div>
  );
}
