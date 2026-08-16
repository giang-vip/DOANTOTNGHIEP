import React from 'react';
import { useClassDetailViewModel } from './useClassDetailViewModel';
import { Student, ClassSection } from '../../../../models';
import { Badge } from '../../../../components/UI';
import { ChevronLeft } from 'lucide-react';

import { MaterialsPanel } from '../materials/MaterialsPanel';
import { AttendancePanel } from '../attendance/AttendancePanel';
import { AssignmentsView } from '../assignments/AssignmentsView';

export interface ClassDetailViewProps {
  studentProfile: Student;
  selectedClass: ClassSection;
  onBack: () => void;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
  onPendingUpdate: () => void;
}

export function ClassDetailView({ 
  studentProfile, 
  selectedClass, 
  onBack, 
  triggerToast,
  onPendingUpdate
}: ClassDetailViewProps) {
  const { 
    activeTab, 
    setActiveTab, 
    enrolledClasses, 
    hasPendingAssignments,
    hasOpenAttendance,
    refreshPendingState
  } = useClassDetailViewModel(studentProfile, selectedClass);

  const handlePendingUpdate = () => {
    refreshPendingState();
    onPendingUpdate();
  };

  const currentDateStr = new Date().toISOString().split('T')[0];
  const isOngoing = enrolledClasses.some(c => c.id === selectedClass.id && (!c.endDate || c.endDate >= currentDateStr));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-3xs shrink-0"
            title="Quay lại danh sách lớp"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight">
              Góc Học Tập: {selectedClass.subjectName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="font-mono font-bold text-slate-700">{selectedClass.id}</span>
              <span>•</span>
              <span>Giảng viên: <strong className="text-slate-700">{selectedClass.teacherName}</strong></span>
              <span>•</span>
              <span>Phòng: <strong className="text-slate-700">P.{selectedClass.room}</strong></span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Badge variant={isOngoing ? 'success' : 'gray'}>
            {isOngoing ? 'Học phần đang học' : 'Học phần đã kết thúc'}
          </Badge>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('materials')}
          className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${activeTab === 'materials'
            ? 'border-blue-600 text-blue-600 font-bold'
            : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
        >
          Tài liệu học tập
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'assignments'
            ? 'border-blue-600 text-blue-600 font-bold'
            : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
        >
          Bài tập trực tuyến
          {hasPendingAssignments && (
            <span className="relative flex h-2 w-2 ml-1" title="Bạn có bài tập chưa làm">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${activeTab === 'attendance'
            ? 'border-blue-600 text-blue-600 font-bold'
            : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
        >
          Điểm danh
          {hasOpenAttendance && (
            <span className="relative flex h-2 w-2 ml-1" title="Đang mở điểm danh">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'materials' && (
        <MaterialsPanel
          selectedClass={selectedClass}
          triggerToast={triggerToast}
        />
      )}
      {activeTab === 'assignments' && (
        <AssignmentsView
          studentProfile={studentProfile}
          selectedClass={selectedClass}
          triggerToast={triggerToast}
          onPendingUpdate={handlePendingUpdate}
        />
      )}
      {activeTab === 'attendance' && (
        <AttendancePanel
          selectedClass={selectedClass}
          triggerToast={triggerToast}
        />
      )}
    </div>
  );
}
