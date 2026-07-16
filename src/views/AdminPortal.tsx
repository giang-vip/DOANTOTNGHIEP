/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DashboardView } from '../features/admin/dashboard/DashboardView';
import { DepartmentListView } from '../features/admin/departments/DepartmentListView';
import { SubjectListView } from '../features/admin/subjects/SubjectListView';
import { ClassSectionListView } from '../features/admin/classes/ClassSectionListView';
import { TeacherListView } from '../features/admin/teachers/TeacherListView';
import { StudentListView } from '../features/admin/students/StudentListView';
import { AnnouncementsView } from '../features/admin/announcements/AnnouncementsView';

interface AdminPortalProps {
  activeTab: string;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeTab, triggerToast }) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'departments':
      return <DepartmentListView triggerToast={triggerToast} />;
    case 'subjects':
      return <SubjectListView triggerToast={triggerToast} />;
    case 'classes':
      return <ClassSectionListView triggerToast={triggerToast} />;
    case 'teachers':
      return <TeacherListView triggerToast={triggerToast} />;
    case 'students':
      return <StudentListView triggerToast={triggerToast} />;
    case 'announcements':
      return <AnnouncementsView triggerToast={triggerToast} />;
    default:
      return <DashboardView />;
  }
};
