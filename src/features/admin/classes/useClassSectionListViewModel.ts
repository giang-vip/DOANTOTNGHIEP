import React, { useState } from 'react';
import { useStore } from '../../../models/store';
import { ClassSection } from '../../../types';

export function getClassStatus(startDate: string, endDate: string): 'not_started' | 'ongoing' | 'ended' {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayStrReal = today.toISOString().split('T')[0];
  // Standardize current date around 2026-07-10 for mock data demo consistency
  const current = todayYear === 2026 ? todayStrReal : '2026-07-10';

  const start = startDate || '2026-06-01';
  const end = endDate || '2026-08-30';

  if (current < start) return 'not_started';
  if (current > end) return 'ended';
  return 'ongoing';
}

export function useClassSectionListViewModel() {
  const { classes, subjects, teachers, addClass, updateClass, deleteClass } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active Teachers & Subjects lists
  const activeTeachers = teachers.filter(t => t.status === 'active');
  const activeSubjects = subjects;

  const [formData, setFormData] = useState({
    id: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 2, // Thứ Hai
    timeSlot: '07:00 - 09:30',
    room: '',
    capacity: 40,
    startDate: '2026-06-01',
    endDate: '2026-08-30'
  });

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSub = selectedSubjectFilter === 'all' || cls.subjectId === selectedSubjectFilter;

    const status = getClassStatus(cls.startDate, cls.endDate);
    const matchesStatus = selectedStatusFilter === 'all' || status === selectedStatusFilter;

    return matchesSearch && matchesSub && matchesStatus;
  });

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      id: '',
      subjectId: activeSubjects[0]?.id || '',
      teacherId: activeTeachers[0]?.id || '',
      dayOfWeek: 2,
      timeSlot: '07:00 - 09:30',
      room: '',
      capacity: 40,
      startDate: '2026-06-01',
      endDate: '2026-08-30'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (cls: ClassSection) => {
    setEditingClass(cls);
    setFormData({
      id: cls.id,
      subjectId: cls.subjectId,
      teacherId: cls.teacherId,
      dayOfWeek: cls.dayOfWeek,
      timeSlot: cls.timeSlot,
      room: cls.room,
      capacity: cls.capacity,
      startDate: cls.startDate || '2026-06-01',
      endDate: cls.endDate || '2026-08-30'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'dayOfWeek' ? parseInt(value) || 0 : value
    }));
  };

  const handleTimeChange = (timeValue: string) => {
    setFormData(prev => ({ ...prev, timeSlot: timeValue }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.id.trim()) tempErrors.id = 'Mã lớp học phần không được để trống';
    else if (!editingClass && classes.some(c => c.id.toLowerCase() === formData.id.toLowerCase().trim())) {
      tempErrors.id = 'Mã lớp học phần này đã tồn tại';
    }
    if (!formData.subjectId) tempErrors.subjectId = 'Vui lòng chọn môn học';
    if (!formData.teacherId) tempErrors.teacherId = 'Vui lòng phân công giảng viên';
    if (!formData.room.trim()) tempErrors.room = 'Phòng học không được để trống';
    if (formData.capacity <= 5) tempErrors.capacity = 'Sĩ số tối đa phải lớn hơn 5';
    if (!formData.startDate) tempErrors.startDate = 'Ngày bắt đầu không được để trống';
    if (!formData.endDate) tempErrors.endDate = 'Ngày kết thúc không được để trống';
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      tempErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const getDayString = (day: number) => {
    if (day === 8) return 'Chủ Nhật';
    return `Thứ ${day}`;
  };

  const handleSave = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    const subjectObj = subjects.find(s => s.id === formData.subjectId);
    const teacherObj = teachers.find(t => t.id === formData.teacherId);

    const scheduleStr = `${getDayString(formData.dayOfWeek)} (${formData.timeSlot})`;

    const sectionPayload = {
      id: formData.id.toUpperCase().trim(),
      subjectId: formData.subjectId,
      subjectName: subjectObj?.name || 'Môn học',
      credits: subjectObj?.credits || 3,
      teacherId: formData.teacherId,
      teacherName: teacherObj?.name || 'Giảng viên',
      schedule: scheduleStr,
      dayOfWeek: formData.dayOfWeek,
      timeSlot: formData.timeSlot,
      room: formData.room.trim(),
      capacity: formData.capacity,
      startDate: formData.startDate,
      endDate: formData.endDate
    };

    if (editingClass) {
      updateClass(editingClass.id, { ...sectionPayload, studentIds: editingClass.studentIds });
      onSuccess(`Đã cập nhật lớp học phần ${sectionPayload.id} thành công!`);
    } else {
      addClass(sectionPayload);
      onSuccess(`Đã tạo lớp học phần ${sectionPayload.id} thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lớp học phần ${id}?`)) {
      deleteClass(id);
      onSuccess(`Đã xóa lớp học phần ${id} thành công!`);
    }
  };

  return {
    classes: filteredClasses,
    subjects: activeSubjects,
    teachers: activeTeachers,
    searchTerm,
    setSearchTerm,
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    isModalOpen,
    setIsModalOpen,
    editingClass,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleTimeChange,
    handleSave,
    handleDelete
  };
}
