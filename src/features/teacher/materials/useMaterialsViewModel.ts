import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { LearningMaterial, ClassSection } from '../../../types';

export function useMaterialsViewModel(teacherId: string) {
  const { classes, materials, addMaterial, deleteMaterial } = useStore();

  const myClasses = classes.filter(c => c.teacherId === teacherId);

  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Active view material for preview popup
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<{ name: string; size: number; type: string } | null>(null);

  // Set default class
  useEffect(() => {
    if (myClasses.length > 0 && !selectedClass) {
      setSelectedClass(myClasses[0]);
    }
  }, [classes]);

  // Filter materials for selected class
  const classMaterials = selectedClass
    ? materials.filter(m => m.classId === selectedClass.id && m.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const handleFileSelect = (selectedFile: File) => {
    setFile({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });
    // Autopopulate title if blank
    if (!title) {
      const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
      setTitle(nameWithoutExt);
    }
  };

  const handleUpload = (onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề tài liệu';
    if (!file) tempErrors.file = 'Vui lòng chọn hoặc kéo thả tài liệu cần tải lên';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Determine type
    let docType: 'pdf' | 'doc' | 'ppt' | 'video' | 'image' = 'pdf';
    const ext = file!.name.split('.').pop()?.toLowerCase();
    if (ext === 'docx' || ext === 'doc') docType = 'doc';
    else if (ext === 'pptx' || ext === 'ppt') docType = 'ppt';
    else if (ext === 'mp4' || ext === 'mov' || ext === 'avi' || ext === 'mkv') docType = 'video';
    else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') docType = 'image';

    // Mock URL based on type
    let mockUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    if (docType === 'video') {
      mockUrl = 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4';
    } else if (docType === 'image') {
      mockUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800';
    }

    // Size label
    const sizeKB = Math.round(file!.size / 1024);
    const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    addMaterial({
      classId: selectedClass.id,
      title: title.trim(),
      type: docType,
      url: mockUrl,
      fileName: file!.name,
      fileSize: sizeStr,
      description: description.trim()
    });

    setTitle('');
    setDescription('');
    setFile(null);
    setErrors({});
    setIsModalOpen(false);
    onSuccess(`Đã đăng tải tài liệu "${title}" thành công!`);
  };

  const handleDelete = (id: string, name: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài liệu ${name}?`)) {
      deleteMaterial(id);
      onSuccess('Đã xóa tài liệu khỏi lớp học phần.');
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
    deleteMaterial: handleDelete
  };
}
