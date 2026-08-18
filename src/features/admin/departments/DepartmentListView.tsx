import React from 'react';
import { useDepartmentListViewModel } from './useDepartmentListViewModel';
import { Card, Table, Modal, FormInput } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { Department } from '../../../models/Department';

interface DepartmentListViewProps {
  onTabChange?: (tab: string) => void;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function DepartmentListView({ onTabChange, triggerToast }: DepartmentListViewProps) {
  const {
    departments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingDept,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    handleDelete,
    setSearchParams
  } = useDepartmentListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Khoa',
      accessor: (dept: Department) => <span className="font-mono font-bold text-slate-800">{dept.code}</span>
    },
    {
      header: 'Tên Khoa',
      accessor: (dept: Department) => <span className="font-medium text-slate-800">{dept.name}</span>
    },
    {
      header: 'Mô Tả',
      accessor: (dept: Department) => <p className="text-xs text-slate-500 max-w-sm truncate">{dept.description}</p>
    },
    {
      header: 'Thao Tác',
      accessor: (dept: Department) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              if (onTabChange) {
                setSearchParams({ departmentId: dept.id!.toString() });
                onTabChange('majors');
              }
            }}
            title="Xem Ngành Học"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            <BookOpen className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(dept)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(dept.id!, dept.name, (msg) => triggerToast(msg, 'success'))}
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Khoa Viện</h2>
          <p className="text-xs text-slate-500">Xem và hiệu chỉnh các khoa trực thuộc trường đại học Hưng Nhân</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Thêm Khoa Mới
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

      {/* Control bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã hoặc tên..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
      </Card>

      {/* Data Table */}
      <Card className="relative min-h-[300px]">
        {isLoading && departments.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu khoa...</p>
          </div>
        ) : (
          <Table data={departments} columns={columns} emptyMessage="Không có khoa nào khớp với tìm kiếm." />
        )}
      </Card>

      {/* Save Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Cập Nhật Khoa' : 'Thêm Khoa Mới'}
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
        <div className="space-y-4">
          <FormInput
            label="Mã Khoa"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            disabled={!!editingDept || isLoading}
            placeholder="Ví dụ: CNTT, KT, NN..."
            error={errors.code}
          />

          <FormInput
            label="Tên Khoa"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="Ví dụ: Công nghệ thông tin..."
            error={errors.name}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mô tả (Tuỳ chọn)</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              placeholder="Nhập mô tả tóm tắt về khoa..."
              className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white ${
                errors.description ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
              }`}
            />
            {errors.description && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.description}</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
