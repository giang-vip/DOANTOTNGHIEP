import React from 'react';
import { useTeacherListViewModel } from './useTeacherListViewModel';
import { Card, Table, Modal, FormInput, Badge, Pagination } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Teacher } from '../../../models/Teacher';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface TeacherListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function TeacherListView({ triggerToast }: TeacherListViewProps) {
  const {
    teachers,
    departments,
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedDepartmentId,
    setSelectedDepartmentId,
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
    handleSelectChange,
    handleSave,
    handleDelete
  } = useTeacherListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Giảng Viên',
      accessor: (item: Teacher) => <span className="font-mono font-bold text-slate-800">{item.teacherCode}</span>
    },
    {
      header: 'Họ và tên',
      accessor: (item: Teacher) => (
        <div>
          <p className="font-medium text-slate-800">{item.title ? `${item.title} ` : ''}{item.fullName}</p>
          <p className="text-xs text-slate-500">{item.username}</p>
        </div>
      )
    },
    {
      header: 'Khoa',
      accessor: (item: Teacher) => <span className="text-sm text-slate-600">{item.departmentName}</span>
    },
    {
      header: 'Giới tính',
      accessor: (item: Teacher) => <span className="text-sm text-slate-600">{item.gender}</span>
    },
    {
      header: 'Trạng thái',
      accessor: (item: Teacher) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>
          {item.status === 'ACTIVE' ? 'Đang công tác' : 'Nghỉ việc'}
        </Badge>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: Teacher) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, item.fullName, (msg) => triggerToast(msg, 'success'))}
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hồ Sơ Giảng Viên</h2>
          <p className="text-xs text-slate-500">Quản lý thông tin hồ sơ và phòng ban của giảng viên</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Thêm Hồ Sơ Giảng Viên
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
            placeholder="Tìm theo mã giảng viên, họ tên..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>
        <div className="w-full sm:max-w-xs">
          <SearchableSelect
            name="departmentFilter"
            value={selectedDepartmentId}
            onChange={(val) => setSelectedDepartmentId(val ? Number(val) : undefined)}
            disabled={isLoading}
            options={departments.map(d => ({ value: d.id!, label: d.name }))}
            placeholder="-- Tất cả khoa --"
            allowClear
          />
        </div>
      </Card>

      <Card className="relative min-h-[300px] flex flex-col">
        {isLoading && teachers.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu giảng viên...</p>
          </div>
        ) : (
          <div className="flex-1">
            <Table data={teachers} columns={columns} emptyMessage="Không có giảng viên nào." />
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
        title={editingItem ? 'Cập Nhật Hồ Sơ Giảng Viên' : 'Thêm Hồ Sơ Giảng Viên Mới'}
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
          
          {!editingItem && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Tài Khoản Liên Kết</label>
              <SearchableSelect
                name="userId"
                value={formData.userId}
                onChange={(val) => handleSelectChange('userId', val)}
                disabled={isLoading}
                options={users.map(u => ({ value: u.id!, label: `${u.fullName} (${u.username})` }))}
                placeholder="-- Chọn tài khoản người dùng --"
                error={!!errors.userId}
              />
              {errors.userId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.userId}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Mã Giảng Viên"
              name="teacherCode"
              value={formData.teacherCode}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: GV001"
              error={errors.teacherCode}
            />
            
            <FormInput
              label="Học Hàm / Học Vị"
              name="title"
              value={formData.title || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: Thạc sĩ"
            />
          </div>

          <FormInput
            label="Họ và Tên"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={isLoading || (!editingItem && formData.userId !== 0)} 
            placeholder="VD: Nguyễn Văn A"
            error={errors.fullName}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa Quản Lý</label>
              <SearchableSelect
                name="departmentId"
                value={formData.departmentId}
                onChange={(val) => handleSelectChange('departmentId', val)}
                disabled={isLoading}
                options={departments.map(dept => ({ value: dept.id!, label: dept.name }))}
                placeholder="-- Chọn khoa --"
                error={!!errors.departmentId}
              />
              {errors.departmentId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.departmentId}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Giới Tính</label>
              <SearchableSelect
                name="gender"
                value={formData.gender || 'Nam'}
                onChange={(val) => handleInputChange({ target: { name: 'gender', value: val } } as any)}
                disabled={isLoading || (!editingItem && formData.userId !== 0)}
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nữ', label: 'Nữ' }
                ]}
              />
            </div>
          </div>
          
          {editingItem && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng Thái</label>
              <SearchableSelect
                name="status"
                value={formData.status || 'ACTIVE'}
                onChange={(val) => handleInputChange({ target: { name: 'status', value: val } } as any)}
                disabled={isLoading}
                options={[
                  { value: 'ACTIVE', label: 'Đang công tác' },
                  { value: 'INACTIVE', label: 'Nghỉ việc' }
                ]}
              />
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
}
