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
import { MajorListView } from '../features/admin/majors/MajorListView';
import { UserManagement } from '../features/admin/users/UserManagement';
import { AcademicYearListView } from '../features/admin/academic-years/AcademicYearListView';
import { SemesterListView } from '../features/admin/semesters/SemesterListView';
import { EnrollmentListView } from '../features/admin/enrollments/EnrollmentListView';
import { RegistrationPeriodView } from '../features/admin/registration-periods/RegistrationPeriodView';

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
    case 'academic-years':
      return <AcademicYearListView triggerToast={triggerToast} />;
    case 'semesters':
      return <SemesterListView triggerToast={triggerToast} />;
    case 'majors':
      return <MajorListView triggerToast={triggerToast} />;
    case 'subjects':
      return <SubjectListView triggerToast={triggerToast} />;
    case 'classes':
      return <ClassSectionListView triggerToast={triggerToast} />;
    case 'registration':
      return <RegistrationPeriodView triggerToast={triggerToast} />;
    case 'enrollments':
      return <EnrollmentListView triggerToast={triggerToast} />;
    case 'teachers':
      return <TeacherListView triggerToast={triggerToast} />;
    case 'students':
      return <StudentListView triggerToast={triggerToast} />;
    case 'users':
      return <UserManagement triggerToast={triggerToast} />;
    case 'announcements':
      return <AnnouncementsView triggerToast={triggerToast} />;
    default:
      return <DashboardView />;
  }
};
