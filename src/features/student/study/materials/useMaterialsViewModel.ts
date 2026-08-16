import { useState, useEffect } from 'react';
import { studentApi } from '../../../../api/services/studentApi';
import { LearningMaterial, ClassSection } from '../../../../models';

export function useMaterialsViewModel(selectedClass: ClassSection, triggerToast: (msg: string, type: 'success' | 'danger') => void) {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    studentApi.getMyMaterials(Number(selectedClass.id), 0, 100)
      .then((res: any) => {
        setMaterials(res.content || []);
      })
      .catch(console.error)
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

  return {
    materials,
    searchTerm,
    setSearchTerm,
    previewMaterial,
    setPreviewMaterial,
    loading,
    triggerRealDownload,
    filteredMaterials
  };
}
