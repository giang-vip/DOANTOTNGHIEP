import React, { useState } from 'react';
import { useStore } from '../../../models/store';
import { Department } from '../../../types';

export function useDepartmentListViewModel() {
  const { departments, addDepartment, updateDepartment, deleteDepartment } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Department>({
    id: '',
    name: '',
    description: ''
  });

  const filteredDepartments = departments.filter(d => 
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ id: '', name: '', description: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ ...dept });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.id.trim()) tempErrors.id = 'Mã khoa không được để trống';
    else if (!editingDept && departments.some(d => d.id.toLowerCase() === formData.id.toLowerCase().trim())) {
      tempErrors.id = 'Mã khoa này đã tồn tại';
    }
    if (!formData.name.trim()) tempErrors.name = 'Tên khoa không được để trống';
    if (!formData.description.trim()) tempErrors.description = 'Mô tả không được để trống';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    if (editingDept) {
      updateDepartment(editingDept.id, formData);
      onSuccess(`Đã cập nhật khoa ${formData.name} thành công!`);
    } else {
      addDepartment({
        id: formData.id.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description.trim()
      });
      onSuccess(`Đã thêm mới khoa ${formData.name} thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khoa ${name}?`)) {
      deleteDepartment(id);
      onSuccess(`Đã xóa khoa ${name} thành công!`);
    }
  };

  return {
    departments: filteredDepartments,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingDept,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    handleDelete
  };
}
