import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Subject } from '../../../models/Subject';
import { useSearchParams } from 'react-router-dom';

export function useMajorSubjectListViewModel() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allGlobalSubjects, setAllGlobalSubjects] = useState<Subject[]>([]); // For the dropdown
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [majorName, setMajorName] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    subjectId: 0,
    semesterIndex: 1,
    type: 'COMPULSORY'
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const majorIdFromUrl = searchParams.get('majorId');
  const departmentIdFromUrl = searchParams.get('departmentId'); // just to keep for back nav

  const fetchIdRef = useRef(0);

  const fetchMajorSubjects = async () => {
    if (!majorIdFromUrl) return;
    
    const fetchId = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAllSubjects(page, pageSize, debouncedSearch, undefined, Number(majorIdFromUrl));
      if (fetchId !== fetchIdRef.current) return;

      setSubjects(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);

      // Fetch major name if missing
      if (!majorName && majorIdFromUrl) {
        adminApi.getMajorById(Number(majorIdFromUrl))
          .then(major => {
             if (fetchId === fetchIdRef.current && major) {
               setMajorName(major.name);
             }
          })
          .catch(e => console.error(e));
      }
    } catch (err: any) {
      if (fetchId !== fetchIdRef.current) return;
      setError(err.message || 'Lỗi khi tải dữ liệu môn học của ngành');
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const fetchGlobalSubjects = async () => {
    try {
      const data = await adminApi.getAllSubjectsList();
      setAllGlobalSubjects(data || []);
    } catch (err) {
      console.error('Lỗi lấy kho môn học', err);
    }
  };

  useEffect(() => {
    if (majorIdFromUrl) {
      fetchMajorSubjects();
    }
  }, [page, pageSize, debouncedSearch, majorIdFromUrl]);

  useEffect(() => {
    if (isModalOpen && allGlobalSubjects.length === 0) {
      fetchGlobalSubjects();
    }
  }, [isModalOpen]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.subjectId) newErrors.subjectId = 'Vui lòng chọn môn học';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['semesterIndex', 'subjectId'].includes(name) ? Number(value) : value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      subjectId: 0,
      semesterIndex: 1,
      type: 'COMPULSORY'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: Subject) => {
    setEditingItem(item);
    setFormData({
      subjectId: item.id!,
      semesterIndex: item.semesterIndex || 1,
      type: item.type || 'COMPULSORY'
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate() || !majorIdFromUrl) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        if (editingItem.id !== formData.subjectId) {
          await adminApi.removeSubjectFromMajor(Number(majorIdFromUrl), editingItem.id);
          await adminApi.addSubjectToMajor(Number(majorIdFromUrl), {
            subjectId: formData.subjectId,
            semesterIndex: formData.semesterIndex,
            type: formData.type
          });
        } else {
          await adminApi.updateSubjectInMajor(Number(majorIdFromUrl), editingItem.id, {
            semesterIndex: formData.semesterIndex,
            type: formData.type
          });
        }
        onSuccess(`Đã cập nhật khung chương trình thành công!`);
      } else {
        await adminApi.addSubjectToMajor(Number(majorIdFromUrl), {
          subjectId: formData.subjectId,
          semesterIndex: formData.semesterIndex,
          type: formData.type
        });
        onSuccess(`Đã thêm môn học vào khung chương trình thành công!`);
      }
      setIsModalOpen(false);
      fetchMajorSubjects();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (subjectId: number, subjectName: string, onSuccess: (msg: string) => void) => {
    if (!majorIdFromUrl) return;
    if (window.confirm(`Bạn có chắc chắn muốn rút môn học "${subjectName}" ra khỏi khung chương trình của ngành này?`)) {
      setIsLoading(true);
      try {
        await adminApi.removeSubjectFromMajor(Number(majorIdFromUrl), subjectId);
        onSuccess(`Đã rút môn ${subjectName} khỏi ngành thành công!`);
        fetchMajorSubjects();
      } catch (err: any) {
        setError(err.message || 'Lỗi khi xóa môn học');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    subjects,
    allGlobalSubjects,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
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
    handleSave,
    handleDelete,
    setSearchParams,
    departmentIdFromUrl,
    majorIdFromUrl,
    majorName
  };
}
