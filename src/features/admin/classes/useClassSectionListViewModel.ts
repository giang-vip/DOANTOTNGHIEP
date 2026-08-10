import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { ClassSection, ClassSectionRequest } from '../../../models/admin/ClassSection';
import { Subject } from '../../../models/admin/Subject';
import { Teacher } from '../../../models/admin/Teacher';
import { Department } from '../../../models/admin/Department';
import { Major } from '../../../models/admin/Major';

export function useClassSectionListViewModel() {
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassSection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ClassSectionRequest>({
    departmentId: 0,
    majorId: 0,
    subjectId: 0,
    teacherId: 0,
    semesterId: 0,
    sectionCode: '',
    room: '',
    weekday: 2,
    startTime: '07:00',
    endTime: '09:00',
    startDate: '',
    endDate: '',
    capacity: 40,
    status: 'ACTIVE'
  });

  const [selectedSemesterId, setSelectedSemesterId] = useState<number | undefined>(undefined);

  const fetchOptions = async () => {
    try {
      const [subjectData, teacherData, deptData, majorData, semesterData] = await Promise.all([
        adminApi.getAllSubjectsList(),
        adminApi.getAllTeachersList(),
        adminApi.getAllDepartments(),
        adminApi.getAllMajorsList(),
        adminApi.getAllSemesters()
      ]);
      setSubjects(subjectData || []);
      setTeachers(teacherData || []);
      setDepartments(deptData || []);
      setMajors(majorData || []);
      setSemesters(semesterData || []);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu options:', err);
    }
  };

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  const [selectedMajorId, setSelectedMajorId] = useState<number | undefined>(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  const fetchClassSections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllClassSections(page, pageSize, debouncedSearch, selectedSemesterId, selectedSubjectId, selectedDepartmentId, selectedMajorId);
      setClassSections(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu lớp học phần');
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
  }, [selectedSemesterId, selectedSubjectId, selectedDepartmentId, selectedMajorId]);

  useEffect(() => {
    fetchClassSections();
  }, [page, pageSize, debouncedSearch, selectedSemesterId, selectedSubjectId, selectedDepartmentId, selectedMajorId]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      departmentId: departments.length > 0 ? departments[0].id! : 0,
      majorId: 0,
      subjectId: subjects.length > 0 ? subjects[0].id! : 0,
      teacherId: teachers.length > 0 ? teachers[0].id! : 0,
      semesterId: semesters.length > 0 ? semesters[0].id! : 0,
      sectionCode: '',
      room: '',
      weekday: 2,
      startTime: '07:00',
      endTime: '09:00',
      startDate: '',
      endDate: '',
      capacity: 40,
      status: 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: ClassSection) => {
    setEditingItem(item);
    setFormData({ 
      departmentId: item.departmentId || 0,
      majorId: item.majorId || 0,
      subjectId: item.subjectId,
      teacherId: item.teacherId,
      semesterId: item.semesterId,
      sectionCode: item.sectionCode,
      room: item.room || '',
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      startDate: item.startDate,
      endDate: item.endDate,
      capacity: item.capacity,
      status: item.status || 'ACTIVE'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumberField = ['departmentId', 'majorId', 'subjectId', 'teacherId', 'semesterId', 'weekday', 'capacity'].includes(name);
    setFormData(prev => ({ 
      ...prev, 
      [name]: isNumberField ? Number(value) : value 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.sectionCode.trim()) tempErrors.sectionCode = 'Mã lớp không được để trống';
    if (!formData.subjectId) tempErrors.subjectId = 'Vui lòng chọn môn học';
    if (!formData.teacherId) tempErrors.teacherId = 'Vui lòng chọn giảng viên';
    if (!formData.departmentId) tempErrors.departmentId = 'Vui lòng chọn khoa';
    if (!formData.semesterId) tempErrors.semesterId = 'Vui lòng chọn học kỳ';
    if (!formData.startDate) tempErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.endDate) tempErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    if (!formData.startTime) tempErrors.startTime = 'Vui lòng nhập giờ bắt đầu';
    if (!formData.endTime) tempErrors.endTime = 'Vui lòng nhập giờ kết thúc';

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
        tempErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }

    if (formData.startTime && formData.endTime && formData.startTime > formData.endTime) {
        tempErrors.endTime = 'Giờ kết thúc phải lớn hơn giờ bắt đầu';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateClassSection(editingItem.id, formData);
        onSuccess(`Đã cập nhật lớp học phần ${formData.sectionCode} thành công!`);
      } else {
        await adminApi.createClassSection(formData);
        onSuccess(`Đã thêm mới lớp học phần ${formData.sectionCode} thành công!`);
      }
      setIsModalOpen(false);
      fetchClassSections();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, code: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp học phần ${code}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteClassSection(id);
        onSuccess(`Đã xóa lớp học phần ${code} thành công!`);
        fetchClassSections();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa lớp học phần');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectChange = (name: string, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return {
    classSections,
    subjects,
    teachers,
    departments,
    majors,
    semesters,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    selectedSemesterId,
    setSelectedSemesterId,
    selectedDepartmentId,
    setSelectedDepartmentId,
    selectedMajorId,
    setSelectedMajorId,
    selectedSubjectId,
    setSelectedSubjectId,
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
