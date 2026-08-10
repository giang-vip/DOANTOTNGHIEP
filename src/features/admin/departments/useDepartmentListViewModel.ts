import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Department, DepartmentRequest } from '../../../models/admin/Department';

export function useDepartmentListViewModel() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<DepartmentRequest>({
    code: '',
    name: '',
    description: ''
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllDepartments();
      setDepartments(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách khoa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(d => 
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ code: '', name: '', description: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ 
      code: dept.code, 
      name: dept.name, 
      description: dept.description || '' 
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.code.trim()) tempErrors.code = 'Mã khoa không được để trống';
    else if (!editingDept && departments.some(d => d.code.toLowerCase() === formData.code.toLowerCase().trim())) {
      tempErrors.code = 'Mã khoa này đã tồn tại';
    }
    if (!formData.name.trim()) tempErrors.name = 'Tên khoa không được để trống';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingDept && editingDept.id) {
        await adminApi.updateDepartment(editingDept.id, {
          code: formData.code.toUpperCase().trim(),
          name: formData.name.trim(),
          description: formData.description?.trim()
        });
        onSuccess(`Đã cập nhật khoa ${formData.name} thành công!`);
      } else {
        await adminApi.createDepartment({
          code: formData.code.toUpperCase().trim(),
          name: formData.name.trim(),
          description: formData.description?.trim()
        });
        onSuccess(`Đã thêm mới khoa ${formData.name} thành công!`);
      }
      setIsModalOpen(false);
      fetchDepartments(); // Reload data
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu khoa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa khoa ${name}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteDepartment(id);
        onSuccess(`Đã xóa khoa ${name} thành công!`);
        fetchDepartments();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa khoa');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    departments: filteredDepartments,
    isLoading,
    error,
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
