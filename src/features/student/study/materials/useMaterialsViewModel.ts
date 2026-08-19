import { useState, useEffect } from 'react';
import { studentApi } from '../../../../api/services/studentApi';
import { LearningMaterial, ClassSection } from '../../../../models';

export function useMaterialsViewModel(selectedClass: ClassSection, triggerToast: (msg: string, type: 'success' | 'danger') => void) {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [subjectMaterials, setSubjectMaterials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'subject' | 'class'>('subject');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      studentApi.getMaterials(Number(selectedClass.id), 0, 100),
      studentApi.getSubjectMaterials(Number(selectedClass.id), 0, 100)
    ]).then(([materialsRes, subjectMaterialsRes]: [any, any]) => {
      
      const mapItem = (m: any) => {
        let docType = 'document';
        if (m.mimeType) {
          if (m.mimeType.includes('pdf') || m.mimeType.includes('msword') || m.mimeType.includes('officedocument.wordprocessingml')) docType = 'pdf';
          else if (m.mimeType.includes('video')) docType = 'video';
          else if (m.mimeType.includes('image')) docType = 'image';
        }
        return {
          id: String(m.id),
          classId: String(selectedClass.id),
          title: m.title || m.fileName,
          type: docType,
          url: m.fileUrl || m.storageKey,
          fileUrl: m.fileUrl || m.storageKey,
          fileName: m.fileName,
          fileSize: 'Có sẵn',
          description: m.description || m.fileName,
          uploadedAt: m.uploadedAt
        };
      };

      setMaterials((materialsRes.content || []).map(mapItem));
      setSubjectMaterials((subjectMaterialsRes.content || []).map(mapItem));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedClass.id]);

  const triggerRealDownload = (mat: LearningMaterial) => {
    if (mat.fileUrl || mat.url) {
      window.open(mat.fileUrl || mat.url, '_blank');
      triggerToast(`Đang mở tệp học liệu: "${mat.fileName}"`, 'success');
    } else {
      triggerToast(`Tệp học liệu "${mat.fileName}" không có đường dẫn hợp lệ.`, 'danger');
    }
  };

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjectMaterials = subjectMaterials.filter(m =>
    m.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    materials,
    subjectMaterials,
    searchTerm,
    setSearchTerm,
    previewMaterial,
    setPreviewMaterial,
    loading,
    triggerRealDownload,
    filteredMaterials,
    filteredSubjectMaterials,
    activeTab,
    setActiveTab
  };
}
