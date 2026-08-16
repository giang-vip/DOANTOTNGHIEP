import { useState, useEffect } from 'react';
import { Student } from '../../../models';

export function useProfileViewModel(studentProfile: Student, triggerToast: (msg: string, type: 'success' | 'danger') => void) {
  const [profile, setProfile] = useState<Student>(studentProfile);
  const [password, setPassword] = useState('123');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Face ID training states
  const [isTrainingFace, setIsTrainingFace] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const loginUsername = String(studentProfile.id || '').toLowerCase();

  useEffect(() => {
    // Get current student password
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    setPassword(pwds[loginUsername.toLowerCase()] || '123');
  }, [studentProfile, loginUsername]);

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

  const handleChangePassword = () => {
    const tempErrors: Record<string, string> = {};
    if (oldPassword !== password) tempErrors.oldPassword = 'Mật khẩu hiện tại không chính xác';
    if (!newPassword.trim()) tempErrors.newPassword = 'Mật khẩu mới không được trống';
    if (newPassword === oldPassword) tempErrors.newPassword = 'Mật khẩu mới trùng mật khẩu cũ';
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
    setProfile(prev => ({ ...prev, avatar: url }));
    triggerToast('Cập nhật ảnh đại diện sinh viên thành công!', 'success');
  };

  const handleTrainFaceID = (newPhotoUrl: string) => {
    const currentPhotos = profile.facePhotos || [];
    if (currentPhotos.length >= 5) {
      triggerToast('Hệ thống Face ID giới hạn tối đa 5 ảnh huấn luyện!', 'danger');
      return;
    }

    const updatedPhotos = [...currentPhotos, newPhotoUrl];
    
    // Simulate training progress
    setIsTrainingFace(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTrainingFace(false);
          
          // Save when complete
          setProfile(prevProfile => ({ ...prevProfile, facePhotos: updatedPhotos }));
          triggerToast('Huấn luyện khớp ảnh Face ID sinh trắc học thành công!', 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handleRemoveFacePhoto = (idx: number) => {
    const currentPhotos = profile.facePhotos || [];
    const updatedPhotos = currentPhotos.filter((_, i) => i !== idx);
    setProfile(prev => ({ ...prev, facePhotos: updatedPhotos }));
    triggerToast('Đã xóa mẫu ảnh Face ID.', 'success');
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
    handleUpdateAvatar,
    handleTrainFaceID,
    handleRemoveFacePhoto,
    isTrainingFace,
    trainingProgress
  };
}
