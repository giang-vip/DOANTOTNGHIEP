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
import { MajorSubjectListView } from '../features/admin/major-subjects/MajorSubjectListView';
import { UserManagement } from '../features/admin/users/UserManagement';
import { AcademicYearListView } from '../features/admin/academic-years/AcademicYearListView';
import { SemesterListView } from '../features/admin/semesters/SemesterListView';
import { EnrollmentListView } from '../features/admin/enrollments/EnrollmentListView';
import { RegistrationPeriodView } from '../features/admin/registration-periods/RegistrationPeriodView';

interface AdminPortalProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  triggerToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ activeTab, onTabChange, triggerToast }) => {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'departments':
      return <DepartmentListView onTabChange={onTabChange} triggerToast={triggerToast} />;
    case 'academic-years':
      return <AcademicYearListView onTabChange={onTabChange} triggerToast={triggerToast} />;
    case 'semesters':
      return <SemesterListView onTabChange={onTabChange} triggerToast={triggerToast} />;
    case 'majors':
      return <MajorListView onTabChange={onTabChange} triggerToast={triggerToast} />;
    case 'major-subjects':
      return <MajorSubjectListView onTabChange={onTabChange} triggerToast={triggerToast} />;
    case 'subjects':
      return <SubjectListView onTabChange={onTabChange} triggerToast={triggerToast} />;
    case 'classes':
      return <ClassSectionListView onTabChange={onTabChange} triggerToast={triggerToast} />;
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
