import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { RegistrationPeriod, RegistrationPeriodRequest } from '../../../models/admin/RegistrationPeriod';
import { Semester } from '../../../models/admin/Semester';

export function useRegistrationPeriodViewModel() {
  const [periods, setPeriods] = useState<RegistrationPeriod[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RegistrationPeriod | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<RegistrationPeriodRequest>({
    semesterId: 0,
    startDate: '',
    endDate: '',
    isOpen: false
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [periodData, semesterData] = await Promise.all([
        adminApi.getAllRegistrationPeriods(),
        adminApi.getAllSemesters()
      ]);
      setPeriods(periodData || []);
      setSemesters(semesterData || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu thời gian đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      semesterId: semesters.length > 0 ? semesters[0].id! : 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isOpen: false
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: RegistrationPeriod) => {
    setEditingItem(item);
    setFormData({
      semesterId: item.semesterId,
      startDate: item.startDate,
      endDate: item.endDate,
      isOpen: item.isOpen
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'semesterId') {
      finalValue = Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleToggle = async (id: number, currentStatus: boolean, onSuccess: (msg: string) => void) => {
    setIsLoading(true);
    try {
      await adminApi.toggleRegistrationPeriod(id, !currentStatus);
      onSuccess(`Đã ${!currentStatus ? 'mở' : 'đóng'} cổng đăng ký thành công!`);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const tempErrs: Record<string, string> = {};
    if (!formData.semesterId) tempErrs.semesterId = 'Vui lòng chọn học kỳ';
    if (!formData.startDate) tempErrs.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!formData.endDate) tempErrs.endDate = 'Vui lòng chọn ngày kết thúc';
    else if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      tempErrs.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }
    setErrors(tempErrs);
    return Object.keys(tempErrs).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await adminApi.createOrUpdateRegistrationPeriod(formData);
      onSuccess(`Đã cấu hình thời gian đăng ký thành công!`);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu cấu hình');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    periods,
    semesters,
    isLoading,
    error,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleToggle,
    handleSave
  };
}
