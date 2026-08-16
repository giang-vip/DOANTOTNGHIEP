import React from 'react';
import { useRegistrationPeriodViewModel } from './useRegistrationPeriodViewModel';
import { Card, Table, Modal, FormInput, Badge } from '../../../components/UI';
import { Plus, Edit2, Loader2, AlertCircle, Calendar, Power, Trash2 } from 'lucide-react';
import { RegistrationPeriod } from '../../../models/RegistrationPeriod';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface RegistrationPeriodViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function RegistrationPeriodView({ triggerToast }: RegistrationPeriodViewProps) {
  const {
    periods,
    semesters,
    isLoading,
    error,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleToggle,
    handleSave,
    handleDelete
  } = useRegistrationPeriodViewModel();

  const columns = [
    {
      header: 'Học Kỳ',
      accessor: (item: RegistrationPeriod) => (
        <span className="font-semibold text-slate-800">{item.semesterCode}</span>
      )
    },
    {
      header: 'Thời Gian Đăng Ký',
      accessor: (item: RegistrationPeriod) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-blue-500" />
          <span>{new Date(item.startDate).toLocaleDateString('vi-VN')}</span>
          <span className="text-slate-400">→</span>
          <span>{new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
        </div>
      )
    },
    {
      header: 'Trạng Thái',
      accessor: (item: RegistrationPeriod) => (
        <Badge variant={item.isOpen ? 'success' : 'danger'}>
          {item.isOpen ? 'Đang mở cổng' : 'Đã đóng cổng'}
        </Badge>
      )
    },
    {
      header: 'Thao Tác',
      accessor: (item: RegistrationPeriod) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleToggle(item.id!, item.isOpen, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            title={item.isOpen ? 'Đóng cổng' : 'Mở cổng'}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
              item.isOpen 
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            {item.isOpen ? 'Đóng' : 'Mở'}
          </button>
          <button
            onClick={() => openEditModal(item)}
            disabled={isLoading}
            title="Sửa cấu hình"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id!, (msg) => triggerToast(msg, 'success'))}
            disabled={isLoading}
            title="Xóa cấu hình"
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Cấu Hình Cổng Đăng Ký</h2>
          <p className="text-xs text-slate-500">Thiết lập thời gian sinh viên được phép đăng ký học phần</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={isLoading}
          className="inline-flex items-center gap-2 justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Cấu hình mới
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

      <Card className="relative min-h-[300px]">
        {isLoading && periods.length === 0 ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-600">Đang tải cấu hình...</p>
          </div>
        ) : (
          <Table data={periods} columns={columns} emptyMessage="Chưa có cấu hình đăng ký." />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Sửa Cấu Hình Đăng Ký' : 'Tạo Cấu Hình Đăng Ký Mới'}
        footer={
          <>
            <button
              onClick={() => handleSave((msg) => triggerToast(msg, 'success'))}
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Học Kỳ Khởi Tạo</label>
            <SearchableSelect
              name="semesterId"
              value={formData.semesterId}
              onChange={(val) => handleInputChange({ target: { name: 'semesterId', value: Number(val) } } as any)}
              disabled={isLoading}
              options={semesters.map(s => ({ value: s.id!, label: s.name }))}
              placeholder="-- Chọn học kỳ --"
              error={!!errors.semesterId}
            />
            {errors.semesterId && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.semesterId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Ngày Bắt Đầu"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.startDate}
            />
            
            <FormInput
              label="Ngày Kết Thúc"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={isLoading}
              error={errors.endDate}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <input
              type="checkbox"
              id="isOpen"
              name="isOpen"
              checked={formData.isOpen}
              onChange={handleInputChange}
              disabled={isLoading}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="isOpen" className="text-sm font-medium text-slate-700 cursor-pointer">
              Mở cổng ngay sau khi lưu
            </label>
          </div>

        </div>
      </Modal>
    </div>
  );
}
