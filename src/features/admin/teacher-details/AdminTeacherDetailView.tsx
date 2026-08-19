import React from 'react';
import { Teacher } from '../../../models/Teacher';
import { useAdminTeacherDetailViewModel } from './useAdminTeacherDetailViewModel';
import { ChevronLeft, GraduationCap, Building2, User, BookOpen, Loader2 } from 'lucide-react';
import { Card, Table, Pagination, Badge } from '../../../components/UI';
import { AdminClassDetailView } from '../class-details/AdminClassDetailView';

interface AdminTeacherDetailViewProps {
  teacher: Teacher;
  onBack: () => void;
}

export function AdminTeacherDetailView({ teacher: initialTeacher, onBack }: AdminTeacherDetailViewProps) {
  const {
    teacher,
    classes,
    isLoadingClasses,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    selectedClass,
    setSelectedClass
  } = useAdminTeacherDetailViewModel(initialTeacher);

  if (selectedClass) {
    return (
      <AdminClassDetailView 
        classSection={selectedClass} 
        onBack={() => setSelectedClass(null)}
        triggerToast={(msg, type) => {
          // Toast handling can be added here if needed, or bubbled up
          alert(`${type.toUpperCase()}: ${msg}`);
        }}
      />
    );
  }

  const classColumns = [
    {
      header: 'Mã lớp',
      accessor: (item: any) => <span className="font-mono font-medium text-blue-600">{item.sectionCode}</span>
    },
    {
      header: 'Môn học',
      accessor: (item: any) => (
        <div>
          <p className="font-medium text-slate-800">{item.subjectName}</p>
          <p className="text-xs text-slate-500">{item.subjectCode}</p>
        </div>
      )
    },
    {
      header: 'Sĩ số',
      accessor: (item: any) => <span className="text-sm text-slate-600 font-medium">{item.enrolledCount || 0} / {item.capacity || 0}</span>
    },
    {
      header: 'Trạng thái',
      accessor: (item: any) => {
        let variant: 'success' | 'warning' | 'gray' | 'danger' = 'gray';
        let text = item.status;
        if (item.status === 'UPCOMING') { variant = 'warning'; text = 'Sắp mở'; }
        if (item.status === 'ONGOING') { variant = 'success'; text = 'Đang diễn ra'; }
        if (item.status === 'COMPLETED') { variant = 'gray'; text = 'Đã kết thúc'; }
        if (item.status === 'CANCELLED') { variant = 'danger'; text = 'Đã hủy'; }
        return <Badge variant={variant}>{text}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <button
          onClick={onBack}
          className="w-fit px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm mb-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Quay lại danh sách giảng viên
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Hồ sơ Giảng viên: {teacher.fullName}
        </h2>
        <p className="text-sm text-slate-500">Mã GV: {teacher.teacherCode}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thông tin cá nhân */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-5 border-t-4 border-t-blue-500 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800">Thông tin cá nhân</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Họ và tên</span>
                <span className="font-medium text-slate-800">{teacher.fullName}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Mã Giảng viên</span>
                <span className="font-medium text-slate-800">{teacher.teacherCode}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Tên đăng nhập</span>
                <span className="font-medium text-slate-800">{teacher.username || teacher.teacherCode}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Email</span>
                <span className="font-medium text-slate-800">{teacher.email || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Số điện thoại</span>
                <span className="font-medium text-slate-800">{teacher.phone || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-t-4 border-t-emerald-500 shadow-sm">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800">Đơn vị công tác</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Khoa trực thuộc</span>
                <span className="font-medium text-slate-800">{teacher.departmentName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs mb-1">Trình độ</span>
                <span className="font-medium text-slate-800">{teacher.title || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Lớp giảng dạy */}
        <div className="md:col-span-2">
          <Card className="p-5 h-full flex flex-col shadow-sm border-t-4 border-t-indigo-500">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800">Các Lớp học phần được phân công</h3>
            </div>
            
            {isLoadingClasses ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                {classes.length > 0 ? (
                  <>
                    <Table 
                      columns={classColumns}
                      data={classes}
                      onRowClick={(item) => setSelectedClass(item)}
                    />
                    <div className="mt-auto pt-4">
                      <Pagination 
                        currentPage={page}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        onPageChange={setPage}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <BookOpen className="h-12 w-12 text-slate-300 mb-3" />
                    <p>Giảng viên này chưa được phân công lớp nào.</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
