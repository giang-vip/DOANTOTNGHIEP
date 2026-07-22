import React from 'react';
import { Card, Badge } from '../../../../components/UI';
import { CalendarDays } from 'lucide-react';
import { AttendanceSession, AttendanceRecord } from '../../../../types';

/**
 * Interface props cho component AttendancePanel.
 */
export interface AttendancePanelProps {
  /** Danh sách phiên điểm danh đang mở */
  activeRollCallSessions: AttendanceSession[];
  /** Danh sách các buổi học */
  classSessions: AttendanceSession[];
  /** Nhật ký điểm danh của sinh viên */
  attendanceRecords: AttendanceRecord[];
  /** Kiểm tra sinh viên đã điểm danh phiên này chưa */
  hasCheckedIn: (sessionId: string) => boolean;
  /** Hàm callback để kích hoạt điểm danh */
  checkIn: (sessionId: string, mode: 'gps' | 'face', triggerToast: any) => void;
  /** Hàm callback thông báo toast */
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

/**
 * Component hiển thị Lịch sử & Bảng Điều khiển Điểm danh (AttendancePanel).
 * Hỗ trợ bấm điểm danh nhanh (bằng GPS/Face ID) và xem chi tiết lịch sử từng buổi học.
 */
export function AttendancePanel({
  activeRollCallSessions,
  classSessions,
  attendanceRecords,
  hasCheckedIn,
  checkIn,
  triggerToast,
}: AttendancePanelProps) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Tiêu đề phần điểm danh */}
      <div className="flex items-center justify-between border-b pb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-750 uppercase tracking-wide">Điểm danh sinh trắc học Face ID & Vị trí</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Xác thực sinh trắc học khuôn mặt thông minh và GPS Geo-fence trường học</p>
        </div>
        <Badge variant={activeRollCallSessions.length > 0 ? 'success' : 'gray'}>
          {activeRollCallSessions.length > 0 ? `${activeRollCallSessions.length} phiên đang mở` : 'Không có phiên điểm danh'}
        </Badge>
      </div>

      {/* Hiển thị danh sách các phiên điểm danh đang mở */}
      {activeRollCallSessions.length > 0 ? (
        <div className="space-y-3">
          {activeRollCallSessions.map(session => {
            const checkedIn = hasCheckedIn(session.id);
            return (
              <Card key={session.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{session.title}</h4>
                  <Badge variant="success">Đang mở</Badge>
                </div>
                <button
                  onClick={() => checkIn(session.id, 'gps', triggerToast)}
                  disabled={checkedIn}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${checkedIn ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {checkedIn ? 'Đã điểm danh' : 'Điểm danh'}
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
          <p className="text-xs text-slate-400">Hiện không có phiên điểm danh nào đang mở.</p>
        </div>
      )}

      {/* Bảng lịch sử điểm danh chi tiết */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold text-slate-750 uppercase tracking-wider">Lịch sử điểm danh chi tiết môn</h4>
        {classSessions.length === 0 ? (
          <p className="text-[10px] text-slate-400 italic font-semibold">Chưa có phiên điểm danh nào được ghi nhận cho môn học này.</p>
        ) : (
          <div className="bg-white border rounded-xl divide-y overflow-hidden shadow-3xs">
            {classSessions.map((ses) => {
              const record = attendanceRecords.find(r => r.sessionId === ses.id);
              return (
                <div key={ses.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-700 block">{ses.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Ngày: {ses.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={ses.status === 'open' ? 'success' : 'gray'}>
                      {ses.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                    </Badge>
                    {record && (
                      <Badge variant={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : 'danger'}>
                        {record.status === 'present' ? 'Có mặt' : record.status === 'late' ? 'Muộn' : 'Vắng'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
