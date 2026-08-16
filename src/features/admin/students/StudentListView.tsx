import React from 'react';
import { useStudentListViewModel } from './useStudentListViewModel';
import { Card, Table, Modal, FormInput, Badge, Pagination } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Student } from '../../../models/Student';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface StudentListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function StudentListView({ triggerToast }: StudentListViewProps) {
  const {
    students,
    majors,
    schoolClasses,
    departments,
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedMajorId,
    setSelectedMajorId,
    selectedClassId,
    setSelectedClassId,
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
  } = useStudentListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Sinh Viên',
      accessor: (item: Student) => <span className="font-mono font-bold text-slate-800">{item.studentCode}</span>
    },
    {
      header: 'Họ và tên',
      accessor: (item: Student) => (
        <div>
          <p className="font-medium text-slate-800">{item.fullName}</p>
          <p className="text-xs text-slate-500">{item.username}</p>
        </div>
      )
    },
    {
      header: 'Lớp - Ngành',
      accessor: (item: Student) => (
        <div>
          <p className="font-medium text-slate-700">{item.classCode || 'Chưa xếp lớp'}</p>
          <p className="text-xs text-slate-500">{item.majorName}</p>
        </div>
      )
    },
    {
      header: 'Giới tính',
      accessor: (item: Student) => <span className="text-sm text-slate-600">{item.gender}</span>
    },
    {
      header: 'Trạng thái',
      accessor: (item: Student) => {
        let variant: 'success' | 'danger' | 'warning' = 'success';
        let label = 'Đang học';
        if (item.status === 'SUSPENDED') { variant = 'warning'; label = 'Đình chỉ'; }
        if (item.status === 'DROPPED_OUT') { variant = 'danger'; label = 'Thôi học'; }
        if (item.status === 'GRADUATED') { variant = 'success'; label = 'Đã tốt nghiệp'; }
        return <Badge variant={variant}>{label}</Badge>;
      }
    },
    {
      header: 'Thao Tác',
      accessor: (item: Student) => (
        <div className="flex gap-2">
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hồ Sơ Sinh Viên</h2>
          <p className="text-xs text-slate-500">Quản lý thông tin hồ sơ học vụ của sinh viên</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Thêm Hồ Sơ Sinh Viên
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

      <Card className="p-4 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-1/3">
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

          <div className="w-full sm:w-1/4">
            <SearchableSelect
              name="departmentFilter"
              value={selectedDepartmentId}
              onChange={(val) => {
                setSelectedDepartmentId(val ? Number(val) : undefined);
                setSelectedMajorId(undefined);
                setSelectedClassId(undefined);
              }}
              options={departments.map(d => ({ value: d.id!, label: d.name }))}
              placeholder="-- Tất cả khoa --"
              allowClear
            />
          </div>

          <div className="w-full sm:w-1/4">
            <SearchableSelect
              name="majorFilter"
              value={selectedMajorId}
              onChange={(val) => {
                setSelectedMajorId(val ? Number(val) : undefined);
                setSelectedClassId(undefined);
              }}
              options={majors
                .filter(m => !selectedDepartmentId || m.departmentId === selectedDepartmentId)
                .map(m => ({ value: m.id!, label: m.name }))}
              placeholder="-- Tất cả ngành --"
              allowClear
            />
          </div>

          <div className="w-full sm:w-1/4">
            <SearchableSelect
              name="classFilter"
              value={selectedClassId}
              onChange={(val) => setSelectedClassId(val ? Number(val) : undefined)}
              options={schoolClasses
                .filter(c => !selectedMajorId || c.majorId === selectedMajorId)
                .map(c => ({ value: c.id!, label: c.code }))}
              placeholder="-- Tất cả lớp --"
              allowClear
            />
          </div>
        </div>
      </Card>

      <Card className="relative min-h-[300px] flex flex-col">
        {isLoading && students.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu sinh viên...</p>
          </div>
        ) : (
          <div className="flex-1">
            <Table data={students} columns={columns} emptyMessage="Không có sinh viên nào." />
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
        title={editingItem ? 'Cập Nhật Hồ Sơ Sinh Viên' : 'Thêm Hồ Sơ Sinh Viên Mới'}
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
              label="Mã Sinh Viên"
              name="studentCode"
              value={formData.studentCode}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: 20020001"
              error={errors.studentCode}
            />
            
            <FormInput
              label="Họ và Tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={isLoading || (!editingItem && formData.userId !== 0)} 
              placeholder="VD: Nguyễn Văn A"
              error={errors.fullName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày Sinh"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ''}
              onChange={handleInputChange}
              disabled={isLoading}
            />

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

          <FormInput
            label="Địa Chỉ"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="VD: Hà Nội"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ngành Học</label>
              <SearchableSelect
                name="majorId"
                value={formData.majorId}
                onChange={(val) => handleSelectChange('majorId', val)}
                disabled={isLoading}
                options={majors.map(mj => ({ value: mj.id!, label: mj.name }))}
                placeholder="-- Chọn ngành --"
                error={!!errors.majorId}
              />
              {errors.majorId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.majorId}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Lớp Hành Chính</label>
              <SearchableSelect
                name="classId"
                value={formData.classId || 0}
                onChange={(val) => handleSelectChange('classId', val)}
                disabled={isLoading}
                options={[{ value: 0, label: '-- Chưa xếp lớp --' }, ...schoolClasses.map(sc => ({ value: sc.id!, label: sc.name }))]}
                placeholder="-- Chọn lớp --"
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
                  { value: 'ACTIVE', label: 'Đang học' },
                  { value: 'INACTIVE', label: 'Đình chỉ' },
                  { value: 'DROPPED', label: 'Thôi học' },
                  { value: 'GRADUATED', label: 'Đã tốt nghiệp' }
                ]}
              />
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
}
