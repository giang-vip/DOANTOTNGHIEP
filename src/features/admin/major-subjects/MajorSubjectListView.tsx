import React from 'react';
import { Card, Table, Pagination, Badge, Modal } from '../../../components/UI';
import { SearchableSelect } from '../../../components/SearchableSelect';
import { Plus, Edit2, Trash2, Search, Loader2, BookOpen, ChevronLeft } from 'lucide-react';
import { useMajorSubjectListViewModel } from './useMajorSubjectListViewModel';
import { Subject } from '../../../models/Subject';

interface MajorSubjectListViewProps {
  onTabChange?: (tab: string) => void;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function MajorSubjectListView({ onTabChange, triggerToast }: MajorSubjectListViewProps) {
  const {
    subjects,
    allGlobalSubjects,
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
    handleDelete,
    setSearchParams,
    departmentIdFromUrl,
    majorIdFromUrl,
    majorName
  } = useMajorSubjectListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Môn',
      accessor: (item: Subject) => <span className="font-bold text-slate-700">{item.code}</span>
    },
    {
      header: 'Tên Môn Học',
      accessor: (item: Subject) => (
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          {item.description && <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>}
        </div>
      )
    },
    {
      header: 'Số Tín Chỉ',
      accessor: (item: Subject) => <span className="font-medium text-blue-600">{item.credits}</span>
    },
    {
      header: 'Kỳ Học',
      accessor: (item: Subject) => <span className="text-sm text-slate-800">Kỳ {item.semesterIndex || 1}</span>
    },
    {
      header: 'Loại Môn',
      accessor: (item: Subject) => {
        const labels: Record<string, string> = {
          COMPULSORY: 'Bắt buộc',
          ELECTIVE: 'Tự chọn',
          EQUIVALENT: 'Tương đương'
        };
        const types: Record<string, string> = {
          COMPULSORY: 'danger',
          ELECTIVE: 'info',
          EQUIVALENT: 'warning'
        };
        const statusType = item.type || 'COMPULSORY';
        return <Badge variant={types[statusType] as any}>{labels[statusType]}</Badge>;
      }
    },
    {
      header: 'Khoa Quản Lý',
      accessor: (item: Subject) => (
        <span className="text-sm font-medium text-slate-800">{item.departmentName || '---'}</span>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: Subject) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
            title="Sửa kỳ học / loại môn"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, item.name, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
            title="Rút môn khỏi ngành"
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
          <div className="flex flex-col gap-1 mb-2">
            <button
              onClick={() => {
                const params: Record<string, string> = {};
                if (departmentIdFromUrl) params.departmentId = departmentIdFromUrl;
                setSearchParams(params);
                if (onTabChange) onTabChange('majors');
              }}
              className="w-fit px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Quay lại chọn Ngành
            </button>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Khung Chương Trình {majorName ? `- ${majorName}` : 'Ngành'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">Xem và hiệu chỉnh các môn học sinh viên ngành này phải học</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            disabled={isLoading || !majorIdFromUrl}
            className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Thêm Môn Học Vào Ngành
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          {error}
        </div>
      )}

      <Card className="p-4 bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-indigo-900 font-medium">
            Có tổng cộng <strong className="text-indigo-700 text-base">{totalElements}</strong> môn học trong ngành này.
          </p>
        </div>
      </Card>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên môn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
      </Card>

      <Card className="relative min-h-[300px] flex flex-col">
        {isLoading && subjects.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu khung chương trình...</p>
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
        title={editingItem ? 'Sửa Thuộc Tính Môn Học' : 'Thêm Môn Học Vào Ngành'}
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
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Môn Học</label>
              <SearchableSelect
                name="subjectId"
                value={formData.subjectId || undefined}
                onChange={(val) => handleInputChange({ target: { name: 'subjectId', value: Number(val) } } as any)}
                disabled={isLoading}
                options={allGlobalSubjects.map(sub => ({ value: sub.id!, label: `${sub.code} - ${sub.name} (${sub.credits} TC)` }))}
                placeholder="-- Chọn môn học từ kho --"
                error={!!errors.subjectId}
              />
              {errors.subjectId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.subjectId}</p>}
              {editingItem && (
                <p className="mt-1.5 text-xs text-blue-600 italic">
                  * Đổi môn học sẽ thay thế môn cũ trong khung chương trình bằng môn mới này.
                </p>
              )}
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Học ở Kỳ</label>
              <SearchableSelect
                name="semesterIndex"
                value={formData.semesterIndex}
                onChange={(val) => handleInputChange({ target: { name: 'semesterIndex', value: Number(val) } } as any)}
                disabled={isLoading}
                options={Array.from({ length: 8 }).map((_, i) => ({ value: i + 1, label: `Kỳ ${i + 1}` }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Loại Môn Học</label>
              <SearchableSelect
                name="type"
                value={formData.type}
                onChange={(val) => handleInputChange({ target: { name: 'type', value: val } } as any)}
                disabled={isLoading}
                options={[
                  { value: 'COMPULSORY', label: 'Bắt buộc' },
                  { value: 'ELECTIVE', label: 'Tự chọn' },
                  { value: 'EQUIVALENT', label: 'Tương đương' }
                ]}
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
