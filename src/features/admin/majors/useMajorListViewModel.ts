import React, { useState } from 'react';
import { useStore } from '../../../models/store';
import { Major } from '../../../types';

export function useMajorListViewModel() {
  const { majors, departments, addMajor, updateMajor, deleteMajor } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Major>({ id: '', name: '', departmentId: '', description: '', status: 'active' });

  const filteredMajors = majors.filter(m => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const openAddModal = () => {
    setEditingMajor(null);
    setFormData({ id: '', name: '', departmentId: departments[0]?.id || '', description: '', status: 'active' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (m: Major) => {
    setEditingMajor(m);
    setFormData({ ...m });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as any;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const tmp: Record<string, string> = {};
    if (!formData.id.trim()) tmp.id = 'Mã ngành bắt buộc';
    else if (!editingMajor && majors.some(x => x.id.toLowerCase() === formData.id.toLowerCase().trim())) tmp.id = 'Mã ngành đã tồn tại';
    if (!formData.name.trim()) tmp.name = 'Tên ngành bắt buộc';
    if (!formData.departmentId) tmp.departmentId = 'Phải chọn khoa trực thuộc';

    setErrors(tmp);
    return Object.keys(tmp).length === 0;
  };

  const handleSave = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    const payload: Major = { ...formData, id: formData.id.toUpperCase().trim() };
    try {
      if (editingMajor) {
        updateMajor(editingMajor.id, payload);
        onSuccess(`Đã cập nhật ngành ${payload.name} thành công!`);
      } else {
        addMajor(payload);
        onSuccess(`Đã thêm mới ngành ${payload.name} thành công!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setErrors({ ...(errors || {}), id: err?.message || 'Lỗi khi lưu ngành' });
    }
  };

  const handleDelete = (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ngành ${name}?`)) {
      const ok = deleteMajor(id);
      if (ok) {
        onSuccess(`Đã xóa ngành ${name} thành công!`);
      } else {
        alert('Không thể xóa ngành vì đang có sinh viên, lớp hoặc môn học liên quan.');
      }
    }
  };

  return {
    majors: filteredMajors,
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
  };
}
