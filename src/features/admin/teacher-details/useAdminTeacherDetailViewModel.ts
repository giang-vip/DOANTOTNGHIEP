import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Teacher } from '../../../models/Teacher';

export function useAdminTeacherDetailViewModel(initialTeacher: Teacher) {
  const [teacher, setTeacher] = useState<Teacher>(initialTeacher);
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  
  // Pagination for classes
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchClasses();
  }, [teacher.id, page, pageSize]);

  const fetchClasses = async () => {
    if (!teacher.id) return;
    try {
      setIsLoadingClasses(true);
      const res = await adminApi.getTeacherClasses(teacher.id, undefined, undefined, page, pageSize);
      const data = res as any;
      setClasses(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch teacher classes:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  return {
    teacher,
    setTeacher,
    classes,
    isLoadingClasses,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    selectedClass,
    setSelectedClass
  };
}
