import React, { useState } from 'react';
import { FileText, Download, X, AlertCircle, File, Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from './UI';

import { LearningMaterial } from '../models';

interface DocumentPreviewerProps {
  material: LearningMaterial;
  onClose?: () => void;
  showDownloadOnly?: boolean;
}

export function DocumentPreviewer({ material, onClose, showDownloadOnly = false }: DocumentPreviewerProps) {
  const fileUrl = material.url || (material as any).fileUrl;
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRealDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      alert('Không tìm thấy đường dẫn tải tệp.');
    }
  };

  if (showDownloadOnly) {
    return (
      <button
        type="button"
        onClick={handleRealDownload}
        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-200 cursor-pointer shadow-3xs inline-flex items-center gap-1.5"
        title={`Tải về ${material.fileName}`}
      >
        <Download className="h-3.5 w-3.5" />
        <span>Tải về thật</span>
      </button>
    );
  }

  // Determine Icon base on type
  const getFileIcon = () => {
    switch (material.type) {
      case 'pdf':
        return <FileText className="h-10 w-10 text-rose-500 shrink-0" />;
      default:
        return <File className="h-10 w-10 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className={`bg-slate-50 border border-slate-200 overflow-hidden shadow-lg flex flex-col w-full font-sans transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-[9999] rounded-2xl h-auto' : 'rounded-2xl h-[75vh] min-h-[600px]'}`}>
      
      {/* Control / Info Header */}
      <div className="bg-white px-5 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-xl">
            {getFileIcon()}
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-2">
              <span>{material.title}</span>
              <Badge variant={material.type === 'pdf' ? 'danger' : 'info'} className="text-[9px] uppercase tracking-wider scale-90">
                {material.type}
              </Badge>
            </h3>
            <p className="text-[10px] text-slate-450 mt-1 font-semibold flex items-center gap-1.5">
              <span>Tên tệp: <strong>{material.fileName}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Dung lượng: <strong>{material.fileSize}</strong></span>
            </p>
          </div>
        </div>

        {/* Action button row */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200/50"
            title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
          >
            {isFullscreen ? <Minimize2 className="h-4.5 w-4.5" /> : <Maximize2 className="h-4.5 w-4.5" />}
          </button>
          
          <button
            type="button"
            onClick={handleRealDownload}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
          >
            <Download className="h-4 w-4" />
            Tải về tệp thật
          </button>
          
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200/50"
              title="Đóng xem trước"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Work Canvas */}
      <div className="flex-1 bg-slate-100 relative overflow-auto p-4 flex justify-center items-center">
        {fileUrl ? (
          material.type === 'pdf' || material.fileName.toLowerCase().endsWith('.pdf') ? (
            <div className="w-full h-full flex flex-col items-center">
              <iframe
                src={`${fileUrl}#toolbar=0`}
                className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-inner"
                title={material.title}
              />
            </div>
          ) : ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].some(ext => material.fileName.toLowerCase().endsWith('.' + ext)) ? (
            <div className="w-full h-full flex flex-col items-center">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                className="w-full h-full border border-slate-200 rounded-xl bg-white shadow-inner"
                title={material.title}
              />
            </div>
          ) : material.type === 'image' || ['png', 'jpg', 'jpeg', 'gif', 'webp'].some(ext => material.fileName.toLowerCase().endsWith('.' + ext)) ? (
            <div className="max-w-full max-h-full flex items-center justify-center p-4">
              <img
                src={fileUrl}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg border border-slate-200"
                alt={material.title}
              />
            </div>
          ) : (
            /* Other files (ZIP, DOCX, etc.) download card */
            <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
              <div className="mx-auto h-20 w-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
                <FileText className="h-10 w-10 text-indigo-500" />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-850">{material.title}</h4>
                <p className="text-xs text-slate-400 font-semibold italic">Tệp đính kèm: {material.fileName}</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Badge variant="info" className="text-[9px] font-mono tracking-widest uppercase">{material.type || 'FILE'}</Badge>
                  <Badge variant="gray" className="text-[9px] font-mono font-bold">{material.fileSize}</Badge>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {material.description || 'Học liệu tải về trực tiếp. Nhấp vào nút bên dưới để tải tệp gốc về thiết bị.'}
              </p>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleRealDownload}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Tải Xuống Tệp Thật (.zip/.docx)
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl max-w-sm">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
            <p className="text-xs text-slate-600 font-semibold">Không tìm thấy đường dẫn tệp trực tuyến.</p>
          </div>
        )}
      </div>
    </div>
  );
}
