import React, { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { Teacher, TeacherStatus } from '../../../types';

export function useTeacherListViewModel() {
  const { teachers, departments, addTeacher, updateTeacher, deleteTeacher } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Credentials mapping from local storage
  const [passwordsMap, setPasswordsMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    setPasswordsMap(pwds);
  }, [isModalOpen]);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    status: 'active' as TeacherStatus,
    password: '123' // default password
  });

  const getTeacherPassword = (teacherId: string) => {
    // Standard user credentials are generated as username = teacherId.toLowerCase()
    const username = teacherId.toLowerCase();
    return passwordsMap[username] || '123';
  };

  const resetTeacherPassword = (teacherId: string, onSuccess: (msg: string) => void) => {
    const username = teacherId.toLowerCase();
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    pwds[username] = '123'; // reset to 123
    localStorage.setItem('hn_passwords', JSON.stringify(pwds));
    setPasswordsMap(pwds);
    onSuccess(`Đã đặt lại mật khẩu cho giảng viên ${teacherId} về mặc định "123"!`);
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDeptFilter === 'all' || t.department === selectedDeptFilter;

    return matchesSearch && matchesDept;
  });

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      department: departments[0]?.name || '',
      status: 'active',
      password: '123'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    const pwd = getTeacherPassword(t.id);
    setFormData({
      id: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      department: t.department,
      status: t.status,
      password: pwd
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.id.trim()) tempErrors.id = 'Mã giảng viên không được để trống';
    else if (!editingTeacher && teachers.some(t => t.id.toLowerCase() === formData.id.toLowerCase().trim())) {
      tempErrors.id = 'Mã giảng viên này đã tồn tại';
    }
    if (!formData.name.trim()) tempErrors.name = 'Họ và tên không được để trống';
    if (!formData.email.trim() || !formData.email.includes('@')) tempErrors.email = 'Email không đúng định dạng';
    if (!formData.phone.trim()) tempErrors.phone = 'Số điện thoại không được để trống';
    if (!formData.department) tempErrors.department = 'Vui lòng chọn Khoa quản lý';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    if (editingTeacher) {
      updateTeacher(editingTeacher.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        status: formData.status
      });

      // Update password if changed
      const username = editingTeacher.id.toLowerCase();
      const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
      pwds[username] = formData.password;
      localStorage.setItem('hn_passwords', JSON.stringify(pwds));

      onSuccess(`Đã cập nhật thông tin giảng viên ${formData.name} thành công!`);
    } else {
      addTeacher({
        id: formData.id.toUpperCase().trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        status: formData.status
      });

      // Set custom or default password
      const username = formData.id.toLowerCase().trim();
      const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
      pwds[username] = formData.password;
      localStorage.setItem('hn_passwords', JSON.stringify(pwds));

      onSuccess(`Đã thêm mới giảng viên ${formData.name} thành công!`);
    }

    setIsModalOpen(false);
  };

  const toggleTeacherStatus = (id: string, currentStatus: TeacherStatus, onSuccess: (msg: string) => void) => {
    const newStatus: TeacherStatus = currentStatus === 'active' ? 'on_leave' : 'active';
    const actionLabel = newStatus === 'active' ? 'mở khóa' : 'khóa';
    if (confirm(`Bạn có chắc muốn ${actionLabel} giảng viên ${id}?`)) {
      updateTeacher(id, { status: newStatus });
      onSuccess(`Đã ${actionLabel} tài khoản giảng viên ${id} thành công!`);
    }
  };

  const deleteTeacherAccount = (id: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc muốn xóa/khóa tài khoản giảng viên ${id}?`)) {
      deleteTeacher(id);
      onSuccess(`Đã khóa tài khoản giảng viên ${id} thành công!`);
    }
  };

  return {
    teachers: filteredTeachers,
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
    toggleTeacherStatus,
    deleteTeacherAccount,
    getTeacherPassword,
    resetTeacherPassword
  };
}
