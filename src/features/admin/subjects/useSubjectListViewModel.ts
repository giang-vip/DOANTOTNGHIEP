import React, { useState } from 'react';
import { useStore } from '../../../models/store';
import { Subject } from '../../../types';

export function useSubjectListViewModel() {
  const { subjects, departments, majors, addSubject, updateSubject, deleteSubject } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Subject>({
    id: '',
    name: '',
    credits: 3,
    department: '',
    majorIds: []
  } as Subject);

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch =
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMajor =
      selectedMajorFilter === 'all' || (Array.isArray(sub.majorIds) && sub.majorIds.includes(selectedMajorFilter));

    return matchesSearch && matchesMajor;
  });

  const openAddModal = () => {
    setEditingSubject(null);
    setFormData({
      id: '',
      name: '',
      credits: 3,
      department: departments[0]?.name || '',
      majorIds: []
    } as Subject);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setFormData({ ...sub, majorIds: sub.majorIds ?? [] });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLSelectElement;
    const { name } = e.target as any;

    if (target.multiple) {
      const selected = Array.from(target.selectedOptions).map(o => o.value);
      setFormData(prev => ({ ...prev, [name]: selected }));
      return;
    }

    const value = (e.target as HTMLInputElement).value;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'credits' ? parseInt(value) || 0 : value
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.id.trim()) tempErrors.id = 'Mã môn học không được để trống';
    else if (!editingSubject && subjects.some(s => s.id.toLowerCase() === formData.id.toLowerCase().trim())) {
      tempErrors.id = 'Mã môn học này đã tồn tại';
    }
    if (!formData.name.trim()) tempErrors.name = 'Tên môn học không được để trống';
    if (formData.credits <= 0 || formData.credits > 10) tempErrors.credits = 'Số tín chỉ phải từ 1 đến 10';
    if (!formData.majorIds || formData.majorIds.length === 0) tempErrors.majorIds = 'Vui lòng chọn ít nhất một ngành áp dụng';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
      onSuccess(`Đã cập nhật môn học ${formData.name} thành công!`);
    } else {
      addSubject({
        id: formData.id.toUpperCase().trim(),
        name: formData.name.trim(),
        credits: formData.credits,
        department: formData.department,
        majorIds: formData.majorIds ?? []
      });
      onSuccess(`Đã thêm mới môn học ${formData.name} thành công!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa môn học ${name}?`)) {
      deleteSubject(id);
      onSuccess(`Đã xóa môn học ${name} thành công!`);
    }
  };

  return {
    subjects: filteredSubjects,
    departments,
    majors,
    searchTerm,
    setSearchTerm,
    selectedMajorFilter,
    setSelectedMajorFilter,
    isModalOpen,
    setIsModalOpen,
    editingSubject,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleSave,
    handleDelete
  };
}
