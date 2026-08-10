import React from 'react';
import { useSubjectListViewModel } from './useSubjectListViewModel';
import { Card, Table, Modal, FormInput, Pagination } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Subject } from '../../../models/admin/Subject';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface SubjectListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function SubjectListView({ triggerToast }: SubjectListViewProps) {
  const {
    subjects,
    departments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    totalElements,
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
  } = useSubjectListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Môn Học',
      accessor: (item: Subject) => <span className="font-mono font-bold text-slate-800">{item.code}</span>
    },
    {
      header: 'Tên Môn Học',
      accessor: (item: Subject) => <span className="font-medium text-slate-800">{item.name}</span>
    },
    {
      header: 'Số Tín Chỉ',
      accessor: (item: Subject) => <span className="font-medium text-blue-600">{item.credits}</span>
    },
    {
      header: 'Khoa Quản Lý',
      accessor: (item: Subject) => <span className="text-sm text-slate-600">{item.departmentName}</span>
    },
    {
      header: 'Thao Tác',
      accessor: (item: Subject) => (
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Môn Học</h2>
          <p className="text-xs text-slate-500">Xem và hiệu chỉnh danh mục các môn học</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Thêm Môn Học
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
            disabled={isLoading}
            placeholder="Tìm theo mã hoặc tên môn học..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
      </Card>

      <Card className="relative min-h-[300px] flex flex-col">
        {isLoading && subjects.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu môn học...</p>
          </div>
        ) : (
          <div className="flex-1">
            <Table data={subjects} columns={columns} emptyMessage="Không có môn học nào." />
          </div>
        )}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          pageSize={pageSize}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Cập Nhật Môn Học' : 'Thêm Môn Học Mới'}
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
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Mã Môn Học"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: INT1001"
              error={errors.code}
            />
            <FormInput
              label="Số Tín Chỉ"
              name="credits"
              type="number"
              value={formData.credits}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.credits}
            />
          </div>

          <FormInput
            label="Tên Môn Học"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="VD: Cấu trúc dữ liệu và giải thuật"
            error={errors.name}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa Quản Lý</label>
            <SearchableSelect
              name="departmentId"
              value={formData.departmentId}
              onChange={(val) => handleInputChange({ target: { name: 'departmentId', value: Number(val) } } as any)}
              disabled={isLoading}
              options={departments.map(dept => ({ value: dept.id!, label: dept.name }))}
              placeholder="-- Chọn khoa --"
              error={!!errors.departmentId}
            />
            {errors.departmentId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.departmentId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mô Tả (Tùy chọn)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isLoading}
              rows={3}
              placeholder="Nhập mô tả về môn học..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
