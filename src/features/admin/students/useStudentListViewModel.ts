import React, { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { Student, StudentStatus } from '../../../types';

export function useStudentListViewModel() {
  const { students, addStudent, updateStudent, deleteStudent, departments, majors } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState('all');
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
    status: 'active' as StudentStatus,
    password: '123',
    departmentId: '',
    majorId: ''
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

    let matchesDepartment = true;
    if (selectedDepartmentFilter !== 'all') {
      const maj = majors.find(m => m.id === s.majorId);
      matchesDepartment = !!maj && maj.departmentId === selectedDepartmentFilter;
    }

    const matchesMajor = selectedMajorFilter === 'all' || s.majorId === selectedMajorFilter;

    return matchesSearch && matchesClass && matchesDepartment && matchesMajor;
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
      status: 'active',
      password: '123',
      departmentId: '',
      majorId: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    const pwd = getStudentPassword(s.id);
    // Determine departmentId from student's major if available
    const major = majors.find(m => m.id === s.majorId);
    setFormData({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      classCode: s.classCode,
      birthDate: s.birthDate,
      gender: s.gender,
      status: s.status,
      password: pwd,
      departmentId: major ? major.departmentId : '',
      majorId: s.majorId || ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // When department changes, reset major selection
    if (name === 'departmentId') {
      setFormData(prev => ({ ...prev, departmentId: value, majorId: '' }));
    } else if (name === 'majorId') {
      setFormData(prev => ({ ...prev, majorId: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    // Require department and major to be selected and that major belongs to department
    if (!formData.departmentId) tempErrors.departmentId = 'Vui lòng chọn khoa';
    if (!formData.majorId) tempErrors.majorId = 'Vui lòng chọn ngành';
    if (formData.departmentId && formData.majorId) {
      const maj = majors.find(m => m.id === formData.majorId);
      if (!maj || maj.departmentId !== formData.departmentId) {
        tempErrors.majorId = 'Ngành chọn không thuộc khoa đã chọn';
      }
    }

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
        gender: formData.gender,
        status: formData.status,
        majorId: formData.majorId || undefined
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
        status: formData.status,
        majorId: formData.majorId || undefined
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

  const toggleStudentStatus = (id: string, currentStatus: StudentStatus, onSuccess: (msg: string) => void) => {
    const newStatus: StudentStatus = currentStatus === 'active' ? 'on_leave' : 'active';
    const actionLabel = newStatus === 'active' ? 'mở khóa' : 'khóa';
    if (confirm(`Bạn có chắc muốn ${actionLabel} sinh viên ${id}?`)) {
      updateStudent(id, { status: newStatus });
      onSuccess(`Đã ${actionLabel} tài khoản sinh viên ${id} thành công!`);
    }
  };

  const deleteStudentAccount = (id: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc muốn xóa/khóa tài khoản sinh viên ${id}?`)) {
      deleteStudent(id);
      onSuccess(`Đã khóa tài khoản sinh viên ${id} thành công!`);
    }
  };

  return {
    students: filteredStudents,
    classCodes: uniqueClassCodes,
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
    toggleStudentStatus,
    deleteStudentAccount,
    getStudentPassword,
    resetStudentPassword
  };
}
