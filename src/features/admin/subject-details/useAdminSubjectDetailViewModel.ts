import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { Subject } from '../../../models/Subject';

export function useAdminSubjectDetailViewModel(initialSubject: Subject) {
  const [subject, setSubject] = useState<Subject>(initialSubject);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  
  // Search and Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preview State
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [subject.id, page, pageSize]);

  const fetchMaterials = async () => {
    if (!subject.id) return;
    try {
      setIsLoadingMaterials(true);
      const res = await adminApi.getSubjectMaterials(subject.id, page, pageSize);
      const data = res as any;
      // Filter by search term on frontend if backend doesn't support search by filename yet
      let content = data.content || [];
      if (searchTerm) {
        content = content.filter((m: any) => m.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setMaterials(content);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch subject materials:', err);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    // If searchTerm changes, refetch or just filter locally. Here we fetch again if we had a backend search.
    // Since backend doesn't have search for materials yet, we just refilter the loaded page.
    fetchMaterials();
  }, [searchTerm]);

  const clearForm = () => {
    setTitle('');
    setActualFile(null);
    setErrors({});
    setEditingItem(null);
  };

  const handleUpload = async (onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!subject.id) return;
    
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề tài liệu';
    if (!editingItem && !actualFile) tempErrors.file = 'Vui lòng chọn tài liệu cần tải lên';
    if (actualFile && actualFile.size > 50 * 1024 * 1024) {
      tempErrors.file = 'Dung lượng file vượt quá giới hạn 50MB. Vui lòng chọn file nhẹ hơn.';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      setIsUploading(true);
      
      let fileUrl = editingItem?.storageKey;
      let mimeType = editingItem?.mimeType;

      if (actualFile) {
        // Gửi file xuống backend để tải lên Cloudinary
        const uploadRes: any = await adminApi.uploadFile(actualFile);
        fileUrl = uploadRes.result || uploadRes;
        mimeType = actualFile.type || 'application/octet-stream';
      }

      if (editingItem) {
        // Edit flow
        await adminApi.deleteSubjectMaterial(editingItem.id);
      }
      
      // Tạo mới record vào DB
      await adminApi.uploadSubjectMaterial(subject.id, {
        fileName: title,
        storageKey: fileUrl,
        mimeType: mimeType
      });

      onSuccess(editingItem ? 'Cập nhật tài liệu thành công' : 'Tải lên tài liệu thành công');
      setIsModalOpen(false);
      clearForm();
      fetchMaterials();
    } catch (error: any) {
      console.error('Upload failed:', error);
      onError(error.message || 'Lỗi khi tải lên tài liệu');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerRealDownload = (mat: any) => {
    if (mat.storageKey) {
      window.open(mat.storageKey, '_blank');
    }
  };

  const handleDeleteMaterial = async (materialId: number, onSuccess: (msg: string) => void, onError: (msg: string) => void) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    try {
      await adminApi.deleteSubjectMaterial(materialId);
      onSuccess('Đã xóa tài liệu');
      fetchMaterials();
    } catch (err: any) {
      console.error('Delete material failed', err);
      onError(err.message || 'Lỗi khi xóa tài liệu');
    }
  };

  return {
    subject,
    materials,
    isLoadingMaterials,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    isUploading,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    title,
    setTitle,
    actualFile,
    setActualFile,
    errors,
    clearForm,
    handleUpload,
    handleDeleteMaterial,
    previewMaterial,
    setPreviewMaterial,
    triggerRealDownload
  };
}
