import React, { useState, useEffect } from 'react';
import { useGradingViewModel, getDefaultColumnsConfig } from './useGradingViewModel';
import { Card, Table, Modal, Badge } from '../../../components/UI';
import { FileSpreadsheet, Sparkles, Printer, AlertCircle, CheckCircle, Save, Sliders } from 'lucide-react';
import { convertToLetterGrade, convertToGpa4 } from '../../../utils/gradeUtils';

interface GradingViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function GradingView({ teacherId, triggerToast }: GradingViewProps) {
  const {
    myClasses,
    selectedClass,
    setSelectedClass,
    columnsConfig,
    isConfiguring,
    setIsConfiguring,
    numAssessments,
    setNumAssessments,
    tempConfig,
    setTempConfig,
    localGrades,
    updateLocalGrade,
    gradeRows,
    saveAllGrades,
    saveColumnsConfig
  } = useGradingViewModel(teacherId);

  const [isExporting, setIsExporting] = useState(false);

  // Auto-generate columns when changing count in configuring state
  const handleNumAssessmentsChange = (count: number) => {
    setNumAssessments(count);
    const defaults = getDefaultColumnsConfig(count);
    setTempConfig(defaults);
  };

  const handleSaveConfigAction = () => {
    const total = tempConfig.reduce((acc, c) => acc + c.weight, 0);
    if (Math.abs(total - 1.0) > 0.001) {
      triggerToast(`Tổng trọng số phải bằng 100% (Hiện tại là ${Math.round(total * 100)}%)`, 'danger');
      return;
    }
    saveColumnsConfig(tempConfig);
    setIsConfiguring(false);
    triggerToast('Cập nhật cấu hình trọng số thành công!', 'success');
  };

  const handleSaveGradesAction = () => {
    saveAllGrades((msg) => triggerToast(msg, 'success'));
  };

  const handleExportClick = () => {
    setIsExporting(true);
    triggerToast('Đã khởi tạo bản in báo cáo bảng điểm chính thức!', 'success');
  };

