import React, { useState } from 'react';
import { useMyClassesViewModel } from './useMyClassesViewModel';
import { Card, Table, FormInput, Badge } from '../../../components/UI';
import { BookOpen, Users, Megaphone, Calendar, Send, Trash2, Mail, Phone, CalendarDays } from 'lucide-react';

interface MyClassesViewProps {
  teacherId: string;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

export function MyClassesView({ teacherId, triggerToast }: MyClassesViewProps) {
  const {
    myClasses,
    selectedClass,
    setSelectedClass,
    classStudents,
    classAnnouncements,
    annTitle,
    setAnnTitle,
    annContent,
    setAnnContent,
    errors,
    postAnnouncement,
    deleteAnnouncement
  } = useMyClassesViewModel(teacherId);

  const [detailTab, setDetailTab] = useState<'roster' | 'announcements'>('roster');

  const handlePostAction = (e: React.FormEvent) => {
    e.preventDefault();
    postAnnouncement((msg) => triggerToast(msg, 'success'));
  };

  const studentColumns = [
    {
      header: 'MSSV',
      accessor: (s: any) => <span className="font-mono font-bold text-slate-800">{s.id}</span>
    },
    {
      header: 'Họ và Tên',
      accessor: (s: any) => <span className="font-semibold text-slate-800">{s.name}</span>
    },
    {
      header: 'Giới Tính',
      accessor: (s: any) => <span className="text-xs text-slate-600">{s.gender}</span>
    },
    {
      header: 'Liên Hệ',
      accessor: (s: any) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {s.email}</p>
          <p className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {s.phone}</p>
        </div>
      )
    },
    {
      header: 'Khóa Học',
      accessor: (s: any) => <Badge variant="gray">{s.classCode}</Badge>
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Assigned Classes list */}
      <div className="lg:col-span-1 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider">Lớp được phân công</h2>
          <p className="text-[11px] text-slate-400">Chọn một lớp học để quản lý học viên & thông báo</p>
        </div>

        <div className="space-y-2.5">
          {myClasses.length === 0 ? (
            <Card className="p-4 text-center text-xs text-slate-400 font-medium">
              Bạn chưa được phân công lớp nào kỳ này.
            </Card>
          ) : (
            myClasses.map((cls) => {
              const isSelected = selectedClass?.id === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 text-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`font-mono text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {cls.id}
                    </span>
                    <Badge variant={isSelected ? 'success' : 'info'}>{cls.credits} TC</Badge>
                  </div>
                  <h4 className={`text-sm font-bold truncate leading-snug ${isSelected ? 'text-white' : 'text-slate-850'}`}>
                    {cls.subjectName}
                  </h4>
                  <div className={`flex items-center gap-1 text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{cls.schedule}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Class detail and workspace */}
      <div className="lg:col-span-3 space-y-5">
        {selectedClass ? (
          <>
            {/* Detail Class Header Card */}
            <Card className="p-5 bg-gradient-to-r from-slate-900 to-slate-850 border-none text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">Chi tiết học phần</span>
                <h3 className="text-lg font-bold leading-none mt-1.5">{selectedClass.subjectName}</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Lớp: <strong className="font-mono text-slate-200">{selectedClass.id}</strong> • Phòng học: <strong className="text-slate-200">{selectedClass.room}</strong> • Sĩ số: <strong className="text-slate-200">{selectedClass.studentIds.length} học viên</strong>
                </p>
              </div>

              {/* Detail Tabs */}
              <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setDetailTab('roster')}
                  className={`flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    detailTab === 'roster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="h-3.5 w-3.5 inline mr-1" /> Sĩ số ({classStudents.length})
                </button>
                <button
                  onClick={() => setDetailTab('announcements')}
                  className={`flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    detailTab === 'announcements' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Megaphone className="h-3.5 w-3.5 inline mr-1" /> Thông báo ({classAnnouncements.length})
                </button>
              </div>
            </Card>

            {/* Tab: Student Roster */}
            {detailTab === 'roster' && (
              <Card>
                <Table
                  data={classStudents}
                  columns={studentColumns}
                  emptyMessage="Lớp chưa có sinh viên nào đăng ký tham gia học."
                />
              </Card>
            )}

            {/* Tab: Class Announcements */}
            {detailTab === 'announcements' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Announcement Post form */}
                <div className="md:col-span-1">
                  <Card className="p-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Đăng Thông Báo Mới</h4>
                    <form onSubmit={handlePostAction} className="space-y-3">
                      <FormInput
                        label="Tiêu đề"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Tiêu đề..."
                        error={errors.title}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                          Nội dung
                        </label>
                        <textarea
                          value={annContent}
                          onChange={(e) => setAnnContent(e.target.value)}
                          rows={4}
                          placeholder="Nhập thông báo gửi lớp..."
                          className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 ${
                            errors.content ? 'border-rose-300' : 'border-slate-200'
                          }`}
                        />
                        {errors.content && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.content}</p>}
                      </div>
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center items-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" /> Gửi thông báo
                      </button>
                    </form>
                  </Card>
                </div>

                {/* Announcement Feed */}
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Lịch sử thông báo</h4>
                  <div className="space-y-3.5">
                    {classAnnouncements.length === 0 ? (
                      <Card className="p-8 text-center text-xs text-slate-400 font-medium">
                        Chưa có thông báo nào được lưu hành trong lớp này.
                      </Card>
                    ) : (
                      classAnnouncements.map((ann) => (
                        <Card key={ann.id} className="p-4 space-y-2 relative group border border-slate-250">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">{ann.title}</h5>
                              <span className="text-[9px] text-slate-400 block mt-0.5">
                                Đăng bởi {ann.sender} • {new Date(ann.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                            {ann.recipientGroup === 'class' && (
                              <button
                                onClick={() => deleteAnnouncement(ann.id, (msg) => triggerToast(msg, 'success'))}
                                className="text-slate-350 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 bg-slate-50/50 rounded-lg p-2.5 whitespace-pre-line leading-relaxed">
                            {ann.content}
                          </p>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="p-16 text-center text-slate-400 text-sm font-medium">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            Vui lòng chọn một lớp bên trái để xem thông tin chi tiết.
          </Card>
        )}
      </div>
    </div>
  );
}
