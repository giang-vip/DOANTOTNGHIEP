import React from 'react';
import { Student } from '../../../models';
import { useAdminStudentDetailViewModel } from './useAdminStudentDetailViewModel';
import { ChevronLeft, Info, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/UI';
import { AcademicProgressView } from '../../student/academic-progress/AcademicProgressView';

interface AdminStudentDetailViewProps {
  student: Student;
  onBack: () => void;
}

export function AdminStudentDetailView({ student: initialStudent, onBack }: AdminStudentDetailViewProps) {
  const { activeTab, setActiveTab, student } = useAdminStudentDetailViewModel(initialStudent);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <button
          onClick={onBack}
          className="w-fit px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm mb-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Quay lại danh sách sinh viên
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Hồ sơ sinh viên: {student.fullName}
        </h2>
        <p className="text-sm text-slate-500">Mã SV: {student.studentCode} | Lớp: {student.schoolClass?.name || 'Chưa xếp lớp'}</p>
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
          onClick={() => setActiveTab('academic-progress')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'academic-progress'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Theo dõi học tập
        </button>
      </div>

      {activeTab === 'info' && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Thông tin chi tiết</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Mã Sinh viên:</span> {student.studentCode}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Họ và tên:</span> {student.fullName}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Ngày sinh:</span> {student.dateOfBirth}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Giới tính:</span> {student.gender === 'M' ? 'Nam' : student.gender === 'F' ? 'Nữ' : student.gender}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Lớp hành chính:</span> {student.schoolClass?.name || student.classCode}</p>
            </div>
            <div>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Tên đăng nhập:</span> {student.username || student.studentCode}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Email:</span> {student.email || 'Chưa cập nhật'}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Số điện thoại:</span> {student.phone || 'Chưa cập nhật'}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Ngành học:</span> {student.schoolClass?.majorName || student.majorName}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Khoa:</span> {student.schoolClass?.departmentName}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Trạng thái:</span> {student.status}</p>
              <p className="mb-2"><span className="font-semibold w-32 inline-block">Niên khóa:</span> {student.schoolClass?.courseYear}</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'academic-progress' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <AcademicProgressView studentProfile={student} isAdmin={true} />
        </div>
      )}
    </div>
  );
}
