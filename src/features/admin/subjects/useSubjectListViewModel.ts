import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Subject, SubjectRequest } from '../../../models/Subject';
import { Department } from '../../../models/Department';

export function useSubjectListViewModel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SubjectRequest>({
    code: '',
    name: '',
    credits: 3,
    departmentId: 0,
    description: ''
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchOptions = async () => {
    try {
      const deptData = await adminApi.getAllDepartments();
      setDepartments(deptData || []);
    } catch (err) {
      console.error('Lỗi lấy khoa', err);
    }
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllSubjects(page, pageSize, debouncedSearch);
      setSubjects(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu môn học');
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

  useEffect(() => {
    fetchSubjects();
  }, [page, pageSize, debouncedSearch]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      code: '', 
      name: '', 
      credits: 3, 
      departmentId: departments.length > 0 ? departments[0].id : 0,
      description: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Subject) => {
    setEditingItem(item);
    setFormData({ 
      code: item.code, 
      name: item.name,
      credits: item.credits,
      departmentId: item.departmentId,
      description: item.description || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'departmentId' || name === 'credits') ? Number(value) : value 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.code.trim()) tempErrors.code = 'Mã môn học không được để trống';
    if (!formData.name.trim()) tempErrors.name = 'Tên môn học không được để trống';
    if (!formData.credits || formData.credits < 1) tempErrors.credits = 'Số tín chỉ phải lớn hơn 0';
    if (!formData.departmentId) tempErrors.departmentId = 'Vui lòng chọn Khoa quản lý';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateSubject(editingItem.id, formData);
        onSuccess(`Đã cập nhật môn học ${formData.name} thành công!`);
      } else {
        await adminApi.createSubject(formData);
        onSuccess(`Đã thêm mới môn học ${formData.name} thành công!`);
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu môn học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa môn học ${name}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteSubject(id);
        onSuccess(`Đã xóa môn học ${name} thành công!`);
        fetchSubjects();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa môn học');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    subjects,
    departments,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
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
