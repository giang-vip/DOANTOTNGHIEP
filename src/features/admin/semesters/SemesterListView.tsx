import React from 'react';
import { useSemesterListViewModel } from './useSemesterListViewModel';
import { Card, Table, Modal, FormInput } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Semester } from '../../../models/Semester';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface SemesterListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function SemesterListView({ triggerToast }: SemesterListViewProps) {
  const {
    semesters,
    academicYears,
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
  } = useSemesterListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Năm Học',
      accessor: (item: Semester) => <span className="font-medium text-slate-800">{item.academicYearCode}</span>
    },
    {
      header: 'Mã Học Kỳ',
      accessor: (item: Semester) => <span className="font-mono font-bold text-slate-800">{item.code}</span>
    },
    {
      header: 'Tên Học Kỳ',
      accessor: (item: Semester) => <span className="font-medium text-slate-800">{item.name}</span>
    },
    {
      header: 'Thời gian',
      accessor: (item: Semester) => <span className="text-sm text-slate-600">{item.startDate} đến {item.endDate}</span>
    },
    {
      header: 'Trạng thái',
      accessor: (item: Semester) => (
        item.isCurrent ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Hiện tại</span> : <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">Không</span>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: Semester) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, item.name, (msg) => triggerToast(msg, 'success'))}
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Học Kỳ</h2>
          <p className="text-xs text-slate-500">Xem và hiệu chỉnh các học kỳ trong năm học</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Thêm Học Kỳ Mới
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
            placeholder="Tìm theo mã hoặc tên..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
      </Card>

      <Card className="relative min-h-[300px]">
        {isLoading && semesters.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu học kỳ...</p>
          </div>
        ) : (
          <Table data={semesters} columns={columns} emptyMessage="Không có học kỳ nào." />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Cập Nhật Học Kỳ' : 'Thêm Học Kỳ Mới'}
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
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Năm học</label>
            <SearchableSelect
              name="academicYearId"
              value={formData.academicYearId}
              onChange={(val) => handleInputChange({ target: { name: 'academicYearId', value: Number(val) } } as any)}
              disabled={isLoading}
              options={academicYears.map(ay => ({ value: ay.id!, label: ay.code }))}
              placeholder="-- Chọn năm học --"
              error={!!errors.academicYearId}
            />
            {errors.academicYearId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.academicYearId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Mã Học Kỳ"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Ví dụ: HK1, HK2..."
              error={errors.code}
            />
            <FormInput
              label="Tên Học Kỳ"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Ví dụ: Học kỳ 1..."
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày bắt đầu"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.startDate}
            />
            <FormInput
              label="Ngày kết thúc"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.endDate}
            />
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="isCurrentSemester"
              name="isCurrent"
              checked={formData.isCurrent}
              onChange={handleInputChange}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="isCurrentSemester" className="text-sm font-medium text-slate-700">
              Đặt làm học kỳ hiện tại
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
