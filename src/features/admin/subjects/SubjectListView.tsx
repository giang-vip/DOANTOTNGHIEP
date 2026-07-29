import React from 'react';
import { useSubjectListViewModel } from './useSubjectListViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, BookOpen } from 'lucide-react';

interface SubjectListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function SubjectListView({ triggerToast }: SubjectListViewProps) {
  const {
    subjects,
    departments,
    majors,
    searchTerm,
    setSearchTerm,
    selectedMajorFilter,
    setSelectedMajorFilter,
    isModalOpen,
    setIsModalOpen,
    editingSubject,
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
      accessor: (sub: any) => <span className="font-mono font-bold text-slate-800">{sub.id}</span>
    },
    {
      header: 'Tên Môn Học',
      accessor: (sub: any) => (
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded bg-slate-50 flex items-center justify-center text-slate-400">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-slate-800">{sub.name}</span>
        </div>
      )
    },
    {
      header: 'Số Tín Chỉ',
      accessor: (sub: any) => <Badge variant="info">{sub.credits} tín chỉ</Badge>
    },
    {
      header: 'Ngành áp dụng',
      accessor: (sub: any) => {
        const majorsList: string[] = sub.majorIds || [];
        if (majorsList.length === 0) return <span className="text-xs text-slate-500">—</span>;
        const display = majorsList.slice(0, 2).map((m: string) => {
          const maj = majors.find((x: any) => x.id === m);
          return maj ? (
            <span key={m} className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium mr-1">
              {maj.id}
            </span>
          ) : (
            <span key={m} className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-xs font-medium mr-1">{m}</span>
          );
        });
        const extra = majorsList.length > 2 ? <span className="text-xs text-slate-500">+{majorsList.length - 2}</span> : null;
        return <div className="flex items-center">{display}{extra}</div>;
      }
    },
    {
      header: 'Thao Tác',
      accessor: (sub: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(sub)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(sub.id, sub.name, (msg) => triggerToast(msg, 'success'))}
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
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Môn Học</h2>
          <p className="text-xs text-slate-500">Xem và sửa đổi chương trình môn học đào tạo của trường</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Thêm Môn Học Mới
        </button>
      </div>

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
            placeholder="Tìm theo mã hoặc tên môn học..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedMajorFilter}
            onChange={(e) => setSelectedMajorFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả ngành</option>
            {majors.map((maj) => (
              <option key={maj.id} value={maj.id}>
                {maj.name} — {departments.find(d => d.id === maj.departmentId)?.name || ''}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table Data */}
      <Card>
        <Table data={subjects} columns={columns} emptyMessage="Không tìm thấy môn học nào phù hợp." />
      </Card>

      {/* Save Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Cập Nhật Môn Học' : 'Thêm Môn Học Mới'}
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
            label="Mã Môn Học"
            name="id"
            value={formData.id}
            onChange={handleInputChange}
            disabled={!!editingSubject}
            placeholder="Ví dụ: INT1001, MAT1102..."
            error={errors.id}
          />

          <FormInput
            label="Tên Môn Học"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ví dụ: Lập trình hướng đối tượng..."
            error={errors.name}
          />

          <FormInput
            label="Số Tín Chỉ"
            name="credits"
            type="number"
            value={formData.credits}
            onChange={handleInputChange}
            min={1}
            max={10}
            error={errors.credits}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ngành áp dụng</label>
            <select
              name="majorIds"
              multiple
              value={formData.majorIds || []}
              onChange={handleInputChange}
              className={`w-full h-32 px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 ${
                (errors as any).majorIds ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
              }`}>
              {majors.map((maj) => (
                <option key={maj.id} value={maj.id}>
                  {maj.name} — {departments.find(d => d.id === maj.departmentId)?.name || ''}
                </option>
              ))}
            </select>
            {(errors as any).majorIds && <p className="mt-1 text-xs text-rose-600 font-medium">{(errors as any).majorIds}</p>}
          </div>
        </div>
      </Modal>
    </div>
  );
}
