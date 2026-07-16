import React, { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { Student } from '../../../types';

export function useStudentListViewModel() {
  const { students, addStudent, updateStudent } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch passwords database from localStorage to map passwords
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
    classCode: '',
    birthDate: '',
    gender: 'Nam' as 'Nam' | 'Nữ' | 'Khác',
    password: '123'
  });

  // Extract unique class codes for filter dropdown
  const uniqueClassCodes = Array.from(new Set(students.map(s => s.classCode)));

  const getStudentPassword = (studentId: string) => {
    const username = studentId.toLowerCase();
    return passwordsMap[username] || '123';
  };

  const resetStudentPassword = (studentId: string, onSuccess: (msg: string) => void) => {
    const username = studentId.toLowerCase();
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    pwds[username] = '123';
    localStorage.setItem('hn_passwords', JSON.stringify(pwds));
    setPasswordsMap(pwds);
    onSuccess(`Đã đặt lại mật khẩu cho sinh viên ${studentId} về mặc định "123"!`);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClassFilter === 'all' || s.classCode === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      classCode: 'K64-CNTT',
      birthDate: '2005-01-01',
      gender: 'Nam',
      password: '123'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    const pwd = getStudentPassword(s.id);
    setFormData({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      classCode: s.classCode,
      birthDate: s.birthDate,
      gender: s.gender,
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
    if (!formData.id.trim()) tempErrors.id = 'Mã số sinh viên (MSSV) không được trống';
    else if (!editingStudent && students.some(s => s.id.toLowerCase() === formData.id.toLowerCase().trim())) {
      tempErrors.id = 'Mã số sinh viên này đã tồn tại';
    }
    if (!formData.name.trim()) tempErrors.name = 'Họ và tên không được để trống';
    if (!formData.email.trim() || !formData.email.includes('@')) tempErrors.email = 'Email không đúng định dạng';
    if (!formData.phone.trim()) tempErrors.phone = 'Số điện thoại không được để trống';
    if (!formData.classCode.trim()) tempErrors.classCode = 'Lớp khóa học không được để trống';
    if (!formData.birthDate) tempErrors.birthDate = 'Vui lòng điền ngày sinh';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        classCode: formData.classCode.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender
      });

      // Update password inside passwords map
      const username = editingStudent.id.toLowerCase();
      const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
      pwds[username] = formData.password;
      localStorage.setItem('hn_passwords', JSON.stringify(pwds));

      onSuccess(`Đã cập nhật sinh viên ${formData.name} thành công!`);
    } else {
      addStudent({
        id: formData.id.toUpperCase().trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        classCode: formData.classCode.toUpperCase().trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        status: 'active'
      });

      // Write password in localStorage
      const username = formData.id.toLowerCase().trim();
      const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
      pwds[username] = formData.password;
      localStorage.setItem('hn_passwords', JSON.stringify(pwds));

      onSuccess(`Đã thêm mới sinh viên ${formData.name} thành công!`);
    }

    setIsModalOpen(false);
  };

  const toggleStudentStatus = (id: string, currentStatus: 'active' | 'suspended', onSuccess: (msg: string) => void) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const actionLabel = newStatus === 'active' ? 'mở khóa' : 'khóa';
    if (confirm(`Bạn có chắc muốn ${actionLabel} sinh viên ${id}?`)) {
      updateStudent(id, { status: newStatus });
      onSuccess(`Đã ${actionLabel} tài khoản sinh viên ${id} thành công!`);
    }
  };

  return {
    students: filteredStudents,
    classCodes: uniqueClassCodes,
    searchTerm,
    setSearchTerm,
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
    toggleStudentStatus,
    getStudentPassword,
    resetStudentPassword
  };
}
