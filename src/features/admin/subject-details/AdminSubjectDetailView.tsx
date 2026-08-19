import React, { useRef } from 'react';
import { Subject } from '../../../models/Subject';
import { useAdminSubjectDetailViewModel } from './useAdminSubjectDetailViewModel';
import { ChevronLeft, BookOpen, Download, Trash2, Search, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { Card, Table, Pagination, FormInput, Modal, FileUploader } from '../../../components/UI';
import { DocumentPreviewer } from '../../../components/DocumentPreviewer';
import { Eye, Edit } from 'lucide-react';

interface AdminSubjectDetailViewProps {
  subject: Subject;
  onBack: () => void;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function AdminSubjectDetailView({ subject: initialSubject, onBack, triggerToast }: AdminSubjectDetailViewProps) {
  const {
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
    setPreviewMaterial
  } = useAdminSubjectDetailViewModel(initialSubject);

  const handleFileSelect = (file: File | null) => {
    setActualFile(file);
    if (file && !title) {
      setTitle(file.name.split('.')[0]); // Autofill title
    }
  };

  const openUploadModal = () => {
    clearForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    clearForm();
    setEditingItem(item);
    setTitle(item.fileName);
    setIsModalOpen(true);
  };

  const materialColumns = [
    {
      header: 'Tên tài liệu',
      accessor: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-800 truncate" title={item.fileName}>
              {item.fileName}
            </p>
            <p className="text-xs text-slate-500">
              Đăng bởi: {item.uploadedBy || 'Hệ thống'} • {new Date(item.uploadedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Thao tác',
      accessor: (item: any) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => setPreviewMaterial({
              ...item,
              title: item.fileName,
              url: item.storageKey,
              type: item.mimeType?.includes('video') ? 'video' : item.mimeType?.includes('image') ? 'image' : 'pdf'
            })}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Xem trước"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => openEditModal(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
            title="Thay thế file (Sửa)"
          >
            <Edit className="h-4 w-4" />
          </button>
          <a
            href={item.storageKey}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            title="Tải xuống"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={() => handleDeleteMaterial(item.id, (msg) => triggerToast(msg, 'success'), (msg) => triggerToast(msg, 'danger'))}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <button
          onClick={onBack}
          className="w-fit px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-sm mb-2"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Quay lại danh sách môn học
        </button>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Chi tiết Môn học: {subject.name}
        </h2>
        <p className="text-sm text-slate-500">Mã môn: {subject.code} | Số tín chỉ: {subject.credits}</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Tài liệu gốc của Môn học</h3>
              <p className="text-xs text-slate-500">Tài liệu quy chuẩn áp dụng cho tất cả các lớp của môn này</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tài liệu..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
            
            <button
              onClick={openUploadModal}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  Tải lên
                </>
              )}
            </button>
          </div>
        </div>

        {isLoadingMaterials ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {materials.length > 0 ? (
              <>
                <Table 
                  columns={materialColumns}
                  data={materials}
                />
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={setPage}
                  pageSize={pageSize}
                />
              </>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-slate-700 font-medium mb-1">Chưa có tài liệu nào</h4>
                <p className="text-sm text-slate-500 mb-4">
                  Bấm "Tải lên" để thêm tài liệu cho môn học này
                </p>
                <button
                  onClick={openUploadModal}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Tải lên ngay
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Thay Thế Tài Liệu" : "Đăng Tải Tài Liệu"}
        footer={
          <>
            <button
              onClick={() => handleUpload(
                (msg) => triggerToast(msg, 'success'),
                (msg) => triggerToast(msg, 'danger')
              )}
              disabled={isUploading}
              className={`px-4 py-2 ${isUploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'} text-white text-sm font-semibold rounded-lg transition-colors`}
            >
              {isUploading ? 'Đang xử lý...' : 'Xác nhận'}
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
            placeholder="Nhập tên tài liệu..."
            error={errors.title}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              {editingItem ? "File thay thế (Tùy chọn)" : "Tải lên file"}
            </label>
            <FileUploader onFileSelect={handleFileSelect} />
            {actualFile && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold truncate max-w-[240px]">{actualFile.name}</span>
                <span className="text-slate-400">({Math.round(actualFile.size / 1024)} KB)</span>
              </div>
            )}
            {!actualFile && editingItem && (
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-600">
                <span className="text-slate-400">Đang giữ nguyên file cũ: {editingItem.fileName}</span>
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
          title={`Xem tài liệu: ${previewMaterial.title}`}
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
