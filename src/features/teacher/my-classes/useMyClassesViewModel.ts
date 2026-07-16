import { useState, useEffect } from 'react';
import { useStore } from '../../../models/store';
import { ClassSection, Student, SystemNotification } from '../../../types';

export function useMyClassesViewModel(teacherId: string) {
  const { classes, students, notifications, addNotification, deleteNotification } = useStore();

  // Filter classes assigned to this teacher
  const myClasses = classes.filter(c => c.teacherId === teacherId);

  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset selected class on change if previous selected is no longer in myClasses
  useEffect(() => {
    if (myClasses.length > 0 && !selectedClass) {
      setSelectedClass(myClasses[0]);
    }
  }, [classes]);

  // Get student roster for selected class
  const classStudents = selectedClass
    ? students.filter(s => selectedClass.studentIds.includes(s.id) && s.status === 'active')
    : [];

  // Filter notifications for selected class or target group
  const classAnnouncements = selectedClass
    ? notifications.filter(
        n => (n.classId === selectedClass.id && n.recipientGroup === 'class') || n.recipientGroup === 'all'
      )
    : [];

  const handlePostAnnouncement = (onSuccess: (msg: string) => void) => {
    if (!selectedClass) return;

    const tempErrors: Record<string, string> = {};
    if (!annTitle.trim()) tempErrors.title = 'Vui lòng nhập tiêu đề';
    if (!annContent.trim()) tempErrors.content = 'Vui lòng nhập nội dung thông báo';

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    // Add notification targeting this specific class
    addNotification({
      title: annTitle.trim(),
      content: annContent.trim(),
      recipientGroup: 'class',
      classId: selectedClass.id,
      sender: selectedClass.teacherName
    });

    setAnnTitle('');
    setAnnContent('');
    setErrors({});
    onSuccess('Đã đăng thông báo cho lớp học phần thành công!');
  };

  const handleDeleteAnnouncement = (id: string, onSuccess: (msg: string) => void) => {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo lớp này?')) {
      deleteNotification(id);
      onSuccess('Đã xóa thông báo thành công!');
    }
  };

  return {
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
    postAnnouncement: handlePostAnnouncement,
    deleteAnnouncement: handleDeleteAnnouncement
  };
}