  // Define columns for the React table element
  const columns = [
    {
      header: 'MSSV',
      accessor: (r: any) => <span className="font-mono font-bold text-slate-800 text-xs">{r.studentId}</span>
    },
    {
      header: 'Học Viên',
      accessor: (r: any) => <span className="font-bold text-slate-850 text-xs block min-w-[120px]">{r.studentName}</span>
    },
    {
      header: 'Chuyên Cần',
      accessor: (r: any) => (
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-150 rounded-md px-2 py-0.5">
          {r.attendance} / 10
        </span>
      )
    },
    // Dynamically render inputs for each column
    ...columnsConfig.map(col => ({
      header: `${col.name} (${Math.round(col.weight * 100)}%)`,
      accessor: (r: any) => (
        <div className="flex items-center min-w-[70px]">
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={r.inputs[col.key] ?? ''}
            onChange={(e) => updateLocalGrade(r.studentId, col.key, e.target.value)}
            placeholder="—"
            className="w-16 px-2 py-1 rounded-md border border-slate-200 text-xs text-center font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
        </div>
      )
    })),
    {
      header: 'Tổng Kết HP',
      accessor: (r: any) => {
        if (r.final === undefined) return <span className="text-xs italic text-slate-400 font-medium">Chưa đủ cột</span>;
        
        const letter = convertToLetterGrade(r.final);
        const gpa4 = convertToGpa4(letter);

        let gradeClass = 'text-slate-800';
        let gradeBadge: "success" | "warning" | "danger" | "info" | "gray" = 'gray';
        if (r.final >= 8.5) {
          gradeClass = 'text-emerald-600 font-bold';
          gradeBadge = 'success';
        } else if (r.final < 4.0) {
          gradeClass = 'text-rose-600 font-bold';
          gradeBadge = 'danger';
        } else {
          gradeClass = 'text-blue-600 font-semibold';
          gradeBadge = 'info';
        }

        return (
          <div className="flex flex-col gap-0.5 min-w-[95px]">
            <div className="flex items-center gap-1.5">
              <span className={`font-mono text-xs ${gradeClass}`}>{r.final.toFixed(1)}</span>
              <Badge variant={gradeBadge} className="text-[9px] px-1.5 py-0 scale-90 font-bold">
                {letter}
              </Badge>
            </div>
            <span className="text-[9px] text-slate-400 font-mono font-semibold">Hệ 4: {gpa4.toFixed(1)}</span>
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header section with class drop-down and action buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nhập & Xuất Điểm Học Phần</h2>
          <p className="text-xs text-slate-500">Giảng viên chấm điểm thành phần trực tiếp và cấu hình hệ số công thức linh hoạt</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-56">
            <select
              value={selectedClass?.id || ''}
              onChange={(e) => {
                const found = myClasses.find(c => c.id === e.target.value);
                if (found) setSelectedClass(found);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 cursor-pointer shadow-3xs"
            >
              {myClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.id} - {cls.subjectName}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTempConfig([...columnsConfig]);
                  setIsConfiguring(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sliders className="h-3.5 w-3.5" /> Thiết lập trọng số
              </button>
              <button
                onClick={handleExportClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Xuất bảng điểm (PDF)
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedClass ? (
        <div className="space-y-5">
          {/* Active columns formula info card */}
          <Card className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/25 border-blue-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2 items-center">
              <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800 leading-normal font-medium">
                <strong>Công thức tính:</strong> {columnsConfig.map(col => `${col.name} (${Math.round(col.weight * 100)}%)`).join(' + ')}. Chấm điểm trực tiếp bên dưới rồi bấm "Lưu bảng điểm" để hoàn tất.
              </p>
            </div>
          </Card>

          {/* Grades spreadsheet table */}
          <Card className="overflow-x-auto">
            <Table
              data={gradeRows}
              columns={columns}
              emptyMessage="Không có dữ liệu sinh viên trong lớp học phần này."
            />
          </Card>

          {/* Global Save Button at bottom */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveGradesAction}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Save className="h-4 w-4" /> Lưu bảng điểm
            </button>
          </div>
        </div>
      ) : (
        <Card className="p-16 text-center text-slate-400 text-sm font-medium">
          Vui lòng chọn một lớp học phần để quản lý bảng điểm.
        </Card>
      )}

      {/* Official Export Modal Preview */}
      {isExporting && selectedClass && (
        <Modal
          isOpen={isExporting}
          onClose={() => setIsExporting(false)}
          title="Báo Cáo Bảng Điểm Học Phần Chính Thức"
          size="lg"
        >
          <div className="space-y-6">
            <div className="border border-slate-300 p-8 bg-white text-black space-y-8 select-none font-sans shadow-md rounded-xs">
              {/* Formal heading */}
              <div className="flex justify-between items-start text-[10px] font-semibold uppercase leading-tight">
                <div className="text-center">
                  <p>TRƯỜNG ĐẠI HỌC HƯNG NHÂN</p>
                  <p className="font-bold underline mt-1">KHOA CÔNG NGHỆ THÔNG TIN</p>
                </div>
                <div className="text-center">
                  <p>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold underline mt-1">Độc lập - Tự do - Hạnh phúc</p>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wide">BẢNG ĐIỂM TỔNG KẾT HỌC PHẦN</h2>
                <p className="text-[10px] font-mono italic">Mã lớp học phần: {selectedClass.id} • Học phần: {selectedClass.subjectName}</p>
              </div>

              {/* Grid content */}
              <table className="w-full text-[10px] border-collapse border border-slate-300 text-left">
                <thead>
                  <tr className="bg-slate-50 font-bold uppercase">
                    <th className="border border-slate-300 p-1.5 text-center w-8">STT</th>
                    <th className="border border-slate-300 p-1.5">MSSV</th>
                    <th className="border border-slate-300 p-1.5">Họ và Tên</th>
                    {columnsConfig.map(col => (
                      <th key={col.key} className="border border-slate-300 p-1.5 text-center">{col.name} ({Math.round(col.weight * 100)}%)</th>
                    ))}
                    <th className="border border-slate-300 p-1.5 text-center">Tổng Kết</th>
                    <th className="border border-slate-300 p-1.5 text-center">Chữ</th>
                    <th className="border border-slate-300 p-1.5 text-center">Hệ 4</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {gradeRows.map((r, index) => {
                    const letter = r.final !== undefined ? convertToLetterGrade(r.final) : '—';
                    const gpa4 = r.final !== undefined ? convertToGpa4(letter) : undefined;
                    return (
                      <tr key={r.studentId}>
                        <td className="border border-slate-300 p-1.5 text-center">{index + 1}</td>
                        <td className="border border-slate-300 p-1.5 font-mono">{r.studentId}</td>
                        <td className="border border-slate-300 p-1.5">{r.studentName}</td>
                        {columnsConfig.map(col => (
                          <td key={col.key} className="border border-slate-300 p-1.5 text-center">
                            {r.inputs[col.key] !== undefined && r.inputs[col.key] !== '' ? r.inputs[col.key] : '—'}
                          </td>
                        ))}
                        <td className="border border-slate-300 p-1.5 text-center font-bold">
                          {r.final !== undefined ? r.final.toFixed(1) : '—'}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold">
                          {letter}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-center font-mono font-bold">
                          {gpa4 !== undefined ? gpa4.toFixed(1) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Signatures */}
              <div className="flex justify-between items-center text-[10px] pt-12">
                <div className="text-center w-40">
                  <p className="font-semibold">Trưởng Khoa / Bộ Môn</p>
                  <p className="text-[9px] text-slate-400 mt-1">(Ký, ghi rõ họ tên)</p>
                </div>
                <div className="text-center w-40">
                  <p className="italic">Thái Bình, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
                  <p className="font-bold mt-1">Giảng Viên Biên Soạn</p>
                  <p className="text-[9px] text-slate-400 mt-1">(Ký, ghi rõ họ tên)</p>
                  <p className="mt-12 font-bold text-slate-700">{selectedClass.teacherName}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" /> Gửi tới máy in
              </button>
              <button
                onClick={() => setIsExporting(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Weights/Assessments setup modal */}
      {isConfiguring && (
        <Modal
          isOpen={isConfiguring}
          onClose={() => setIsConfiguring(false)}
          title="Thiết Lập Trọng Số Điểm Thành Phần"
          size="md"
          footer={
            <div className="flex gap-2 justify-end w-full">
              <button
                onClick={handleSaveConfigAction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Lưu cấu hình
              </button>
              <button
                onClick={() => setIsConfiguring(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-800 leading-normal font-medium">
              Thiết lập số lượng các bài kiểm tra/đầu điểm. Hệ thống tự động sinh cấu hình tên và phân bổ phần trăm đều đặn, hỗ trợ sửa đổi trực tiếp theo nhu cầu giảng dạy.
            </div>

            {/* Assessment Count Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Số lượng bài kiểm tra / cột điểm</label>
              <select
                value={numAssessments}
                onChange={(e) => handleNumAssessmentsChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
              >
                <option value={3}>3 cột điểm (TX1, TX2, Cuối kỳ)</option>
                <option value={4}>4 cột điểm (TX1, TX2, Giữa kỳ, Cuối kỳ)</option>
                <option value={5}>5 cột điểm (TX1, TX2, Giữa kỳ, TX3, Cuối kỳ)</option>
                <option value={6}>6 cột điểm</option>
                <option value={7}>7 cột điểm</option>
                <option value={8}>8 cột điểm</option>
              </select>
            </div>

            {/* Columns listing with name & weights */}
            <div className="space-y-3.5 pt-1 max-h-[300px] overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider border-b pb-1">Chi tiết các cột điểm</h4>
              {tempConfig.map((col, idx) => (
                <div key={col.key} className="grid grid-cols-12 gap-3 items-end p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <div className="col-span-2 text-xs font-bold text-slate-500 uppercase pb-2">
                    # {idx + 1}
                  </div>
                  <div className="col-span-6 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Tên Cột</label>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => {
                        const updated = [...tempConfig];
                        updated[idx].name = e.target.value;
                        setTempConfig(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-800"
                    />
                  </div>
                  <div className="col-span-4 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Trọng số (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(col.weight * 100)}
                      onChange={(e) => {
                        const updated = [...tempConfig];
                        updated[idx].weight = (parseInt(e.target.value) || 0) / 100;
                        setTempConfig(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline bg-white text-slate-800 text-center"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total weights sum block */}
            {(() => {
              const sum = tempConfig.reduce((acc, c) => acc + c.weight, 0);
              const isMatch = Math.abs(sum - 1.0) < 0.001;
              return (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex justify-between items-center ${isMatch ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'}`}>
                  <span>Tổng trọng số:</span>
                  <span>{Math.round(sum * 100)}% / 100%</span>
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
}
