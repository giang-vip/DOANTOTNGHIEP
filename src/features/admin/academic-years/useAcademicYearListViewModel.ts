import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { AcademicYear, AcademicYearRequest } from '../../../models/AcademicYear';

export function useAcademicYearListViewModel() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicYear | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<AcademicYearRequest>({
    code: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  const fetchAcademicYears = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAllAcademicYears();
      setAcademicYears(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách năm học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const filteredItems = academicYears.filter(item => 
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ code: '', startDate: '', endDate: '', isCurrent: false });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: AcademicYear) => {
    setEditingItem(item);
    setFormData({ 
      code: item.code, 
      startDate: item.startDate, 
      endDate: item.endDate,
      isCurrent: item.isCurrent
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.code.trim()) tempErrors.code = 'Mã năm học không được để trống';
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
        await adminApi.updateAcademicYear(editingItem.id, formData);
        onSuccess(`Đã cập nhật năm học ${formData.code} thành công!`);
      } else {
        await adminApi.createAcademicYear(formData);
        onSuccess(`Đã thêm mới năm học ${formData.code} thành công!`);
      }
      setIsModalOpen(false);
      fetchAcademicYears();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu năm học');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, code: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa năm học ${code}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteAcademicYear(id);
        onSuccess(`Đã xóa năm học ${code} thành công!`);
        fetchAcademicYears();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa năm học');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    academicYears: filteredItems,
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
