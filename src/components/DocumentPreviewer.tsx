import React, { useState } from 'react';
import { FileText, Download, Eye, X, File, FileCode, Video, Image as ImageIcon, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { Badge } from './UI';

interface DocumentPreviewerProps {
  material: {
    id: string;
    title: string;
    type: 'pdf' | 'doc' | 'ppt' | 'video' | string;
    fileName: string;
    fileSize: string;
    uploadedAt?: string;
    description?: string;
    url?: string;
  };
  onClose?: () => void;
  showDownloadOnly?: boolean;
}

export function DocumentPreviewer({ material, onClose, showDownloadOnly = false }: DocumentPreviewerProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 5; // standard slide count for mockup preview

  // Dynamic content generator for downloading
  const handleRealDownload = () => {
    // Generate a mockup mock content blob for actual download
    const mockContent = `Trường Đại Học Hưng Nhân (Học Viện Công Nghệ & Khảo Thí)
Tài liệu học tập chính thức: ${material.title}
File đính kèm gốc: ${material.fileName}
Dung lượng: ${material.fileSize}
Mã tài liệu học liệu: ${material.id}
Ngày đăng tải: ${material.uploadedAt || new Date().toISOString()}

Mô tả bài học:
${material.description || 'Không có mô tả chi tiết từ giảng viên.'}

---
Nội dung tài liệu học tập được phân phối độc quyền trên Cổng Thông Tin Đào Tạo của Đại học Hưng Nhân.
Nghiêm cấm sao chép, chia sẻ hoặc bán lại tài liệu học tập này ra ngoài dưới mọi hình thức trái phép.
Chúc các bạn sinh viên học tập đạt kết quả tốt nhất!`;

    // Create file blob
    const blob = new Blob([mockContent], { type: 'text/plain;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    // Create anchor element and dispatch click
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = material.fileName;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
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
      case 'ppt':
        return <FileCode className="h-10 w-10 text-amber-500 shrink-0" />;
      case 'video':
        return <Video className="h-10 w-10 text-blue-500 shrink-0" />;
      default:
        return <File className="h-10 w-10 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-lg flex flex-col w-full h-[650px] font-sans">
      
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
      <div className="flex-1 bg-slate-150 relative overflow-auto p-6 flex justify-center items-center">
        
        {/* PDF / Slide Preview Layout */}
        {material.type === 'pdf' && (
          <div className="flex flex-col items-center gap-4 max-w-full">
            {/* Real or High Fidelity Mock Slide Card */}
            <div 
              className="bg-white shadow-xl border border-slate-300/80 p-8 sm:p-12 md:p-16 rounded-xs w-[620px] max-w-full aspect-[4/3] flex flex-col justify-between transition-transform duration-150 select-none text-slate-850"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            >
              {/* Slide Header */}
              <div className="border-b border-slate-200 pb-3 flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider">
                <span>ĐẠI HỌC HƯNG NHÂN • KHOA CNTT</span>
                <span>CHƯƠNG TRÌNH ĐÀO TẠO CHUẨN</span>
              </div>

              {/* Slide Body Content base on current mockup page */}
              <div className="flex-1 flex flex-col justify-center space-y-4 py-4 text-center">
                {currentPage === 1 && (
                  <div className="space-y-3">
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                      Slide trang 1 / 5
                    </span>
                    <h2 className="text-lg font-extrabold font-serif text-slate-900 leading-tight uppercase">
                      {material.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Giáo trình bài giảng lý thuyết chính quy</p>
                    <div className="h-1 w-16 bg-blue-600 mx-auto rounded-full mt-2"></div>
                  </div>
                )}

                {currentPage === 2 && (
                  <div className="text-left space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 border-l-3 border-blue-600 pl-2 uppercase tracking-wide">
                      1. GIỚI THIỆU CHUNG (OVERVIEW)
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Mục tiêu của bài giảng này nhằm giúp sinh viên tiếp thu và hiện thực hóa đúng chuẩn các khái niệm cốt lõi:
                    </p>
                    <ul className="text-[10px] text-slate-500 font-semibold space-y-1.5 pl-4 list-disc leading-relaxed">
                      <li>Phân tích chi tiết cấu trúc nghiệp vụ của hệ thống</li>
                      <li>Nắm vững quy tắc thiết kế cấu trúc dữ liệu mô phỏng thực tế</li>
                      <li>Thực hành viết mã nguồn hướng đối tượng tối ưu hiệu năng</li>
                    </ul>
                  </div>
                )}

                {currentPage === 3 && (
                  <div className="text-left space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 border-l-3 border-blue-600 pl-2 uppercase tracking-wide">
                      2. CẤU TRÚC NGHIỆP VỤ & NGUYÊN LÝ
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Các yếu tố tác động và hỗ trợ cho quá trình học tập được chuẩn hóa toàn bộ trên hệ thống số:
                    </p>
                    <div className="grid grid-cols-2 gap-3.5 pt-1.5">
                      <div className="p-2.5 bg-slate-50 border rounded-xl text-center">
                        <span className="text-xs font-bold text-blue-700">Chuyên cần GPS</span>
                        <p className="text-[9px] text-slate-450 mt-1">Quét bán kính 100m xác thực</p>
                      </div>
                      <div className="p-2.5 bg-slate-50 border rounded-xl text-center">
                        <span className="text-xs font-bold text-emerald-700">Đồng bộ tự động</span>
                        <p className="text-[9px] text-slate-450 mt-1">Kết quả tích hợp học bạ nhanh</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 4 && (
                  <div className="text-left space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 border-l-3 border-blue-600 pl-2 uppercase tracking-wide">
                      3. SƠ ĐỒ THIẾT KẾ & LIÊN KẾT
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      Minh họa sơ đồ hóa quá trình trao đổi thông tin giữa các thực thể và module dữ liệu:
                    </p>
                    <div className="border border-dashed border-slate-350 p-4 rounded-xl flex items-center justify-center bg-slate-50 font-mono text-[9px] text-slate-500 gap-3">
                      <span className="bg-white border px-2 py-1 rounded shadow-3xs font-bold text-blue-600">Model</span>
                      <span>⇄</span>
                      <span className="bg-white border px-2 py-1 rounded shadow-3xs font-bold text-emerald-600">ViewModel</span>
                      <span>⇄</span>
                      <span className="bg-white border px-2 py-1 rounded shadow-3xs font-bold text-amber-600">View</span>
                    </div>
                  </div>
                )}

                {currentPage === 5 && (
                  <div className="space-y-3.5">
                    <h3 className="text-xs font-bold text-slate-800 uppercase">TỔNG KẾT BÀI HỌC</h3>
                    <p className="text-[11px] text-slate-500 italic max-w-sm mx-auto leading-relaxed">
                      "Kiến thức là chìa khóa của sự phát triển. Hãy hoàn thành các bài tập tự luyện và đọc kỹ slide hướng dẫn của bài học tiếp theo."
                    </p>
                    <span className="text-[10px] font-bold text-blue-600 block pt-1.5">--- TS. Nguyễn Văn A ---</span>
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[9px] text-slate-400 font-bold font-mono">
                <span>© {new Date().getFullYear()} ĐH Hưng Nhân</span>
                <span>Trang {currentPage} / {totalPages}</span>
              </div>
            </div>

            {/* Slider control bar inside canvas */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 bg-slate-950/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 flex items-center gap-4 shadow-xl select-none">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-[10px] font-mono font-black min-w-16 text-center">
                SLIDE {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                title="Trang tiếp"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="h-4 w-px bg-slate-800"></div>

              {/* Zoom buttons */}
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
                className="p-1 rounded-full bg-slate-850 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                title="Thu nhỏ slide"
              >
                <ZoomOut className="h-3.5 w-3.5 text-slate-300" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(1.3, prev + 0.1))}
                className="p-1 rounded-full bg-slate-850 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
                title="Phóng to slide"
              >
                <ZoomIn className="h-3.5 w-3.5 text-slate-300" />
              </button>
            </div>
          </div>
        )}

        {/* Other Document Formats (DOC, PPT, VIDEO) mockup screen with Real Download options */}
        {material.type !== 'pdf' && (
          <div className="bg-white border rounded-2xl p-8 max-w-md w-full shadow-lg text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 animate-pulse">
              {material.type === 'video' ? (
                <Video className="h-10 w-10 text-blue-500" />
              ) : material.type === 'ppt' ? (
                <FileCode className="h-10 w-10 text-amber-500" />
              ) : (
                <FileText className="h-10 w-10 text-indigo-500" />
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-850">{material.title}</h4>
              <p className="text-xs text-slate-400 font-semibold italic">Tệp đính kèm: {material.fileName}</p>
              <div className="flex items-center justify-center gap-1.5">
                <Badge variant="info" className="text-[9px] font-mono tracking-widest uppercase">{material.type}</Badge>
                <Badge variant="gray" className="text-[9px] font-mono font-bold">{material.fileSize}</Badge>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {material.description || 'Học liệu tự học kèm video/slide bài giảng thực hành. Nhấp để tải tệp thật về thiết bị.'}
            </p>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRealDownload}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-3xs flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Tải Xuống Tệp Thật Ngay (.zip/.docx)
              </button>
              <p className="text-[9px] text-slate-400 font-medium">
                Tài liệu học tập được chuẩn hóa tự động dưới định dạng văn bản lưu trữ.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
