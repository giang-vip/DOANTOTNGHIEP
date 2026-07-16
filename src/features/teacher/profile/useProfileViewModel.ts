import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { Teacher } from '../../../types';

export function useProfileViewModel(teacherProfile: Teacher, triggerToast: (msg: string, type: 'success' | 'danger') => void) {
  const { users, updateTeacher } = useStore();
  const [profile, setProfile] = useState<Teacher>(teacherProfile);
  const [password, setPassword] = useState('123');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const matchingUser = users.find(u => u.id === teacherProfile.userId);
  const loginUsername = matchingUser ? matchingUser.username : teacherProfile.id.toLowerCase();

  useEffect(() => {
    // Get password for teacher
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    setPassword(pwds[loginUsername.toLowerCase()] || '123');
  }, [teacherProfile, loginUsername, users]);

  const handleUpdateContact = (email: string, phone: string) => {
    if (updateTeacher) {
      updateTeacher(teacherProfile.id, { email, phone });
    } else {
      const savedTeachers = JSON.parse(localStorage.getItem('hn_teachers') || '[]');
      const updatedTeachers = savedTeachers.map((t: Teacher) => 
        t.id === teacherProfile.id ? { ...t, email, phone } : t
      );
      localStorage.setItem('hn_teachers', JSON.stringify(updatedTeachers));
    }

    // Update users store too
    const savedUsers = JSON.parse(localStorage.getItem('hn_users') || '[]');
    const updatedUsers = savedUsers.map((u: any) => 
      u.id === teacherProfile.userId ? { ...u, email, phone } : u
    );
    localStorage.setItem('hn_users', JSON.stringify(updatedUsers));

    setProfile(prev => ({ ...prev, email, phone }));
    triggerToast('Cập nhật hồ sơ liên hệ thành công!', 'success');
  };

  const handleChangePassword = () => {
    const tempErrors: Record<string, string> = {};
    if (oldPassword !== password) tempErrors.oldPassword = 'Mật khẩu hiện tại không chính xác';
    if (!newPassword.trim()) tempErrors.newPassword = 'Mật khẩu mới không được trống';
    if (newPassword === oldPassword) tempErrors.newPassword = 'Mật khẩu mới trùng với mật khẩu cũ';
    if (newPassword !== confirmPassword) tempErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Save password
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    pwds[loginUsername.toLowerCase()] = newPassword;
    localStorage.setItem('hn_passwords', JSON.stringify(pwds));
    
    setPassword(newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(false);
    setErrors({});
    triggerToast('Thay đổi mật khẩu tài khoản thành công!', 'success');
  };

  const handleUpdateAvatar = (url: string) => {
    if (updateTeacher) {
      updateTeacher(teacherProfile.id, { avatar: url });
    }
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
