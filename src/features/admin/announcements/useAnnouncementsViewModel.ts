import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { AdminAnnouncementResponse } from '../../../models/Announcement';

export function useAnnouncementsViewModel() {
  const [notifications, setNotifications] = useState<AdminAnnouncementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientGroup, setRecipientGroup] = useState<'all' | 'teachers' | 'students'>('all');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAllAnnouncements();
      setNotifications(res || []);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!title.trim()) tempErrors.title = 'Tiêu đề thông báo không được bỏ trống';
    if (!content.trim()) tempErrors.content = 'Nội dung thông báo không được bỏ trống';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSendNotification = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      const data = {
        title: title.trim(),
        content: content.trim(),
        recipientGroup
      };

      if (editingId) {
        await adminApi.updateAnnouncement(editingId, data);
        onSuccess('Cập nhật thông báo thành công!');
      } else {
        await adminApi.createAnnouncement(data);
        onSuccess('Thông báo đã được đăng tải và gửi Email thành công tới nhóm đích!');
      }

      // Reset Form
      setTitle('');
      setContent('');
      setRecipientGroup('all');
      setErrors({});
      setEditingId(null);
      
      // Tải lại danh sách
      fetchAnnouncements();
    } catch (err) {
      console.error('Failed to save announcement:', err);
      alert('Có lỗi xảy ra khi lưu thông báo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (notif: AdminAnnouncementResponse) => {
    setEditingId(notif.id);
    setTitle(notif.title);
    setContent(notif.content);
    setRecipientGroup(notif.recipientGroup as any || 'all');
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setRecipientGroup('all');
    setErrors({});
  };

  const handleDelete = async (id: number, onSuccess: (msg: string) => void) => {
    if (confirm('Bạn có chắc muốn xóa lịch sử thông báo này?')) {
      try {
        await adminApi.deleteAnnouncement(id);
        onSuccess('Đã xóa thông báo thành công!');
        fetchAnnouncements();
      } catch (err) {
        console.error('Failed to delete announcement:', err);
        alert('Lỗi khi xóa thông báo');
      }
    }
  };

  return {
    notifications,
    isLoading,
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
    sendNotification: handleSendNotification,
    deleteNotification: handleDelete
  };
}
