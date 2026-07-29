import React from 'react';
import { useMajorListViewModel } from '../majors/useMajorListViewModel';
import { Card, Table, Modal, FormInput } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface MajorListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function MajorListView({ triggerToast }: MajorListViewProps) {
  const {
    majors,
    departments,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingMajor,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    handleDelete
  } = useMajorListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    { header: 'Mã Ngành', accessor: (m: any) => <span className="font-mono font-bold text-slate-800">{m.id}</span> },
    { header: 'Tên Ngành', accessor: (m: any) => <span className="font-medium text-slate-800">{m.name}</span> },
    { header: 'Khoa trực thuộc', accessor: (m: any) => <span className="text-xs text-slate-600">{departments.find(d => d.id === m.departmentId)?.name || ''}</span> },
    { header: 'Mô tả', accessor: (m: any) => <p className="text-xs text-slate-500 max-w-sm truncate">{m.description}</p> },
    {
      header: 'Thao Tác',
      accessor: (m: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(m)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(m.id, m.name, (msg) => triggerToast(msg, 'success'))}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Ngành học</h2>
          <p className="text-xs text-slate-500">Quản lý các ngành đào tạo thuộc từng khoa trong trường</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> + Thêm Ngành Mới
        </button>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã ngành hoặc tên ngành..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
      </Card>

      <Card>
        <Table data={majors} columns={columns} emptyMessage="Chưa có ngành nào. Hãy thêm ngành mới." />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMajor ? 'Cập Nhật Ngành' : 'Thêm Ngành Mới'}
        footer={
          <>
            <button
              onClick={handleSaveAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lưu thông tin
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Mã Ngành"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            disabled={!!editingMajor}
            placeholder="Ví dụ: KTPM, CNTT..."
            error={errors.id}
          />

          <FormInput
            label="Tên Ngành"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ví dụ: Kỹ thuật phần mềm..."
            error={errors.name}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa trực thuộc</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 ${
                errors.departmentId ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
              }`}
            >
              <option value="">-- Chọn khoa --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.departmentId}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Mô tả</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Mô tả ngành (tùy chọn)..."
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
