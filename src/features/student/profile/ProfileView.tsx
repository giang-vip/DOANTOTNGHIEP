import React, { useState } from 'react';
import { useProfileViewModel } from './useProfileViewModel';
import { Card, Modal, FormInput, Badge } from '../../../components/UI';
import { Student } from '../../../models';
import {
  User, Mail, Phone, CalendarDays, Key, Edit, Award, Camera,
  ScanFace, Sparkles, Loader2, Trash2, ShieldAlert, BadgeCheck, FileUp
} from 'lucide-react';
import { useStudentAcademicStats } from '../../../hooks/useStudentAcademicStats';

interface ProfileViewProps {
  studentProfile: Student;
  triggerToast: (msg: string, type: 'success' | 'danger') => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
];

const PRESET_FACES = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200'
];

export function ProfileView({ studentProfile, triggerToast }: ProfileViewProps) {
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
    handleUpdateAvatar,
    handleTrainFaceID,
    handleRemoveFacePhoto,
    isTrainingFace,
    trainingProgress
  } = useProfileViewModel(studentProfile, triggerToast);

  const { cumulativeGpa } = useStudentAcademicStats(String(profile.id || ''), String(profile.majorId || ''));

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

  const handleSelectFaceTrainingMock = () => {
    const nextIdx = (profile.facePhotos?.length || 0) % PRESET_FACES.length;
    handleTrainFaceID(PRESET_FACES[nextIdx]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hồ Sơ Cá Nhân Sinh Viên</h2>
        <p className="text-xs text-slate-500">Xem hồ sơ học tập, thiết lập dữ liệu Face ID sinh trắc học và quản lý bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Card: Basic academic profile info */}
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-4">
            <div className="relative inline-block group">
              <img
                src={profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
                alt={profile.name}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-slate-100 mx-auto group-hover:opacity-85 transition-opacity"
              />
              <button
                onClick={() => setIsAvatarSelectorOpen(true)}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                title="Thay ảnh đại diện"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-bold text-slate-800 leading-snug">{profile.fullName || profile.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Mã sinh viên: <span className="font-mono text-slate-700 font-bold">{profile.studentCode || profile.id}</span></p>
            </div>

            <div className="border-t border-slate-100 pt-4 text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Giới tính:</span>
                <span className="font-bold text-slate-800">{profile.gender || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-bold text-slate-800">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Ngành học:</span>
                <span className="font-bold text-slate-800">{profile.majorName || 'Chưa phân ngành'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Lớp sinh hoạt:</span>
                <span className="font-bold text-slate-800">{profile.classCode || 'Chưa phân lớp'}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-4">
                <span className="text-slate-500">GPA Hiện Tại:</span>
                <span className="font-black text-blue-600 text-sm">{(Math.round(cumulativeGpa * 100) / 100).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Account credentials security Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tài Khoản Đăng Nhập & Bảo Mật</h4>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" /> Đổi mật khẩu
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs text-slate-500 font-medium">Tên đăng nhập (Username)</span>
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{loginUsername}</span>
              </div>

              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-xs text-slate-500 font-medium">Mật khẩu hiện tại (Password)</span>
                <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  <Key className="h-3 w-3 text-slate-400" />
                  <span>{password}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Xác minh định danh</span>
                <span className="text-[10px] text-emerald-600 font-bold inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  <BadgeCheck className="h-3.5 w-3.5" /> Đã liên kết
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Cards: Contact & Face ID management */}
        <div className="md:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Thông Tin Liên Lạc</h4>
              <button
                onClick={() => setIsEditingContact(!isEditingContact)}
                className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit className="h-3 w-3" /> {isEditingContact ? 'Hủy bỏ' : 'Sửa đổi'}
              </button>
            </div>

            {isEditingContact ? (
              <div className="space-y-4">
                <FormInput
                  label="Địa chỉ Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormInput
                  label="Số Điện Thoại di động"
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
                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150 flex gap-3">
                  <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Email liên hệ</span>
                    <span className="text-xs font-medium text-slate-700">{profile.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-150 flex gap-3">
                  <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide">Điện thoại</span>
                    <span className="text-xs font-medium text-slate-700">{profile.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Biometrics Face ID Hub */}
          <Card className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ScanFace className="h-4 w-4 text-purple-600" /> Quản lý Face ID Sinh Trắc Học
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Tải lên tối thiểu 3 ảnh chân dung góc độ khác nhau để huấn luyện mô hình nhận diện điểm danh</p>
              </div>

              <button
                disabled={isTrainingFace}
                onClick={handleSelectFaceTrainingMock}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTrainingFace ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang huấn luyện {trainingProgress}%
                  </>
                ) : (
                  <>
                    <Camera className="h-3.5 w-3.5" />
                    Thêm ảnh FaceID mẫu
                  </>
                )}
              </button>
            </div>

            {/* Neural network mock progress indicator */}
            {isTrainingFace && (
              <div className="space-y-1.5 p-3.5 bg-purple-50/50 rounded-xl border border-purple-100">
                <div className="flex justify-between items-center text-xs font-semibold text-purple-700">
                  <span className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Đang tối ưu mạng neuron tích chập (CNN)...</span>
                  <span>{trainingProgress}%</span>
                </div>
                <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-purple-600 h-1.5 transition-all duration-300" style={{ width: `${trainingProgress}%` }} />
                </div>
              </div>
            )}

            {/* Face dataset lists */}
            {(!profile.facePhotos || profile.facePhotos.length === 0) ? (
              <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                <FileUp className="h-8 w-8 text-slate-350 mx-auto mb-2.5" />
                Chưa có dữ liệu sinh trắc khuôn mặt. Vui lòng bấm "Thêm ảnh FaceID mẫu".
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Ảnh mẫu hiện có ({profile.facePhotos.length} / 5)</span>
                  <span className={profile.facePhotos.length >= 3 ? "text-emerald-600" : "text-amber-600"}>
                    {profile.facePhotos.length >= 3 ? "✓ Đủ điều kiện điểm danh" : "⚠️ Cần tối thiểu 3 ảnh"}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3.5">
                  {profile.facePhotos.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                      <img
                        src={img}
                        alt={`Face model ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFacePhoto(index)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer text-xs font-semibold"
                        title="Xóa mẫu khuôn mặt"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Choose Avatar Modal */}
      {isAvatarSelectorOpen && (
        <Modal
          isOpen={isAvatarSelectorOpen}
          onClose={() => setIsAvatarSelectorOpen(false)}
          title="Chọn Ảnh Đại Diện Sinh Viên"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Lựa chọn từ kho ảnh hoạt họa mẫu được thiết kế sẵn cho hệ thống Hưng Nhân Smart Education.</p>
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
