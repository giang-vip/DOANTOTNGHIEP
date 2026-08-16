import { useState, useEffect } from 'react';
import { teacherApi } from '../../../api/services/teacherApi';

/**
 * ViewModel cho quản lý Tài liệu học tập (Materials) của Giảng viên.
 * Tích hợp toàn bộ API Get/Upload/Delete.
 */
export function useMaterialsViewModel(teacherId: string) {
  const [myClasses, setMyClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  
  const [materials, setMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active view material for preview popup
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);

  // Actual file for API
  const [actualFile, setActualFile] = useState<File | null>(null);
  
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái upload file

  const getClassId = (cls: any): number => {
    return Number(cls.id);
  };

  // 1. Fetch danh sách lớp của GV
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const res: any = await teacherApi.getMyClasses();
        const items = res.content || res || [];
        setMyClasses(items);
        if (items.length > 0 && !selectedClass) {
          setSelectedClass(items[0]);
        }
      } catch (err) {
        console.error('Lỗi lấy lớp học phần:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [teacherId]);

  // 2. Fetch danh sách tài liệu của lớp khi selectedClass thay đổi
  const fetchMaterials = async () => {
    if (!selectedClass) return;
    const classId = getClassId(selectedClass);
    try {
      setIsLoadingMaterials(true);
      const res: any = await teacherApi.getMaterials(classId);
      const items = res.content || res || [];
      
      const mapped = items.map((m: any) => {
        const ext = m.fileName ? m.fileName.split('.').pop()?.toLowerCase() : 'pdf';
        let docType: 'pdf' | 'doc' | 'ppt' | 'video' | 'image' = 'pdf';
        if (ext === 'docx' || ext === 'doc') docType = 'doc';
        else if (ext === 'pptx' || ext === 'ppt') docType = 'ppt';
        else if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') docType = 'video';
        else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') docType = 'image';

        return {
          id: String(m.id),
          classId: String(m.classSectionId),
          title: m.title,
          type: docType,
          url: m.fileUrl,
          fileName: m.fileName,
          fileSize: 'Có sẵn',
          description: m.fileName,
          uploadedAt: m.uploadedAt
        };
      });

      setMaterials(mapped);
    } catch (err) {
      console.error('Lỗi lấy tài liệu học tập:', err);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedClass]);

  // Lọc tài liệu theo từ khóa tìm kiếm
  const classMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (selectedFile: File) => {
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });
    setActualFile(selectedFile);
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setTitle(nameWithoutExt);
    }
  };

  // Upload tài liệu mới
  const handleUpload = async (onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề tài liệu';
    if (!actualFile) tempErrors.file = 'Vui lòng chọn hoặc kéo thả tài liệu cần tải lên';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      setIsLoading(true);
      const classId = getClassId(selectedClass);
      
      await teacherApi.uploadMaterial(classId, title, description, actualFile);
      
      setTitle('');
      setDescription('');
      setFile(null);
      setActualFile(null);
      setErrors({});
      setIsModalOpen(false);
      
      onSuccess(`Đã đăng tải tài liệu "${title}" thành công!`);
      // Reload tài liệu
      fetchMaterials();
    } catch (err: any) {
      console.error('Lỗi khi upload:', err);
      onError(err.message || 'Lỗi tải file lên hệ thống!');
    } finally {
      setIsLoading(false);
    }
  };

  // Xóa tài liệu
  const handleDelete = async (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${name}"?`)) return;

    try {
      await teacherApi.deleteMaterial(Number(id));
      onSuccess('Đã xóa tài liệu khỏi lớp học phần.');
      fetchMaterials();
    } catch (err) {
      console.error('Lỗi khi xóa tài liệu:', err);
    }
  };

  return {
    myClasses,
    selectedClass,
    setSelectedClass,
    materials: classMaterials,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    previewMaterial,
    setPreviewMaterial,
    title,
    setTitle,
    description,
    setDescription,
    file,
    errors,
    handleFileSelect,
    uploadMaterial: handleUpload,
    deleteMaterial: handleDelete,
    isLoading: isLoading || isLoadingClasses || isLoadingMaterials
  };
}
