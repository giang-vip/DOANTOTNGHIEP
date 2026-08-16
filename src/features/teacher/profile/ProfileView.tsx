import React, { useState } from 'react';
import { useProfileViewModel } from './useProfileViewModel';
import { Card, Modal, FormInput } from '../../../components/UI';
import { Teacher } from '../../../models';
import { User, Mail, Phone, Map, ShieldAlert, Key, Edit, Camera } from 'lucide-react';

interface ProfileViewProps {
  teacherProfile: Teacher;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
];

export function ProfileView({ teacherProfile, triggerToast }: ProfileViewProps) {
  const {
    profile,
    loginUsername,
    password,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    errors,
    handleUpdateContact,
    handleChangePassword,
    handleUpdateAvatar
  } = useProfileViewModel(teacherProfile, triggerToast);

  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);

  const handleSaveContact = () => {
    handleUpdateContact(email, phone);
    setIsEditingContact(false);
  };

  const handleAvatarSelect = (url: string) => {
    handleUpdateAvatar(url);
    setIsAvatarSelectorOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hồ Sơ Giảng Viên</h2>
        <p className="text-xs text-slate-500">Xem lý lịch cá nhân và cấu hình tài khoản bảo mật của giảng viên</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Basic info */}
        <Card className="p-6 text-center space-y-4">
          <div className="relative inline-block group">
            <img
              src={profile.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120'}
              alt={profile.name}
              className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100 mx-auto"
            />
            <button
              onClick={() => setIsAvatarSelectorOpen(true)}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              title="Thay ảnh đại diện"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">{profile.name}</h3>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mt-1 inline-block">
              Giảng viên cơ hữu
            </span>
          </div>

          <div className="border-t border-slate-100 pt-4 text-left space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Mã Giảng Viên: <strong className="text-slate-800">{profile.id}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Map className="h-4 w-4 text-slate-400 shrink-0" />
              <span>Khoa: <strong className="text-slate-800">{profile.department}</strong></span>
            </div>
          </div>
        </Card>

        {/* Right Cards: Contact & Credentials */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact info Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Thông Tin Liên Hệ</h4>
              <button
                onClick={() => setIsEditingContact(!isEditingContact)}
                className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit className="h-3 w-3" /> {isEditingContact ? 'Hủy bỏ' : 'Chỉnh sửa'}
              </button>
            </div>

            {isEditingContact ? (
              <div className="space-y-4">
                <FormInput
                  label="Hòm thư Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormInput
                  label="Số Điện Thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <button
                  onClick={handleSaveContact}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex gap-3">
                  <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Email liên hệ</span>
                    <span className="text-xs font-medium text-slate-700">{profile.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 flex gap-3">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Số điện thoại</span>
                    <span className="text-xs font-medium text-slate-700">{profile.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Account credentials security Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tài Khoản Đăng Nhập & Bảo Mật</h4>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Key className="h-3 w-3" /> Đổi mật khẩu
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Tên đăng nhập (Username)</span>
                <span className="font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{loginUsername}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-50 pb-2.5">
                <span className="text-xs text-slate-500 font-medium">Mật khẩu hiện tại (Password)</span>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  <Key className="h-3 w-3 text-slate-400" />
                  <span>{password}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Phương thức xác minh</span>
                <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  Mật khẩu gốc hệ thống
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Choose Avatar Modal */}
      {isAvatarSelectorOpen && (
        <Modal
          isOpen={isAvatarSelectorOpen}
          onClose={() => setIsAvatarSelectorOpen(false)}
          title="Chọn Ảnh Đại Diện Giảng Viên"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Lựa chọn từ kho ảnh hoạt họa mẫu được thiết kế sẵn cho hệ thống giảng viên Hưng Nhân Smart Education.</p>
            <div className="grid grid-cols-3 gap-4">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAvatarSelect(url)}
                  className="p-1 border border-slate-100 rounded-full hover:border-blue-600 transition-all overflow-hidden shrink-0 aspect-square cursor-pointer bg-slate-50"
                >
                  <img src={url} alt={`Avatar preset ${idx}`} className="w-full h-full rounded-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Đổi Mật Khẩu Đăng Nhập"
          footer={
            <>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cập nhật mật khẩu mới
              </button>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <FormInput
              label="Mật khẩu hiện tại"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              error={errors.oldPassword}
            />

            <FormInput
              label="Mật khẩu mới"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
            />

            <FormInput
              label="Xác nhận mật khẩu mới"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
