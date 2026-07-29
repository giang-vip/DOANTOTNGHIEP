import React, { useState, useMemo } from 'react';
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
  const { classes, subjects, teachers, departments, majors, getMajorsByDepartment, addClass, updateClass, deleteClass } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('all');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active Teachers & Subjects lists
  const activeTeachers = teachers.filter(t => t.status === 'active');

  // For form selection we will limit subjects by selected major (if chosen)
  const [formData, setFormData] = useState({
    id: '',
    departmentId: '',
    majorId: '',
    subjectId: '',
    teacherId: '',
    dayOfWeek: 2, // Thứ Hai
    timeSlot: '07:00 - 09:30',
    room: '',
    capacity: 40,
    startDate: '2026-06-01',
    endDate: '2026-08-30'
  });

  // Compute filtered subject options for form based on selected major
  const availableSubjectsForForm = useMemo(() => {
    if (!formData.majorId) return [] as typeof subjects;
    return subjects.filter(s => Array.isArray(s.majorIds) && s.majorIds!.includes(formData.majorId));
  }, [subjects, formData.majorId]);

  // Controller-level filters for table (dept->major->subject hierarchy)
  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.subjectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cls.room || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = selectedDepartmentFilter === 'all' || (cls.majorId && majors.find(m => m.id === cls.majorId)?.departmentId === selectedDepartmentFilter);
    const matchesMajor = selectedMajorFilter === 'all' || cls.majorId === selectedMajorFilter;
    const matchesSub = selectedSubjectFilter === 'all' || cls.subjectId === selectedSubjectFilter;

    const status = getClassStatus(cls.startDate, cls.endDate);
    const matchesStatus = selectedStatusFilter === 'all' || status === selectedStatusFilter;

    return matchesSearch && matchesDept && matchesMajor && matchesSub && matchesStatus;
  });

  const openAddModal = () => {
    setEditingClass(null);

    // default department & major selection: try to pick first department and its first major
    const defaultDept = departments[0]?.id || '';
    const majorsForDefaultDept = defaultDept ? getMajorsByDepartment(defaultDept) : [];
    const defaultMajor = majorsForDefaultDept[0]?.id || '';
    const defaultSubject = subjects.find(s => Array.isArray(s.majorIds) && s.majorIds!.includes(defaultMajor))?.id || '';

    setFormData({
      id: '',
      departmentId: defaultDept,
      majorId: defaultMajor,
      subjectId: defaultSubject,
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

    // determine department from class.majorId
    const majorObj = cls.majorId ? majors.find(m => m.id === cls.majorId) : undefined;
    const departmentId = majorObj?.departmentId || '';

    setFormData({
      id: cls.id,
      departmentId,
      majorId: cls.majorId || '',
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

    // When changing department, reset major & subject
    if (name === 'departmentId') {
      const majorsForDept = value ? getMajorsByDepartment(value) : [];
      const firstMajor = majorsForDept[0]?.id || '';
      const firstSubjectForMajor = subjects.find(s => Array.isArray(s.majorIds) && s.majorIds!.includes(firstMajor))?.id || '';
      setFormData(prev => ({ ...prev, departmentId: value, majorId: firstMajor, subjectId: firstSubjectForMajor }));
      return;
    }

    if (name === 'majorId') {
      // When changing major, reset subject to first available for that major
      const firstSubject = subjects.find(s => Array.isArray(s.majorIds) && s.majorIds!.includes(value))?.id || '';
      setFormData(prev => ({ ...prev, majorId: value, subjectId: firstSubject }));
      return;
    }

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

    if (!formData.departmentId) tempErrors.departmentId = 'Vui lòng chọn khoa';
    if (!formData.majorId) tempErrors.majorId = 'Vui lòng chọn ngành áp dụng';
    if (!formData.subjectId) tempErrors.subjectId = 'Vui lòng chọn môn học';
    else {
      // ensure the subject belongs to the chosen major
      const subj = subjects.find(s => s.id === formData.subjectId);
      if (subj && Array.isArray(subj.majorIds) && !subj.majorIds!.includes(formData.majorId)) {
        tempErrors.subjectId = 'Môn học không thuộc ngành đã chọn';
      }
    }

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
    const majorObj = majors.find(m => m.id === formData.majorId);

    const scheduleStr = `${getDayString(formData.dayOfWeek)} (${formData.timeSlot})`;

    const sectionPayload: any = {
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
      endDate: formData.endDate,
      majorId: formData.majorId,
      majorName: majorObj?.name || ''
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

  // Expose helper lists
  const majorsForSelectedDept = selectedDepartmentFilter === 'all' ? majors : getMajorsByDepartment(selectedDepartmentFilter);

  return {
    classes: filteredClasses,
    subjects,
    teachers: activeTeachers,
    departments,
    majors,
    majorsForSelectedDept,

    // Form helpers
    formData,
    setFormData,
    availableSubjectsForForm,

    // Filters
    searchTerm,
    setSearchTerm,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedMajorFilter,
    setSelectedMajorFilter,
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,

    // Modal & actions
    isModalOpen,
    setIsModalOpen,
    editingClass,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleTimeChange,
    handleSave,
    handleDelete
  };
}
