import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Student, StudentRequest } from '../../../models/Student';
import { Major } from '../../../models/Major';
import { Department } from '../../../models/Department';
import { SchoolClass } from '../../../models/SchoolClass';
import { UserAdmin } from '../../../models/UserAdmin';

export function useStudentListViewModel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<UserAdmin[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Student | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<StudentRequest>({
    userId: 0,
    studentCode: '',
    fullName: '',
    gender: 'Nam',
    dateOfBirth: '',
    address: '',
    majorId: 0,
    classId: 0,
    status: 'ACTIVE'
  });

  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchOptions = async () => {
    try {
      const [deptData, majorData, classData, userData] = await Promise.all([
        adminApi.getAllDepartments(),
        adminApi.getAllMajorsList(),
        adminApi.getAllSchoolClasses(),
        adminApi.getAllUsersList()
      ]);
      setDepartments(deptData || []);
      setMajors(majorData || []);
      setSchoolClasses(classData || []);
      
      const studentUsers = (userData || []).filter(u => 
        u.roles?.some(r => r.name === 'STUDENT' || r.name === 'ROLE_STUDENT')
      );
      setUsers(studentUsers);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu options sinh viên', err);
    }
  };

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<number | undefined>(undefined);
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(undefined);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchStudents = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminApi.getAllStudents(page, pageSize, debouncedSearch, selectedDepartmentId, selectedMajorId, selectedClassId);
        if (isActive) {
          setStudents(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || 'Lỗi khi tải dữ liệu sinh viên');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isActive = false;
    };
  }, [page, pageSize, debouncedSearch, selectedDepartmentId, selectedMajorId, selectedClassId]);

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
  }, [selectedDepartmentId, selectedMajorId, selectedClassId]);

  const filteredItems = students; // Đã filter qua API

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      userId: 0,
      studentCode: '',
      fullName: '',
      gender: 'Nam',
      dateOfBirth: '',
      address: '',
      majorId: majors.length > 0 ? majors[0].id! : 0,
      classId: 0,
      status: 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Student) => {
    setEditingItem(item);
    setFormData({ 
      userId: item.userId || 0,
      studentCode: item.studentCode,
      fullName: item.fullName,
      gender: item.gender || 'Nam',
      dateOfBirth: item.dateOfBirth || '',
      address: item.address || '',
      majorId: item.majorId || 0,
      classId: item.classId || 0,
      status: item.status || 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'majorId' || name === 'classId' || name === 'userId') ? Number(value) : value 
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
    if (!formData.studentCode.trim()) tempErrors.studentCode = 'Mã sinh viên không được để trống';
    if (!formData.fullName.trim()) tempErrors.fullName = 'Họ tên không được để trống';
    if (!formData.majorId) tempErrors.majorId = 'Vui lòng chọn ngành học';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        const updatedStudent = await adminApi.updateStudent(editingItem.id, formData);
        setStudents(prev => prev.map(s => s.id === editingItem.id ? updatedStudent : s));
        onSuccess(`Đã cập nhật hồ sơ sinh viên ${formData.fullName} thành công!`);
      } else {
        const newStudent = await adminApi.createStudent(formData);
        setStudents(prev => [newStudent, ...prev]);
        setTotalElements(prev => prev + 1);
        onSuccess(`Đã tạo hồ sơ sinh viên ${formData.fullName} thành công!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu hồ sơ sinh viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ sinh viên ${name}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteStudent(id);
        setStudents(prev => prev.filter(s => s.id !== id));
        setTotalElements(prev => prev - 1);
        onSuccess(`Đã xóa hồ sơ sinh viên ${name} thành công!`);
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
    students: filteredItems,
    departments,
    majors,
    schoolClasses,
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedMajorId,
    setSelectedMajorId,
    selectedClassId,
    setSelectedClassId,
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
