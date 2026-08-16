import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Major, MajorRequest } from '../../../models/Major';
import { Department } from '../../../models/Department';

export function useMajorListViewModel() {
  const [majors, setMajors] = useState<Major[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Major | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MajorRequest>({
    departmentId: 0,
    code: '',
    name: '',
    description: '',
    status: 'ACTIVE'
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);

  const fetchOptions = async () => {
    try {
      const deptData = await adminApi.getAllDepartments();
      setDepartments(deptData || []);
    } catch (err) {
      console.error('Lỗi lấy khoa', err);
    }
  };

  const fetchMajors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllMajors(page, pageSize, debouncedSearch, selectedDepartmentId);
      setMajors(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu ngành học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [selectedDepartmentId]);

  useEffect(() => {
    fetchMajors();
  }, [page, pageSize, debouncedSearch, selectedDepartmentId]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      departmentId: departments.length > 0 ? departments[0].id : 0,
      code: '',
      name: '',
      description: '',
      status: 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Major) => {
    setEditingItem(item);
    setFormData({ 
      departmentId: item.departmentId,
      code: item.code,
      name: item.name,
      description: item.description || '',
      status: item.status || 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'departmentId' ? Number(value) : value 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.code.trim()) tempErrors.code = 'Mã ngành không được để trống';
    if (!formData.name.trim()) tempErrors.name = 'Tên ngành không được để trống';
    if (!formData.departmentId) tempErrors.departmentId = 'Vui lòng chọn Khoa quản lý';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateMajor(editingItem.id, formData);
        onSuccess(`Đã cập nhật ngành ${formData.name} thành công!`);
      } else {
        await adminApi.createMajor(formData);
        onSuccess(`Đã thêm mới ngành ${formData.name} thành công!`);
      }
      setIsModalOpen(false);
      fetchMajors();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu ngành học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ngành ${name}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteMajor(id);
        onSuccess(`Đã xóa ngành ${name} thành công!`);
        fetchMajors();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa ngành học');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    majors,
    departments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedDepartmentId,
    setSelectedDepartmentId,
    page,
    setPage,
    pageSize,
    setPageSize,
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
    handleDelete
  };
}
