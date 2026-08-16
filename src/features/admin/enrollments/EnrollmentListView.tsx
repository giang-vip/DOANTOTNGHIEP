import React from 'react';
import { useEnrollmentListViewModel } from './useEnrollmentListViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Enrollment } from '../../../models/Enrollment';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface EnrollmentListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function EnrollmentListView({ triggerToast }: EnrollmentListViewProps) {
  const {
    enrollments,
    students,
    classSections,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    handleDelete
  } = useEnrollmentListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Sinh Viên',
      accessor: (item: Enrollment) => (
        <div>
          <p className="font-medium text-slate-800">{item.studentName}</p>
          <p className="text-xs text-slate-500 font-mono">{item.studentCode}</p>
        </div>
      )
    },
    {
      header: 'Lớp Học Phần',
      accessor: (item: Enrollment) => <span className="font-semibold text-slate-700">{item.sectionCode}</span>
    },
    {
      header: 'Ngày Đăng Ký',
      accessor: (item: Enrollment) => (
        <span className="text-sm text-slate-600">
          {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString('vi-VN') : 'N/A'}
        </span>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: (item: Enrollment) => {
        let variant: 'success' | 'danger' | 'warning' | 'info' = 'success';
        let label = 'Đã đăng ký';
        if (item.status === 'DROPPED') { variant = 'danger'; label = 'Đã rút học phần'; }
        if (item.status === 'COMPLETED') { variant = 'info'; label = 'Đã hoàn thành'; }
        return <Badge variant={variant}>{label}</Badge>;
      }
    },
    {
      header: 'Ghi chú',
      accessor: (item: Enrollment) => <span className="text-sm text-slate-500">{item.note || '-'}</span>
    },
    {
      header: 'Thao Tác',
      accessor: (item: Enrollment) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Đăng Ký Học Phần</h2>
          <p className="text-xs text-slate-500">Quản lý danh sách sinh viên đăng ký lớp học phần</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Đăng Ký Mới
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-700">Lỗi tải dữ liệu</p>
            <p className="mt-1 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã sinh viên, họ tên..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
      </Card>

      <Card className="relative min-h-[300px]">
        {isLoading && enrollments.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu đăng ký...</p>
          </div>
        ) : (
          <Table data={enrollments} columns={columns} emptyMessage="Chưa có dữ liệu đăng ký học phần." />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Cập Nhật Đăng Ký' : 'Đăng Ký Học Phần Cho Sinh Viên'}
        footer={
          <>
            <button
              onClick={handleSaveAction}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu dữ liệu
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Sinh Viên</label>
            <SearchableSelect
              name="studentId"
              value={formData.studentId}
              onChange={(val) => handleInputChange({ target: { name: 'studentId', value: Number(val) } } as any)}
              disabled={isLoading || !!editingItem}
              options={students.map(s => ({ value: s.id!, label: `${s.studentCode} - ${s.fullName}` }))}
              placeholder="-- Chọn sinh viên --"
              error={!!errors.studentId}
            />
            {errors.studentId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.studentId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Lớp Học Phần</label>
            <SearchableSelect
              name="classSectionId"
              value={formData.classSectionId}
              onChange={(val) => handleInputChange({ target: { name: 'classSectionId', value: Number(val) } } as any)}
              disabled={isLoading || !!editingItem}
              options={classSections.map(cs => ({ value: cs.id!, label: `${cs.sectionCode} - ${cs.subjectName}` }))}
              placeholder="-- Chọn lớp học phần --"
              error={!!errors.classSectionId}
            />
            {errors.classSectionId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.classSectionId}</p>}
          </div>

          {editingItem && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng Thái</label>
              <SearchableSelect
                name="status"
                value={formData.status || 'ENROLLED'}
                onChange={(val) => handleInputChange({ target: { name: 'status', value: val } } as any)}
                disabled={isLoading}
                options={[
                  { value: 'ENROLLED', label: 'Đã đăng ký' },
                  { value: 'DROPPED', label: 'Rút học phần' },
                  { value: 'COMPLETED', label: 'Đã hoàn thành' }
                ]}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ghi Chú</label>
            <textarea
              name="note"
              value={formData.note || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white resize-none"
              placeholder="Nhập ghi chú (nếu có)..."
            />
          </div>

        </div>
      </Modal>
    </div>
  );
}
