import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Semester, SemesterRequest } from '../../../models/Semester';
import { AcademicYear } from '../../../models/AcademicYear';

export function useSemesterListViewModel() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Semester | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SemesterRequest>({
    academicYearId: 0,
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [semData, ayData] = await Promise.all([
        adminApi.getAllSemesters(),
        adminApi.getAllAcademicYears()
      ]);
      setSemesters(semData || []);
      setAcademicYears(ayData || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách học kỳ');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = semesters.filter(item => 
    item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      academicYearId: academicYears.length > 0 ? academicYears[0].id : 0, 
      code: '', 
      name: '', 
      startDate: '', 
      endDate: '', 
      isCurrent: false 
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Semester) => {
    setEditingItem(item);
    setFormData({ 
      academicYearId: item.academicYearId,
      code: item.code, 
      name: item.name,
      startDate: item.startDate, 
      endDate: item.endDate,
      isCurrent: item.isCurrent
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'academicYearId' ? Number(value) : value) 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.academicYearId) tempErrors.academicYearId = 'Vui lòng chọn năm học';
    if (!formData.code.trim()) tempErrors.code = 'Mã học kỳ không được để trống';
    if (!formData.name.trim()) tempErrors.name = 'Tên học kỳ không được để trống';
    if (!formData.startDate) tempErrors.startDate = 'Ngày bắt đầu không được để trống';
    if (!formData.endDate) tempErrors.endDate = 'Ngày kết thúc không được để trống';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateSemester(editingItem.id, formData);
        onSuccess(`Đã cập nhật học kỳ ${formData.name} thành công!`);
      } else {
        await adminApi.createSemester(formData);
        onSuccess(`Đã thêm mới học kỳ ${formData.name} thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu học kỳ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa học kỳ ${name}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteSemester(id);
        onSuccess(`Đã xóa học kỳ ${name} thành công!`);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa học kỳ');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    semesters: filteredItems,
    academicYears,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
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
