import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Enrollment, EnrollmentRequest } from '../../../models/Enrollment';
import { Student } from '../../../models/Student';
import { ClassSection } from '../../../models/ClassSection';

export function useEnrollmentListViewModel() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Enrollment | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<EnrollmentRequest>({
    studentId: 0,
    classSectionId: 0,
    note: '',
    status: 'ENROLLED'
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [enrollmentData, studentData, classSectionData] = await Promise.all([
        adminApi.getAllEnrollments(),
        adminApi.getAllStudents(),
        adminApi.getAllClassSections()
      ]);
      setEnrollments((enrollmentData as any)?.content || enrollmentData || []);
      setStudents((studentData as any)?.content || studentData || []);
      setClassSections((classSectionData as any)?.content || classSectionData || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu đăng ký học');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredItems = enrollments.filter(item => 
    item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sectionCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      studentId: students.length > 0 ? students[0].id! : 0,
      classSectionId: classSections.length > 0 ? classSections[0].id! : 0,
      note: '',
      status: 'ENROLLED'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Enrollment) => {
    setEditingItem(item);
    setFormData({ 
      studentId: item.studentId,
      classSectionId: item.classSectionId,
      note: item.note || '',
      status: item.status || 'ENROLLED'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'studentId' || name === 'classSectionId') ? Number(value) : value 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!formData.studentId) tempErrors.studentId = 'Vui lòng chọn sinh viên';
    if (!formData.classSectionId) tempErrors.classSectionId = 'Vui lòng chọn lớp học phần';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        await adminApi.updateEnrollment(editingItem.id, formData);
        onSuccess(`Đã cập nhật đăng ký học thành công!`);
      } else {
        await adminApi.createEnrollment(formData);
        onSuccess(`Đã thêm đăng ký học phần thành công!`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa đăng ký này?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteEnrollment(id);
        onSuccess(`Đã xóa đăng ký thành công!`);
        fetchData();
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa đăng ký');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    enrollments: filteredItems,
    students,
    classSections,
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
