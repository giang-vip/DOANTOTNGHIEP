import React, { useState } from 'react';
import { useAttendanceViewModel } from './useAttendanceViewModel';
import { Card, Table, Badge, FormInput } from '../../../components/UI';
import { Calendar, Users, Clock, AlertTriangle, Play, CheckCircle2, XCircle, AlertCircle, Ban } from 'lucide-react';

interface AttendanceViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function AttendanceView({ teacherId, triggerToast }: AttendanceViewProps) {
  const {
    myClasses,
    selectedClass,
    setSelectedClass,
    sessions,
    selectedSession,
    setSelectedSession,
    sessionTitle,
    setSessionTitle,
    expireMinutes,
    setExpireMinutes,
    timeRemaining,
    records,
    classStudents,
    getStudentStats,
    createSession,
    reopenSession,
    updateRecordStatus,
    saveBulkAttendance,
    forceCloseSession
  } = useAttendanceViewModel(teacherId);

  const [activeSubTab, setActiveSubTab] = useState<'rollcall' | 'stats'>('rollcall');
  const [sessionDate, setSessionDate] = useState('2026-07-10');
  const [sessionStatus, setSessionStatus] = useState<'open' | 'closed'>('open');
  const [localAttendance, setLocalAttendance] = useState<Record<string, 'present' | 'late' | 'absent'>>({});

