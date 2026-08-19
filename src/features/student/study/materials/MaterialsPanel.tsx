import React from 'react';
import { Card, Badge, Modal } from '../../../../components/UI';
import { FileText, PlayCircle, Image as ImageIcon, Download, Search, RefreshCw, Eye } from 'lucide-react';
import { ClassSection, LearningMaterial } from '../../../../models';
import { DocumentPreviewer } from '../../../../components/DocumentPreviewer';
import { useMaterialsViewModel } from './useMaterialsViewModel';

export interface MaterialsPanelProps {
  selectedClass: ClassSection;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function MaterialsPanel({ selectedClass, triggerToast }: MaterialsPanelProps) {
  const {
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
  } = useMaterialsViewModel(selectedClass, triggerToast);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': case 'doc': return <FileText className="h-4 w-4 text-rose-500" />;
      case 'video': return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-emerald-500" />;
      default: return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('subject')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'subject' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Tài liệu Môn học (Gốc)
          </button>
          <button
            onClick={() => setActiveTab('class')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'class' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Tài liệu Lớp (Giảng viên)
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm học liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white shadow-3xs"
          />
          <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400">Đang tải tài liệu...</div>
      ) : (activeTab === 'subject' ? filteredSubjectMaterials : filteredMaterials).length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400 font-medium">
          Không tìm thấy tài liệu nào phù hợp.
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(activeTab === 'subject' ? filteredSubjectMaterials : filteredMaterials).map((mat: any) => (
            <Card key={mat.id} className="p-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] bg-white group">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shrink-0">
                    {getFileIcon(mat.type)}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors" title={mat.title || mat.fileName}>
                    {mat.title || mat.fileName}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                  {mat.description || mat.fileName}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
                <span className="text-[9px] text-slate-400 font-medium">
                  {new Date(mat.uploadedAt || '').toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Xem trước"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => triggerRealDownload({ ...mat, fileUrl: mat.storageKey || mat.fileUrl })}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    title="Tải xuống"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {previewMaterial && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewMaterial(null)}
          title={`Xem trước: ${previewMaterial.title}`}
          size="xl"
        >
          <DocumentPreviewer 
            material={previewMaterial} 
            onClose={() => setPreviewMaterial(null)}
          />
        </Modal>
      )}
    </div>
  );
}
