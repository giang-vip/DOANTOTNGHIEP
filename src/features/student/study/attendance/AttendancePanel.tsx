import React from 'react';
import { Card, Badge } from '../../../../components/UI';
import { CheckCircle2, XCircle, Clock, Info, AlertCircle } from 'lucide-react';
import { ClassSection, AttendanceSession, AttendanceRecord } from '../../../../models';
import { useAttendanceViewModel } from './useAttendanceViewModel';

export interface AttendancePanelProps {
  selectedClass: ClassSection;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function AttendancePanel({ selectedClass, triggerToast }: AttendancePanelProps) {
  const {
    activeRollCallSessions,
    classSessions,
    attendanceRecords,
    loading,
    hasCheckedIn,
    checkIn
  } = useAttendanceViewModel(selectedClass, triggerToast);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Active Check-in Alert */}
      {activeRollCallSessions.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-bold text-emerald-800 tracking-tight">Giảng viên đang mở điểm danh!</h3>
              <p className="text-xs text-emerald-700 font-medium">Vui lòng thực hiện điểm danh ngay để ghi nhận sự có mặt trong buổi học này.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {activeRollCallSessions.map(session => (
              <div key={session.id} className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-emerald-100 shadow-3xs">
                <div className="flex items-center gap-2">
                  <Badge variant={hasCheckedIn(Number(session.id)) ? 'success' : 'warning'}>
                    {hasCheckedIn(Number(session.id)) ? 'Đã điểm danh' : 'Chưa điểm danh'}
                  </Badge>
                  <span className="text-xs font-bold text-slate-700">Buổi học ngày {session.date ? new Date(session.date).toLocaleDateString('vi-VN') : ''}</span>
                </div>
                <button
                  disabled={hasCheckedIn(Number(session.id))}
                  onClick={() => checkIn(session)}
                  className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm
                    ${hasCheckedIn(Number(session.id)) 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-200'}`}
                >
                  {hasCheckedIn(Number(session.id)) ? 'Đã Ghi Nhận' : 'Xác Nhận Có Mặt (Sinh Trắc Học)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Table */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-3xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Lịch sử điểm danh</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-400">Đang tải dữ liệu điểm danh...</div>
        ) : classSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 font-medium">
            Chưa có buổi học nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">STT</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ngày học</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tên buổi</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classSessions.map((session, index) => {
                  const record = attendanceRecords.find(r => Number(r.sessionId) === Number(session.id));
                  const isPresent = record?.status?.toLowerCase() === 'present';
                  const isLate = record?.status?.toLowerCase() === 'late';
                  // Default to absent if no record or other status

                  return (
                    <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono font-bold text-slate-400 text-center">{index + 1}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">
                        {session.date ? new Date(session.date).toLocaleDateString('vi-VN') : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {session.title}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          {isPresent ? (
                            <Badge variant="success" className="gap-1 px-2 py-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Có mặt
                            </Badge>
                          ) : isLate ? (
                            <Badge variant="warning" className="gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border-amber-200">
                              <AlertCircle className="h-3 w-3" /> Đi muộn
                            </Badge>
                          ) : (
                            <Badge variant="danger" className="gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border-rose-200">
                              <XCircle className="h-3 w-3" /> Vắng mặt
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
