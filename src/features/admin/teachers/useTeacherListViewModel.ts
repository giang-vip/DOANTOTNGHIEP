import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Teacher, TeacherRequest } from '../../../models/Teacher';
import { Department } from '../../../models/Department';
import { UserAdmin } from '../../../models/UserAdmin';

export function useTeacherListViewModel() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Teacher | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TeacherRequest>({
    userId: 0,
    teacherCode: '',
    fullName: '',
    gender: 'Nam',
    departmentId: 0,
    title: '',
    status: 'ACTIVE'
  });

  const fetchOptions = async () => {
    try {
      const [deptData, userData] = await Promise.all([
        adminApi.getAllDepartments(),
        adminApi.getAllUsersList()
      ]);
      setDepartments(deptData || []);
      const teacherUsers = (userData || []).filter(u => 
        u.roles?.some(r => r.name === 'TEACHER' || r.name === 'ROLE_TEACHER')
      );
      setUsers(teacherUsers);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu options giảng viên', err);
    }
  };

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const fetchTeachers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllTeachers(page, pageSize, debouncedSearch, selectedDepartmentId);
      setTeachers(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu giảng viên');
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
    fetchTeachers();
  }, [page, pageSize, debouncedSearch, selectedDepartmentId]);

  const filteredItems = teachers; // Đã filter qua API

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      userId: 0,
      teacherCode: '',
      fullName: '',
      gender: 'Nam',
      departmentId: departments.length > 0 ? departments[0].id! : 0,
      title: 'Thạc sĩ',
      status: 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Teacher) => {
    setEditingItem(item);
    setFormData({ 
      userId: item.userId || 0,
      teacherCode: item.teacherCode,
      fullName: item.fullName,
      gender: item.gender || 'Nam',
      departmentId: item.departmentId || 0,
      title: item.title || '',
      status: item.status || 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'departmentId' || name === 'userId') ? Number(value) : value 
    }));
    
    // Auto-fill full name and gender when a user is selected
    if (name === 'userId') {
      const selectedUser = users.find(u => u.id === Number(value));
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          fullName: selectedUser.fullName,
          gender: selectedUser.gender || 'Nam'
        }));
      }
    }
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.userId) tempErrors.userId = 'Vui lòng chọn tài khoản hệ thống';
    if (!formData.teacherCode.trim()) tempErrors.teacherCode = 'Mã giảng viên không được để trống';
    if (!formData.fullName.trim()) tempErrors.fullName = 'Họ tên không được để trống';
    if (!formData.departmentId) tempErrors.departmentId = 'Vui lòng chọn Khoa quản lý';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        const updatedTeacher = await adminApi.updateTeacher(editingItem.id, formData);
        setTeachers(prev => prev.map(t => t.id === editingItem.id ? updatedTeacher : t));
        onSuccess(`Đã cập nhật hồ sơ giảng viên ${formData.fullName} thành công!`);
      } else {
        const newTeacher = await adminApi.createTeacher(formData);
        setTeachers(prev => [newTeacher, ...prev]);
        setTotalElements(prev => prev + 1);
        onSuccess(`Đã tạo hồ sơ giảng viên ${formData.fullName} thành công!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu hồ sơ giảng viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ giảng viên ${name}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteTeacher(id);
        setTeachers(prev => prev.filter(t => t.id !== id));
        setTotalElements(prev => prev - 1);
        onSuccess(`Đã xóa hồ sơ giảng viên ${name} thành công!`);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa hồ sơ');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectChange = (name: string, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'userId' && value !== undefined) {
      const selectedUser = users.find(u => u.id === Number(value));
      if (selectedUser) {
        setFormData(prev => ({
          ...prev,
          userId: Number(value),
          fullName: selectedUser.fullName,
          gender: selectedUser.gender || 'Nam'
        }));
      }
    }
  };

  return {
    teachers: filteredItems,
    departments,
    users,
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
    handleSelectChange,
    handleSave,
    handleDelete
  };
}
