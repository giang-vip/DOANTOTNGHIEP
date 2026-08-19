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
  const [subjectMaterials, setSubjectMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'subject' | 'class'>('subject');
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
      
      const [materialsRes, subjectMaterialsRes]: [any, any] = await Promise.all([
        teacherApi.getMaterials(classId),
        teacherApi.getSubjectMaterials(classId)
      ]);

      const items = materialsRes.content || materialsRes || [];
      const subjectItems = subjectMaterialsRes.content || subjectMaterialsRes || [];
      
      const mapItem = (m: any) => {
        const ext = m.fileName ? m.fileName.split('.').pop()?.toLowerCase() : 'pdf';
        let docType: 'pdf' | 'doc' | 'ppt' | 'video' | 'image' = 'pdf';
        if (ext === 'docx' || ext === 'doc') docType = 'doc';
        else if (ext === 'pptx' || ext === 'ppt') docType = 'ppt';
        else if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') docType = 'video';
        else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') docType = 'image';

        return {
          id: String(m.id),
          classId: String(m.classSectionId || ''),
          title: m.title || m.fileName,
          type: docType,
          url: m.fileUrl || m.storageKey,
          fileName: m.fileName,
          fileSize: 'Có sẵn',
          description: m.fileName,
          uploadedAt: m.uploadedAt
        };
      };

      setMaterials(items.map(mapItem));
      setSubjectMaterials(subjectItems.map(mapItem));
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
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredSubjectMaterials = subjectMaterials.filter(m =>
    m.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setActualFile(null);
    setErrors({});
  };

  // Upload tài liệu mới
  const handleUpload = async (onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề tài liệu';
    if (!actualFile) tempErrors.file = 'Vui lòng chọn hoặc kéo thả tài liệu cần tải lên';
    else if (actualFile.size > 50 * 1024 * 1024) {
      tempErrors.file = 'Dung lượng file vượt quá giới hạn 50MB. Vui lòng chọn file nhẹ hơn.';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      setIsLoading(true);
      const classId = getClassId(selectedClass);
      
      await teacherApi.uploadMaterial(classId, title, description, actualFile);
      
      clearForm();
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
    subjectMaterials: filteredSubjectMaterials,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    errors,
    previewMaterial,
    setPreviewMaterial,
    title,
    setTitle,
    description,
    setDescription,
    file,
    setFile,
    actualFile,
    setActualFile,
    isLoadingClasses,
    isLoadingMaterials,
    isLoading: isLoading || isLoadingClasses || isLoadingMaterials,
    activeTab,
    setActiveTab,
    handleFileSelect,
    clearForm,
    uploadMaterial: handleUpload,
    deleteMaterial: handleDelete
  };
}
