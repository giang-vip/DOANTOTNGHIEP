import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { Student } from '../../../types';

export function useProfileViewModel(studentProfile: Student, triggerToast: (msg: string, type: 'success' | 'danger') => void) {
  const { users, updateStudent } = useStore();
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

  const matchingUser = users.find(u => u.id === studentProfile.userId);
  const loginUsername = matchingUser ? matchingUser.username : studentProfile.id.toLowerCase();

  useEffect(() => {
    // Get current student password
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    setPassword(pwds[loginUsername.toLowerCase()] || '123');
  }, [studentProfile, loginUsername, users]);

  const handleUpdateContact = (email: string, phone: string) => {
    // Call store update Student
    updateStudent(studentProfile.id, { email, phone });

    // Update login account email / phone in localStorage directly for persistence across loads
    const savedUsers = JSON.parse(localStorage.getItem('hn_users') || '[]');
    const updatedUsers = savedUsers.map((u: any) => 
      u.id === studentProfile.userId ? { ...u, email, phone } : u
    );
    localStorage.setItem('hn_users', JSON.stringify(updatedUsers));

    setProfile(prev => ({ ...prev, email, phone }));
    triggerToast('Cập nhật hồ sơ liên hệ thành công!', 'success');
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
    updateStudent(studentProfile.id, { avatar: url });
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
          updateStudent(studentProfile.id, { facePhotos: updatedPhotos });
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
    updateStudent(studentProfile.id, { facePhotos: updatedPhotos });
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
