import React from 'react';
import { useAnnouncementsViewModel } from './useAnnouncementsViewModel';
import { Card, FormInput, Badge } from '../../../components/UI';
import { Send, Bell, Trash2, Mail, Edit } from 'lucide-react';
import { SearchableSelect } from '../../../components/SearchableSelect';

interface AnnouncementsViewProps {
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export function AnnouncementsView({ triggerToast }: AnnouncementsViewProps) {
  const {
    notifications,
    title,
    setTitle,
    content,
    setContent,
    recipientGroup,
    setRecipientGroup,
    errors,
    editingId,
    handleEditClick,
    handleCancelEdit,
    sendNotification,
    deleteNotification
  } = useAnnouncementsViewModel();

  const handleSendAction = (e: React.FormEvent) => {
    e.preventDefault();
    sendNotification((msg) => triggerToast(msg, 'success'));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Draft Section */}
      <div className="lg:col-span-1 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {editingId ? 'Sửa Thông Báo' : 'Gửi Thông Báo Toàn Trường'}
          </h2>
          <p className="text-xs text-slate-500">
            {editingId ? 'Cập nhật lại nội dung thông báo' : 'Soạn thảo văn bản và gửi qua email tới nhóm nhận chỉ định'}
          </p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSendAction} className="space-y-4">
            <FormInput
              label="Tiêu đề thông báo / Email"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề..."
              error={errors.title}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nhóm Người Nhận</label>
              <SearchableSelect
                name="recipientGroup"
                value={recipientGroup}
                onChange={(val) => setRecipientGroup(String(val) as any)}
                options={[
                  { value: 'all', label: 'Tất cả mọi người' },
                  { value: 'teachers', label: 'Chỉ giảng viên' },
                  { value: 'students', label: 'Chỉ sinh viên' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Nội Dung Chi Tiết</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Nhập nội dung thông báo chính thức hoặc email..."
                className={`w-full px-3.5 py-2 rounded-lg border text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 bg-white text-slate-700 ${
                  errors.content ? 'border-rose-300' : 'border-slate-200'
                }`}
              />
              {errors.content && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.content}</p>}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" /> {editingId ? 'Cập Nhật' : 'Đăng & Gửi Email'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* History Feed Section */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lịch Sử Phát Hành Thông Báo</h3>
          <p className="text-xs text-slate-400">Xem và quản lý danh sách các thông cáo báo chí, email đã phát đi</p>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center text-slate-400 text-sm font-medium">
              Chưa có thông báo nào được lưu trữ trên hệ thống.
            </Card>
          ) : (
            notifications.map((notif) => (
              <Card key={notif.id} className="p-5 space-y-3 relative group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Bell className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">{notif.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Gửi bởi <strong className="text-slate-600">{notif.sender}</strong> •{' '}
                        {new Date(notif.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={notif.recipientGroup === 'all' ? 'info' : 'gray'}>
                      {notif.recipientGroup === 'all' ? 'Toàn trường' : notif.recipientGroup === 'teachers' ? 'Giảng viên' : 'Sinh viên'}
                    </Badge>
                    
                    <button
                      onClick={() => handleEditClick(notif)}
                      className="p-1 rounded-md text-slate-350 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => deleteNotification(notif.id, (msg) => triggerToast(msg, 'success'))}
                      className="p-1 rounded-md text-slate-350 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3.5 border border-slate-100 whitespace-pre-line leading-relaxed">
                  {notif.content}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold pl-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Đã tự động gửi hòm thư thông báo thành công</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
