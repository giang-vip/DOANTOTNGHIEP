import { useState } from 'react';
import { Student } from '../../../models';

export type AdminStudentDetailTab = 'info' | 'academic-progress';

export function useAdminStudentDetailViewModel(initialStudent: Student) {
  const [activeTab, setActiveTab] = useState<AdminStudentDetailTab>('info');
  const [student, setStudent] = useState<Student>(initialStudent);

  return {
    activeTab,
    setActiveTab,
    student,
    setStudent
  };
}
