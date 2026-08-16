import React from 'react';
import { useUserListViewModel } from './useUserListViewModel';
import { Card, Table, Modal, FormInput, Badge, Pagination } from '../../../components/UI';
import { Plus, Search, Edit2, Trash2, Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { UserAdmin, UserCreationRequest, UserUpdateRequest } from '../../../models/UserAdmin';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface UserManagementProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function UserManagement({ triggerToast }: UserManagementProps) {
  const {
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    roleName,
    setRoleName,
    status,
    setStatus,
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
    handleRoleChange,
    handleSave,
    handleDelete,
    handleResetPassword
  } = useUserListViewModel();

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Tài khoản',
      accessor: (item: UserAdmin) => <span className="font-mono font-bold text-slate-800">{item.username}</span>
    },
    {
      header: 'Họ và tên',
      accessor: (item: UserAdmin) => (
        <div>
          <p className="font-medium text-slate-800">{item.fullName}</p>
          <p className="text-xs text-slate-500">{item.email}</p>
        </div>
      )
    },
    {
      header: 'Phân quyền',
      accessor: (item: UserAdmin) => {
        const roles = item.roles?.map(r => r.name) || [];
        const isTeacher = roles.includes('ROLE_TEACHER') || roles.includes('TEACHER');
        const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
        return (
          <Badge variant={isAdmin ? 'danger' : isTeacher ? 'warning' : 'primary'}>
            {isAdmin ? 'Quản trị viên' : isTeacher ? 'Giảng viên' : 'Sinh viên'}
          </Badge>
        );
      }
    },
    {
      header: 'Trạng thái',
      accessor: (item: UserAdmin) => (
        <Badge variant={item.status === 'ACTIVE' ? 'success' : 'danger'}>
          {item.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị khóa'}
        </Badge>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: UserAdmin) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleResetPassword(item, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            title="Khôi phục mật khẩu mặc định (123456)"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            title="Cập nhật thông tin"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, item.username, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            title="Xóa tài khoản"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Người Dùng</h2>
          <p className="text-xs text-slate-500">Tạo mới, phân quyền và quản lý tài khoản hệ thống</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Cấp Tài Khoản Mới
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
              placeholder="Tìm theo tên tài khoản hoặc họ tên..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
            />
          </div>

          <div className="w-full sm:w-1/4">
            <SearchableSelect
              name="roleName"
              value={roleName}
              onChange={(val) => setRoleName(val ? String(val) : undefined)}
              options={[
                { value: 'ADMIN', label: 'Quản trị viên' },
                { value: 'TEACHER', label: 'Giảng viên' },
                { value: 'STUDENT', label: 'Sinh viên' }
              ]}
              placeholder="-- Tất cả quyền --"
              allowClear
            />
          </div>

          <div className="w-full sm:w-1/4">
            <SearchableSelect
              name="status"
              value={status}
              onChange={(val) => setStatus(val ? String(val) : undefined)}
              options={[
                { value: 'ACTIVE', label: 'Đang hoạt động' },
                { value: 'INACTIVE', label: 'Bị khóa' }
              ]}
              placeholder="-- Tất cả trạng thái --"
              allowClear
            />
          </div>
        </div>
      </Card>

      <Card className="relative min-h-[300px] flex flex-col">
        {isLoading && users.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải dữ liệu tài khoản...</p>
          </div>
        ) : (
          <div className="flex-1">
            <Table data={users} columns={columns} emptyMessage="Không có tài khoản nào." />
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
        title={editingItem ? 'Cập Nhật Tài Khoản' : 'Cấp Tài Khoản Mới'}
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
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="Tên Đăng Nhập"
                name="username"
                value={(formData as UserCreationRequest).username || ''}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="VD: SV001"
                error={errors.username}
              />
              <FormInput
                label="Mật Khẩu"
                name="password"
                type="password"
                value={(formData as UserCreationRequest).password || ''}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="***"
                error={errors.password}
              />
            </div>
          )}

          <FormInput
            label="Họ và Tên"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder="VD: Nguyễn Văn A"
            error={errors.fullName}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="VD: a@gmail.com"
              error={errors.email}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Giới Tính</label>
              <SearchableSelect
                name="gender"
                value={formData.gender || 'Nam'}
                onChange={(val) => handleInputChange({ target: { name: 'gender', value: val } } as any)}
                disabled={isLoading}
                options={[
                  { value: 'Nam', label: 'Nam' },
                  { value: 'Nữ', label: 'Nữ' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phân Quyền</label>
              <SearchableSelect
                name="roles"
                value={formData.roles ? formData.roles[0] : 'STUDENT'}
                onChange={(val) => handleRoleChange({ target: { value: val } } as any)}
                disabled={isLoading}
                options={[
                  { value: 'STUDENT', label: 'Sinh viên' },
                  { value: 'TEACHER', label: 'Giảng viên' },
                  { value: 'ADMIN', label: 'Quản trị viên' }
                ]}
              />
            </div>
            
            {editingItem && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng Thái</label>
                <SearchableSelect
                  name="status"
                  value={(formData as UserUpdateRequest).status || 'ACTIVE'}
                  onChange={(val) => handleInputChange({ target: { name: 'status', value: val } } as any)}
                  disabled={isLoading}
                  options={[
                    { value: 'ACTIVE', label: 'Đang hoạt động' },
                    { value: 'INACTIVE', label: 'Khóa tài khoản' }
                  ]}
                />
              </div>
            )}
          </div>

        </div>
      </Modal>
    </div>
  );
}
