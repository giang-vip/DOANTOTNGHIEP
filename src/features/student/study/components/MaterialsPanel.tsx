import React from 'react';
import { Card } from '../../../../components/UI';
import { Eye, Download, FileText } from 'lucide-react';
import { LearningMaterial } from '../../../../types';

/**
 * Interface props cho component MaterialsPanel.
 */
export interface MaterialsPanelProps {
  /** Danh sách học liệu của lớp */
  materials: LearningMaterial[];
  /** Chuỗi tìm kiếm hiện tại */
  searchTerm: string;
  /** Hàm callback để thay đổi chuỗi tìm kiếm */
  setSearchTerm: (val: string) => void;
  /** Hàm callback khi click nút xem trước tài liệu */
  setPreviewMaterial: (mat: LearningMaterial) => void;
  /** Hàm callback để kích hoạt tải tệp tài liệu thật */
  triggerRealDownload: (mat: LearningMaterial) => void;
}

/**
 * Component hiển thị danh sách Tài liệu học tập (MaterialsPanel).
 * Hỗ trợ tìm kiếm nhanh, xem trước trực tiếp, và tải tài liệu về máy.
 */
export function MaterialsPanel({
  materials,
  searchTerm,
  setSearchTerm,
  setPreviewMaterial,
  triggerRealDownload,
}: MaterialsPanelProps) {
  
  /**
   * Trả về icon hoặc tag màu tương ứng với loại tệp tin
   */
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <div className="h-9 w-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-red-150">PDF</div>;
      case 'doc':
        return <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-blue-150">DOC</div>;
      case 'ppt':
        return <div className="h-9 w-9 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-orange-150">PPT</div>;
      case 'video':
        return <div className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[10px] border border-emerald-150">MP4</div>;
      default:
        return <div className="h-9 w-9 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center shrink-0"><FileText className="h-4 w-4" /></div>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ: Tìm kiếm & Tiêu đề */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Kho dữ liệu học liệu học phần</h3>
        <div className="relative w-48">
          <input
            type="text"
            placeholder="Tìm tài liệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 focus:outline bg-white text-slate-850"
          />
        </div>
      </div>

      {/* Grid danh sách tài liệu */}
      {materials.length === 0 ? (
        <Card className="p-12 text-center text-xs text-slate-400 font-medium">
          Không tìm thấy bài giảng hoặc giáo trình nào.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <Card
              key={mat.id}
              className="p-4 flex items-center justify-between gap-3 hover:border-blue-200 transition-all bg-white shadow-3xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                {getFileIcon(mat.type)}
                <div className="min-w-0 space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 truncate" title={mat.title}>
                    {mat.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {mat.fileSize || '2.4 MB'} • Đăng lúc: {new Date(mat.uploadedAt || '').toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Nút xem trước */}
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Xem trước nội dung"
                >
                  <Eye className="h-4 w-4" />
                </button>

                {/* Nút tải tệp */}
                <button
                  type="button"
                  onClick={() => triggerRealDownload(mat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
                  title="Tải tệp"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