  // Sync local attendance dictionary when active session or its records change
  React.useEffect(() => {
    if (selectedSession) {
      const initial: Record<string, 'present' | 'late' | 'absent'> = {};
      records.forEach(r => {
        initial[r.studentId] = r.status;
      });
      // Ensure every student in class has a status
      classStudents.forEach(s => {
        if (!initial[s.id]) {
          initial[s.id] = 'absent';
        }
      });
      setLocalAttendance(initial);
    } else {
      setLocalAttendance({});
    }
  }, [selectedSession, records.length, classStudents.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreateAction = () => {
    const defaultTitle = sessionTitle || 'Buổi học mới';
    createSession(defaultTitle, sessionDate, sessionStatus, (msg) => triggerToast(msg, 'success'));
  };

  const handleCloseAction = () => {
    forceCloseSession((msg) => triggerToast(msg, 'success'));
  };

  // Metrics for the active roll call session (live based on local changes)
  const statsPresent = Object.values(localAttendance).filter(v => v === 'present').length;
  const statsLate = Object.values(localAttendance).filter(v => v === 'late').length;
  const statsAbsent = Object.values(localAttendance).filter(v => v === 'absent').length;

  const rosterColumns = [
    {
      header: 'MSSV',
      accessor: (s: any) => <span className="font-mono font-bold text-slate-800">{s.id}</span>
    },
    {
      header: 'Họ và Tên',
      accessor: (s: any) => <span className="font-semibold text-slate-800">{s.name}</span>
    },
    {
      header: 'Số Buổi Có Mặt',
      accessor: (s: any) => {
        const stats = getStudentStats(s.id);
        return <span className="font-medium text-slate-700">{stats.present} / {stats.total}</span>;
      }
    },
    {
      header: 'Đi Muộn',
      accessor: (s: any) => {
        const stats = getStudentStats(s.id);
        return <span className="text-amber-600 font-semibold">{stats.late} buổi</span>;
      }
    },
    {
      header: 'Nghỉ Học',
      accessor: (s: any) => {
        const stats = getStudentStats(s.id);
        return <span className={`font-semibold ${stats.absent > 2 ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>{stats.absent} buổi</span>;
      }
    },
    {
      header: 'Tỷ Lệ Chuyên Cần',
      accessor: (s: any) => {
        const stats = getStudentStats(s.id);
        const isAtRisk = stats.rate < 80;
        return (
          <div className="flex items-center gap-3">
            <div className="w-24 bg-slate-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${isAtRisk ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${stats.rate}%` }}
              ></div>
            </div>
            <span className={`text-xs font-bold font-mono ${isAtRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
              {stats.rate}%
            </span>
            {isAtRisk && (
              <Badge variant="danger" className="text-[9px] px-1 py-0 leading-none">Cảnh cáo</Badge>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upper bar: Class Select & SubTabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Điểm Danh Lớp Học</h2>
          <p className="text-xs text-slate-500">Kích hoạt QR/điểm danh số tự động hoặc cập nhật trạng thái thủ công</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex bg-slate-200/80 rounded-lg p-0.5 border border-slate-250 shrink-0">
              <button
                onClick={() => setActiveSubTab('rollcall')}
                className={`text-center px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'rollcall' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ghi Nhận Buổi Học
              </button>
              <button
                onClick={() => setActiveSubTab('stats')}
                className={`text-center px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sổ Tổng Kết Chuyên Cần
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedClass ? (
        activeSubTab === 'rollcall' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Block: Activate or Monitor Session */}
            <div className="lg:col-span-1 space-y-6">
              {/* Session Status Display */}
              {selectedSession && selectedSession.status === 'open' ? (
                <Card className="p-5 border-blue-200 bg-blue-50/20 text-center space-y-4">
                  <div className="relative inline-flex items-center justify-center">
                    {/* Pulsing ring animation */}
                    <span className="absolute inline-flex h-16 w-16 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold relative">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{selectedSession.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Phiên điểm danh thông minh đang hoạt động</p>
                  </div>

                  <div className="p-4 bg-white/85 rounded-xl border border-blue-100 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian còn lại</span>
                    <p className="text-2xl font-mono font-bold text-blue-600 mt-1">
                      {timeRemaining !== null ? formatTime(timeRemaining) : '00:00'}
                    </p>
                  </div>

                  <button
                    onClick={handleCloseAction}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Ban className="h-4 w-4" /> Đóng Phiên Điểm Danh Sớm
                  </button>
                </Card>
              ) : (
                <Card className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                      <Play className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lên lịch & Tạo buổi điểm danh</h4>
                  </div>

                  <FormInput
                    label="Tên / Tiêu đề buổi học"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Ví dụ: Buổi 3: Thừa kế..."
                  />

                  <FormInput
                    label="Ngày Học"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Trạng thái phiên ban đầu
                    </label>
                    <select
                      value={sessionStatus}
                      onChange={(e) => setSessionStatus(e.target.value as 'open' | 'closed')}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
                    >
                      <option value="open">Mở điểm danh ngay (Open)</option>
                      <option value="closed">Tạo sẵn - chưa mở (Closed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                      Thời hạn đóng tự động (phút)
                    </label>
                    <select
                      value={expireMinutes}
                      onChange={(e) => setExpireMinutes(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700"
                    >
                      <option value={5}>5 phút (Cấp tốc)</option>
                      <option value={10}>10 phút</option>
                      <option value={15}>15 phút (Mặc định)</option>
                      <option value={30}>30 phút</option>
                      <option value={45}>45 phút</option>
                    </select>
                  </div>

                  <button
                    onClick={handleCreateAction}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Xác nhận tạo phiên học
                  </button>
                </Card>
              )}

              {/* Session Picker */}
              {sessions.length > 0 && (
                <Card className="p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Lịch sử các phiên học</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sessions.map((ses) => (
                      <div
                        key={ses.id}
                        onClick={() => setSelectedSession(ses)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex justify-between items-center transition-all cursor-pointer ${
                          selectedSession?.id === ses.id
                            ? 'bg-slate-100 border-slate-300 font-semibold text-slate-900'
                            : 'border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{ses.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Ngày: {ses.date}</p>
                        </div>
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Badge variant={ses.status === 'open' ? 'success' : 'gray'}>
                            {ses.status === 'open' ? 'Đang mở' : 'Đã đóng'}
                          </Badge>
                          {ses.status === 'closed' && (
                            <button
                              onClick={() => reopenSession(ses.id, (msg) => triggerToast(msg, 'success'))}
                              className="px-1.5 py-0.5 text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-300 rounded cursor-pointer transition-colors"
                            >
                              Mở lại
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Right / Center Block: Live Student Rollcall */}
            <div className="lg:col-span-2 space-y-4">
              {selectedSession ? (
                <>
                  {/* Stats Counter Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3 text-center bg-emerald-50/40 border-emerald-100">
                      <span className="text-[10px] text-emerald-600 font-bold block uppercase tracking-wide">Có mặt</span>
                      <span className="text-lg font-bold text-emerald-700 mt-1 block">{statsPresent} / {classStudents.length}</span>
                    </Card>

                    <Card className="p-3 text-center bg-amber-50/40 border-amber-100">
                      <span className="text-[10px] text-amber-600 font-bold block uppercase tracking-wide">Đi muộn</span>
                      <span className="text-lg font-bold text-amber-700 mt-1 block">{statsLate}</span>
                    </Card>

                    <Card className="p-3 text-center bg-rose-50/40 border-rose-100">
                      <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wide">Vắng mặt</span>
                      <span className="text-lg font-bold text-rose-700 mt-1 block">{statsAbsent}</span>
                    </Card>
                  </div>

                  {/* Manual Roll Call table */}
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Sổ ghi điểm danh chi tiết</h4>
                      <span className="text-[10px] text-slate-400">Chọn trạng thái và bấm "Lưu điểm danh" dưới đây</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {classStudents.map((stud) => {
                        const status = localAttendance[stud.id] || 'absent';
                        return (
                          <div key={stud.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-slate-800 leading-none">{stud.name}</p>
                              <span className="text-[10px] font-mono text-slate-400 mt-1 block">MSSV: {stud.id} • Lớp: {stud.classCode}</span>
                            </div>

                            {/* Present / Late / Absent buttons group */}
                            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-150 self-start sm:self-center">
                              <button
                                onClick={() => {
                                  setLocalAttendance(prev => ({ ...prev, [stud.id]: 'present' }));
                                  updateRecordStatus(stud.id, stud.name, 'present');
                                }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Có mặt
                              </button>
                              <button
                                onClick={() => {
                                  setLocalAttendance(prev => ({ ...prev, [stud.id]: 'late' }));
                                  updateRecordStatus(stud.id, stud.name, 'late');
                                }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  status === 'late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Muộn
                              </button>
                              <button
                                onClick={() => {
                                  setLocalAttendance(prev => ({ ...prev, [stud.id]: 'absent' }));
                                  updateRecordStatus(stud.id, stud.name, 'absent');
                                }}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  status === 'absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Vắng
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          if (Object.keys(localAttendance).length === 0) {
                            triggerToast('Không có thay đổi nào để lưu!', 'danger');
                            return;
                          }
                          saveBulkAttendance(
                            localAttendance,
                            () => {
                              triggerToast('Bảng điểm danh lớp học đã được cập nhật thành công!', 'success');
                              setLocalAttendance({});
                            },
                            () => triggerToast('Lỗi khi lưu điểm danh!', 'danger')
                          );
                        }}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                      >
                        Lưu điểm danh {Object.keys(localAttendance).length > 0 && `(${Object.keys(localAttendance).length})`}
                      </button>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-12 text-center text-slate-400 text-xs font-medium border-dashed">
                  <AlertCircle className="h-9 w-9 text-slate-350 mx-auto mb-3" />
                  Chưa có phiên học nào hoạt động. Vui lòng mở phiên điểm danh số bên trái hoặc chọn một phiên cũ để ghi nhận.
                </Card>
              )}
            </div>
          </div>
        ) : (
          /* SubTab: Chuyên cần tổng kết */
          <Card>
            <Table
              data={classStudents}
              columns={rosterColumns}
              emptyMessage="Không có dữ liệu sinh viên cho lớp học này."
            />
          </Card>
        )
      ) : (
        <Card className="p-16 text-center text-slate-400 text-sm font-medium">
          Bạn không phụ trách lớp học nào hoặc lớp học phần chưa được phân công.
        </Card>
      )}
    </div>
  );
}
