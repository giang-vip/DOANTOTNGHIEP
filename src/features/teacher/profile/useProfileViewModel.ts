import { useState, useEffect } from 'react';
import { Teacher } from '../../../models';

export function useProfileViewModel(teacherProfile: Teacher, triggerToast: (msg: string, type: 'success' | 'danger') => void) {
  const [profile, setProfile] = useState<Teacher>(teacherProfile);
  const [password, setPassword] = useState('123');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loginUsername = String(teacherProfile.id || '').toLowerCase();

  useEffect(() => {
    // Get password for teacher
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    setPassword(pwds[loginUsername.toLowerCase()] || '123');
  }, [teacherProfile, loginUsername]);

  const handleUpdateContact = async (email: string, phone: string) => {
    try {
      const { default: axiosClient } = await import('../../../api/axiosClient');
      await axiosClient.put('/auth/me', {
        email: email,
        phone: phone
      });
      
      setProfile(prev => ({ ...prev, email, phone }));
      triggerToast('Cập nhật hồ sơ liên hệ thành công! (Vui lòng tải lại trang để làm mới phiên đăng nhập)', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi cập nhật thông tin';
      triggerToast(msg, 'danger');
    }
  };

  const handleChangePassword = async () => {
    const tempErrors: Record<string, string> = {};
    if (!oldPassword.trim()) tempErrors.oldPassword = 'Mật khẩu hiện tại không chính xác';
    if (!newPassword.trim()) tempErrors.newPassword = 'Mật khẩu mới không được trống';
    if (newPassword === oldPassword) tempErrors.newPassword = 'Mật khẩu mới trùng với mật khẩu cũ';
    if (newPassword !== confirmPassword) tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    try {
      const { default: axiosClient } = await import('../../../api/axiosClient');
      await axiosClient.put('/auth/change-password', {
        oldPassword: oldPassword,
        newPassword: newPassword
      });

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsPasswordModalOpen(false);
      setErrors({});
      triggerToast('Thay đổi mật khẩu tài khoản thành công!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Mật khẩu hiện tại không chính xác';
      setErrors({ oldPassword: msg });
      triggerToast(msg, 'danger');
    }
  };

  const handleUpdateAvatar = (url: string) => {
    setProfile(prev => ({ ...prev, avatar: url }));
    triggerToast('Cập nhật ảnh đại diện giảng viên thành công!', 'success');
  };

  return {
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
  };
}
