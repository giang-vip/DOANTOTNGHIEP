import React from 'react';
import { useMaterialsViewModel } from './useMaterialsViewModel';
import { Card, Modal, FormInput, FileUploader, Badge } from '../../../components/UI';
import { DocumentPreviewer } from '../../../components/DocumentPreviewer';
import { FileText, FileVideo, HelpCircle, Search, Plus, Trash2, Eye, Download, FileUp, X } from 'lucide-react';

interface MaterialsViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function MaterialsView({ teacherId, triggerToast }: MaterialsViewProps) {
  const {
    myClasses,
    selectedClass,
    setSelectedClass,
    materials,
    subjectMaterials,
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
    uploadMaterial,
    deleteMaterial,
    isLoading,
    activeTab,
    setActiveTab
  } = useMaterialsViewModel(teacherId);

  const triggerRealDownload = (mat: any) => {
    const fileUrl = mat.fileUrl || mat.url;
    if (fileUrl) {
      window.open(fileUrl, '_blank');
      triggerToast(`Đang tải tệp học liệu: "${mat.fileName}"`, 'success');
    } else {
      triggerToast('Không tìm thấy đường dẫn tải tệp của học liệu.', 'danger');
    }
  };

  const handleUploadAction = () => {
    uploadMaterial(
      (msg) => triggerToast(msg, 'success'),
      (msg) => triggerToast(msg, 'danger')
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <div className="h-10 w-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border border-red-150">PDF</div>;
      case 'doc':
        return <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border border-blue-150">DOC</div>;
      case 'ppt':
        return <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border border-orange-150">PPT</div>;
      case 'video':
        return <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-150">MP4</div>;
      case 'image':
        return <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs border border-purple-150">IMG</div>;
      default:
        return <div className="h-10 w-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center shrink-0"><FileText className="h-5 w-5" /></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with class choice */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tài Liệu Học Tập</h2>
          <p className="text-xs text-slate-500">Đăng tải slide bài giảng, giáo trình PDF, tóm tắt lý thuyết hoặc video thực hành</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-56">
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const found = myClasses.find(c => String(c.id) === e.target.value);
                if (found) setSelectedClass(found);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
            >
              {myClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.sectionCode || `LHP-${cls.id}`} - {cls.subjectName}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Đăng tài liệu
            </button>
          )}
        </div>
      </div>

      {selectedClass ? (
        <div className="space-y-5">
          {/* Tabs and Search bar */}
          <Card className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
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
                Tài liệu Lớp
              </button>
            </div>
            
            <div className="relative max-w-xs w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên tài liệu..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white"
              />
            </div>
          </Card>

          {/* Grid of Materials */}
          {(activeTab === 'subject' ? subjectMaterials : materials).length === 0 ? (
            <Card className="p-16 text-center text-slate-450 border-dashed">
              <FileUp className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              {activeTab === 'subject' 
                ? 'Không có tài liệu gốc nào cho môn học này.' 
                : 'Chưa có tài liệu nào tải lên cho lớp học phần này. Hãy kích hoạt "Đăng tài liệu".'
              }
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeTab === 'subject' ? subjectMaterials : materials).map((mat: any) => (
                <Card key={mat.id} className="p-5 flex flex-col justify-between hover:border-blue-300 transition-all group">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      {getFileIcon(mat.type)}
                      {activeTab === 'class' && (
                        <button
                          onClick={() => deleteMaterial(mat.id, mat.title || mat.fileName, (msg: string) => triggerToast(msg, 'success'))}
                          className="text-slate-350 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors" title={mat.title || mat.fileName}>
                        {mat.title || mat.fileName}
                      </h4>
                      {mat.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {mat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400 font-medium">
                      <span>{mat.fileSize}</span>
                      <span className="mx-1.5">•</span>
                      <span>{new Date(mat.uploadedAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewMaterial(mat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        title="Xem trực quan"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerRealDownload(mat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-650 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Tải xuống bản gốc"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="p-16 text-center text-slate-400 text-sm font-medium">
          Vui lòng chọn một lớp để xem danh mục tài liệu.
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng Tải Tài Liệu Học Tập"
        footer={
          <>
            <button
              onClick={handleUploadAction}
              disabled={isLoading}
              className={`px-4 py-2 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white text-sm font-semibold rounded-lg transition-colors`}
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận tải lên'}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormInput
            label="Tiêu đề tài liệu"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Chương 1 - Nhập môn..."
            error={errors.title}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Mô tả ngắn gọn
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Nhập ghi chú cho học viên..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-750"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Tải lên tài liệu gốc
            </label>
            <FileUploader onFileSelect={handleFileSelect} />
            {file && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold truncate max-w-[240px]">{file.name}</span>
                <span className="text-slate-400">({Math.round(file.size / 1024)} KB)</span>
              </div>
            )}
            {errors.file && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.file}</p>}
          </div>
        </div>
      </Modal>

      {/* Visual Preview Modal */}
      {previewMaterial && (
        <Modal
          isOpen={!!previewMaterial}
          onClose={() => setPreviewMaterial(null)}
          title={`Xem tài liệu học liệu`}
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
