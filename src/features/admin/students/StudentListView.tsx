import React from 'react';
import { useStudentListViewModel } from './useStudentListViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { Plus, Search, Edit2, ShieldAlert, Key, AlertCircle, Trash2 } from 'lucide-react';

interface StudentListViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function StudentListView({ triggerToast }: StudentListViewProps) {
  const {
    students,
    classCodes,
    departments,
    majors,
    searchTerm,
    setSearchTerm,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedMajorFilter,
    setSelectedMajorFilter,
    selectedClassFilter,
    setSelectedClassFilter,
    isModalOpen,
    setIsModalOpen,
    editingStudent,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    deleteStudentAccount,
    getStudentPassword,
    resetStudentPassword
  } = useStudentListViewModel();

  const getStudentStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Đang học';
      case 'on_leave':
      case 'suspended': return 'Tạm nghỉ';
      case 'dropped_out': return 'Thôi học';
      case 'graduated': return 'Đã tốt nghiệp';
      default: return 'Không xác định';
    }
  };

  const handleSaveAction = () => {
    handleSave((msg) => triggerToast(msg, 'success'));
  };

  const columns = [
    {
      header: 'MSSV',
      accessor: (s: any) => (
        <div>
          <span className="font-mono font-bold text-slate-800">{s.id}</span>
          <p className="text-[10px] text-slate-400 font-mono">TK: {s.id.toLowerCase()}</p>
        </div>
      )
    },
    {
      header: 'Họ và Tên',
      accessor: (s: any) => <span className="font-semibold text-slate-800">{s.name}</span>
    },
    {
      header: 'Khoa',
      accessor: (s: any) => {
        const maj = majors?.find((m: any) => m.id === s.majorId);
        const deptName = maj ? (departments?.find((d: any) => d.id === maj.departmentId)?.name ?? 'Chưa xác định') : 'Chưa xác định';
        return <span className="text-xs text-slate-600">{deptName}</span>;
      }
    },
    {
      header: 'Ngành',
      accessor: (s: any) => {
        const maj = majors?.find((m: any) => m.id === s.majorId);
        return maj ? <span className="text-xs text-slate-700">{maj.id} — {maj.name}</span> : <span className="text-xs text-slate-400">Chưa chọn</span>;
      }
    },
    {
      header: 'Lớp',
      accessor: (s: any) => <Badge variant="info">{s.classCode}</Badge>
    },
    {
      header: 'Mật Khẩu Hiện Tại',
      accessor: (s: any) => (
        <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 w-fit">
          <Key className="h-3 w-3 text-slate-400" />
          <span className="text-slate-600 font-medium">{getStudentPassword(s.id)}</span>
        </div>
      )
    },
    {
      header: 'Ngày sinh',
      accessor: (s: any) => <span className="text-xs text-slate-500">{new Date(s.birthDate).toLocaleDateString('vi-VN')}</span>
    },
    {
      header: 'Giới Tính',
      accessor: (s: any) => <span className="text-xs text-slate-600">{s.gender}</span>
    },
    {
      header: 'Liên Hệ',
      accessor: (s: any) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>{s.email}</p>
          <p>{s.phone}</p>
        </div>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: (s: any) => {
        const variant = s.status === 'active' ? 'success' : s.status === 'graduated' ? 'info' : 'warning';
        return <Badge variant={variant}>{getStudentStatusLabel(s.status)}</Badge>;
      }
    },
    {
      header: 'Thao Tác',
      accessor: (s: any) => (
        <div className="flex gap-1.5 items-center justify-end">
          <button
            onClick={() => openEditModal(s)}
            title="Sửa thông tin"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteStudentAccount(s.id, (msg) => triggerToast(msg, 'success'))}
            title="Xóa / khóa tài khoản"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => resetStudentPassword(s.id, (msg) => triggerToast(msg, 'success'))}
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quản Lý Sinh Viên</h2>
          <p className="text-xs text-slate-500">Tạo tài khoản sinh viên, xếp lớp khóa học, xem mật khẩu hoặc khôi phục</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> Thêm Sinh Viên
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
            placeholder="Tìm theo MSSV, tên, email, sđt..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedDepartmentFilter}
            onChange={(e) => { setSelectedDepartmentFilter(e.target.value); setSelectedMajorFilter('all'); }}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả khoa</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedMajorFilter}
            onChange={(e) => setSelectedMajorFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
            disabled={selectedDepartmentFilter !== 'all' && !departments.find((d:any) => d.id === selectedDepartmentFilter)}
          >
            <option value="all">Tất cả ngành</option>
            {majors
              .filter((m: any) => selectedDepartmentFilter === 'all' || m.departmentId === selectedDepartmentFilter)
              .map((m: any) => (
                <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
              ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-600"
          >
            <option value="all">Tất cả các lớp</option>
            {classCodes.map((cc) => (
              <option key={cc} value={cc}>
                {cc}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table List */}
      <Card>
        <Table data={students} columns={columns} emptyMessage="Không tìm thấy sinh viên nào phù hợp." />
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Cập Nhật Sinh Viên' : 'Thêm Sinh Viên Mới'}
        footer={
          <>
            <button
              onClick={handleSaveAction}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Lưu sinh viên
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
              label="Mã Số Sinh Viên (MSSV)"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              disabled={!!editingStudent}
              placeholder="Ví dụ: SV005..."
              error={errors.id}
            />

            <FormInput
              label="Mật Khẩu Đăng Nhập"
              name="password"
              type="text"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Ví dụ: 123..."
              error={errors.password}
            />
          </div>

          <FormInput
            label="Họ và Tên Sinh Viên"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ví dụ: Trần Văn Hoàng..."
            error={errors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Địa chỉ Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Ví dụ: hoang.tv@hungnhan.edu.vn..."
              error={errors.email}
            />

            <FormInput
              label="Số Điện Thoại"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Ví dụ: 0977..."
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Khoa</label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value="">-- Chọn khoa --</option>
                {departments.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              {errors.departmentId && <p className="mt-1 text-xs text-rose-600">{errors.departmentId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Ngành</label>
              <select
                name="majorId"
                value={formData.majorId}
                onChange={handleInputChange}
                disabled={!formData.departmentId}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value="">-- Chọn ngành --</option>
                {majors.filter((m: any) => !formData.departmentId || m.departmentId === formData.departmentId).map((m: any) => (
                  <option key={m.id} value={m.id}>{m.id} — {m.name}</option>
                ))}
              </select>
              {errors.majorId && <p className="mt-1 text-xs text-rose-600">{errors.majorId}</p>}
            </div>

            <FormInput
              label="Lớp Khóa Học"
              name="classCode"
              value={formData.classCode}
              onChange={handleInputChange}
              placeholder="Ví dụ: K64-CNTT..."
              error={errors.classCode}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Trạng Thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
            >
              <option value="active">Đang học</option>
              <option value="on_leave">Tạm nghỉ</option>
              <option value="dropped_out">Thôi học</option>
              <option value="graduated">Đã tốt nghiệp</option>
            </select>
          </div>

          {editingStudent && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Thay đổi mật khẩu ở trên sẽ trực tiếp ghi đè mật khẩu đăng nhập hiện tại của tài khoản sinh viên này.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
