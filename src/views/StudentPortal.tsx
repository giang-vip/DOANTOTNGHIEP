/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardView } from '../features/student/dashboard/DashboardView';
import { ScheduleView } from '../features/student/schedule/ScheduleView';
import { RegistrationView } from '../features/student/registration/RegistrationView';
import { StudyView } from '../features/student/study/StudyView';

import { ProfileView } from '../features/student/profile/ProfileView';
import { AcademicProgressView } from '../features/student/academic-progress/AcademicProgressView';
import { Student } from '../models';

interface StudentPortalProps {
  studentProfile: Student;
  activeTab: string;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  studentProfile,
  activeTab,
  triggerToast
}) => {
  const handleToast = (msg: string, type: 'success' | 'danger') => {
    triggerToast(msg, type);
  };

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView studentProfile={studentProfile} />;
    case 'schedule':
      return <ScheduleView studentProfile={studentProfile} />;
    case 'registration':
      return <RegistrationView studentProfile={studentProfile} triggerToast={handleToast} />;
    case 'study':
      return <StudyView studentProfile={studentProfile} triggerToast={handleToast} />;
    case 'academic-progress':
      return <AcademicProgressView studentProfile={studentProfile} />;
    case 'profile':
      return <ProfileView studentProfile={studentProfile} triggerToast={handleToast} />;
    default:
      return <DashboardView studentProfile={studentProfile} />;
  }
};
