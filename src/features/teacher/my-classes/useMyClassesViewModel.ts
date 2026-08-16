import { useState, useEffect } from 'react';
import { teacherApi } from '../../../api/services/teacherApi';

/**
 * ViewModel cho trang "Lớp của tôi" (Teacher My Classes).
 * Lấy dữ liệu từ Backend API thay vì mock store.
 */
export function useMyClassesViewModel(teacherId: string) {
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classAnnouncements, setClassAnnouncements] = useState<any[]>([]);
  
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  /**
   * Lấy ID số nguyên từ đối tượng class.
   * Backend trả về id dạng number (1, 2, 3...) nên dùng trực tiếp.
   */
  const getClassId = (cls: any): number => {
    return Number(cls.id);
  };

  // 1. Fetch danh sách lớp được phân công
  const fetchMyClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const res: any = await teacherApi.getMyClasses();
      const items = res.content || res || [];
      setMyClasses(items);
      if (items.length > 0 && !selectedClass) {
        setSelectedClass(items[0]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách lớp:', error);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, [teacherId]);

  // 2. Fetch danh sách SV và Thông báo khi chọn lớp khác
  useEffect(() => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);

    // Fetch sinh viên
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        const res: any = await teacherApi.getClassStudents(classId);
        setClassStudents(res.content || res || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách sinh viên:', err);
        setClassStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    // Fetch thông báo
    const fetchAnnouncements = async () => {
      try {
        setIsLoadingAnnouncements(true);
        const res: any = await teacherApi.getClassAnnouncements(classId);
        setClassAnnouncements(res.content || res || []);
      } catch (err) {
        console.error('Lỗi khi tải thông báo lớp:', err);
        setClassAnnouncements([]);
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };

    fetchStudents();
    fetchAnnouncements();
  }, [selectedClass]);

  // 3. Đăng thông báo mới cho lớp
  const handlePostAnnouncement = async (onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!annTitle.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề';
    if (!annContent.trim()) tempErrors.content = 'Vui lòng nhập nội dung thông báo';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      setIsPosting(true);
      const classId = getClassId(selectedClass);
      await teacherApi.createAnnouncement(classId, {
        title: annTitle.trim(),
        content: annContent.trim(),
        recipientGroup: 'class'
      });

      // Tải lại danh sách thông báo sau khi đăng thành công
      const annRes: any = await teacherApi.getClassAnnouncements(classId);
      setClassAnnouncements(annRes.content || annRes || []);

      setAnnTitle('');
      setAnnContent('');
      setErrors({});
      onSuccess('Đã đăng thông báo cho lớp học phần thành công!');
    } catch (error: any) {
      onError(error.message || 'Lỗi khi đăng thông báo');
    } finally {
      setIsPosting(false);
    }
  };

  // 4. Xóa thông báo
  const handleDeleteAnnouncement = async (id: string | number, onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo lớp này?')) return;
    if (!selectedClass) return;

    try {
      const classId = getClassId(selectedClass);
      await teacherApi.deleteAnnouncement(classId, Number(id));
      
      // Tải lại danh sách thông báo sau khi xóa
      const annRes: any = await teacherApi.getClassAnnouncements(classId);
      setClassAnnouncements(annRes.content || annRes || []);
      onSuccess('Đã xóa thông báo thành công!');
    } catch (error: any) {
      onError(error.message || 'Lỗi khi xóa thông báo');
    }
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    classStudents,
    classAnnouncements,
    annTitle,
    setAnnTitle,
    annContent,
    setAnnContent,
    errors,
    postAnnouncement: handlePostAnnouncement,
    deleteAnnouncement: handleDeleteAnnouncement,
    isLoadingClasses,
    isLoadingStudents,
    isLoadingAnnouncements,
    isPosting
  };
}
