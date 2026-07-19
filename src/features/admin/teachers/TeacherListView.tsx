import React from 'react';
import { useTeacherListViewModel } from './useTeacherListViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { Plus, Search, Edit2, ShieldAlert, Key, Check, AlertCircle, Trash2 } from 'lucide-react';

interface TeacherListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function TeacherListView({ triggerToast }: TeacherListViewProps) {
  const {
    teachers,
    departments,
    searchTerm,
    setSearchTerm,
    selectedDeptFilter,
    setSelectedDeptFilter,
    isModalOpen,
    setIsModalOpen,
    editingTeacher,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    deleteTeacherAccount,
    getTeacherPassword,
    resetTeacherPassword
  } = useTeacherListViewModel();

  const getTeacherStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang làm';
      case 'on_leave':
      case 'suspended': return 'Tạm nghỉ';
      default: return 'Không xác định';
    }
  };

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'Mã Giảng Viên',
      accessor: (t: any) => (
        <div>
          <span className="font-mono font-bold text-slate-800">{t.id}</span>
          <p className="text-[10px] text-slate-400 font-mono">TK: {t.id.toLowerCase()}</p>
        </div>
      )
    },
    {
      header: 'Họ và Tên',
      accessor: (t: any) => <span className="font-semibold text-slate-800">{t.name}</span>
    },
    {
      header: 'Mật Khẩu Hiện Tại',
      accessor: (t: any) => (
        <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-fit">
          <Key className="h-3 w-3 text-slate-400" />
          <span className="text-slate-600 font-medium">{getTeacherPassword(t.id)}</span>
        </div>
      )
    },
    {
      header: 'Khoa',
      accessor: (t: any) => <span className="text-xs font-semibold text-slate-600">{t.department}</span>
    },
    {
      header: 'Liên Hệ',
      accessor: (t: any) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>{t.email}</p>
          <p>{t.phone}</p>
        </div>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: (t: any) => {
        const variant = t.status === 'active' ? 'success' : 'warning';
        return <Badge variant={variant}>{getTeacherStatusLabel(t.status)}</Badge>;
      }
    },
    {
      header: 'Thao Tác',
      accessor: (t: any) => (
        <div className="flex gap-1.5 items-center justify-end">
          <button
            onClick={() => openEditModal(t)}
            title="Sửa thông tin"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteTeacherAccount(t.id, (msg) => triggerToast(msg, 'success'))}
            title="Xóa / khóa tài khoản"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => resetTeacherPassword(t.id, (msg) => triggerToast(msg, 'success'))}
            title="Khôi phục mật khẩu (123)"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
          >
            <ShieldAlert className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Giảng Viên</h2>
          <p className="text-xs text-slate-500">Thêm mới, gán khoa, khóa tài khoản hoặc khôi phục mật khẩu giảng viên</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Thêm Giảng Viên
        </button>
      </div>

      {/* Controller */}
      <Card className="p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã, tên, email, sđt..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả khoa</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table Data */}
      <Card>
        <Table data={teachers} columns={columns} emptyMessage="Không tìm thấy giảng viên phù hợp." />
      </Card>

      {/* Save Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Cập Nhật Giảng Viên' : 'Thêm Giảng Viên Mới'}
        footer={
          <>
            <button
              onClick={handleSaveAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lưu giảng viên
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Mã Giảng Viên (MSGV)"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              disabled={!!editingTeacher}
              placeholder="Ví dụ: GV004..."
              error={errors.id}
            />

            <FormInput
              label="Mật Khẩu Tài Khoản"
              name="password"
              type="text"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Ví dụ: 123..."
              error={errors.password}
            />
          </div>

          <FormInput
            label="Họ và Tên Giảng Viên"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ví dụ: Nguyễn Văn Hải..."
            error={errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Địa chỉ Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Ví dụ: hai.nv@hungnhan.edu.vn..."
              error={errors.email}
            />

            <FormInput
              label="Số Điện Thoại"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ví dụ: 0988..."
              error={errors.phone}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa Phân Bổ</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 ${
                errors.department ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
              }`}
            >
              <option value="">-- Chọn Khoa --</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.department}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng Thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
            >
              <option value="active">Đang làm</option>
              <option value="on_leave">Tạm nghỉ</option>
            </select>
          </div>

          {editingTeacher && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Thay đổi mật khẩu ở trên sẽ trực tiếp ghi đè mật khẩu đăng nhập hiện tại của tài khoản giảng viên này.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
