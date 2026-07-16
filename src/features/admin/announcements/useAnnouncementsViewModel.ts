import { useState } from 'react';
import { useStore } from '../../../models/store';
import { SystemNotification } from '../../../types';

export function useAnnouncementsViewModel() {
  const { notifications, addNotification, deleteNotification } = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientGroup, setRecipientGroup] = useState<'all' | 'teachers' | 'students'>('all');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Tiêu đề thông báo không được bỏ trống';
    if (!content.trim()) tempErrors.content = 'Nội dung thông báo không được bỏ trống';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSendNotification = (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    addNotification({
      title: title.trim(),
      content: content.trim(),
      recipientGroup,
      sender: 'Phòng Đào Tạo Hưng Nhân'
    });

    // Reset Form
    setTitle('');
    setContent('');
    setRecipientGroup('all');
    setErrors({});

    onSuccess('Thông báo đã được đăng tải và gửi Email thành công tới nhóm đích!');
  };

  const handleDelete = (id: string, onSuccess: (msg: string) => void) => {
    if (confirm('Bạn có chắc muốn xóa lịch sử thông báo này?')) {
      deleteNotification(id);
      onSuccess('Đã xóa thông báo thành công!');
    }
  };

  return {
    notifications,
    title,
    setTitle,
    content,
    setContent,
    recipientGroup,
    setRecipientGroup,
    errors,
    sendNotification: handleSendNotification,
    deleteNotification: handleDelete
  };
}
