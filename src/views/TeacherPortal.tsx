/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MyClassesView } from '../features/teacher/my-classes/MyClassesView';
import { AttendanceView } from '../features/teacher/attendance/AttendanceView';
import { MaterialsView } from '../features/teacher/materials/MaterialsView';
import { AssignmentsView } from '../features/teacher/assignments/AssignmentsView';
import { GradingView } from '../features/teacher/grading/GradingView';
import { ProfileView } from '../features/teacher/profile/ProfileView';
import { Teacher } from '../models';

interface TeacherPortalProps {
  teacherProfile: Teacher;
  activeTab: string;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacherProfile,
  activeTab,
  triggerToast
}) => {
  // Translate toast types to our local badges
  const handleToast = (msg: string, type: 'success' | 'danger') => {
    triggerToast(msg, type);
  };

  switch (activeTab) {
    case 'dashboard':
      return <MyClassesView teacherId={String(teacherProfile.id || '')} triggerToast={handleToast} />;
    case 'attendance':
      return <AttendanceView teacherId={String(teacherProfile.id || '')} triggerToast={handleToast} />;
    case 'materials':
      return <MaterialsView teacherId={String(teacherProfile.id || '')} triggerToast={handleToast} />;
    case 'assignments':
      return <AssignmentsView teacherId={String(teacherProfile.id || '')} triggerToast={handleToast} />;
    case 'grades':
      return <GradingView teacherId={String(teacherProfile.id || '')} triggerToast={handleToast} />;
    case 'profile':
      return <ProfileView teacherProfile={teacherProfile} triggerToast={handleToast} />;
    default:
      return <MyClassesView teacherId={String(teacherProfile.id || '')} triggerToast={handleToast} />;
  }
};
