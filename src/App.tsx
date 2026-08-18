/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthViewModel } from './viewmodels/useAuthViewModel';
import { LoginView } from './views/LoginView';
import { Layout } from './components/Layout';
import { AdminPortal } from './views/AdminPortal';
import { TeacherPortal } from './views/TeacherPortal';
import { StudentPortal } from './views/StudentPortal';
import { Toast, ToastType } from './components/Toast';
import { Student, Teacher } from './models';

function AppContent() {
  const navigate = useNavigate();
  const auth = useAuthViewModel();

  // Active Tab states for each portal
  const [adminTab, setAdminTab] = useState('dashboard');
  const [teacherTab, setTeacherTab] = useState('dashboard');
  const [studentTab, setStudentTab] = useState('dashboard');

  // Floating Toast states
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const triggerToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleLoginSubmit = async (user: string, pass: string) => {
    const loggedUser = await auth.login(user, pass);
    if (loggedUser) {
      triggerToast(`Chào mừng ${loggedUser.name} đăng nhập thành công!`, 'success');
      // Navigate to portal
      if (loggedUser.role === 'admin') {
        setAdminTab('dashboard');
        navigate('/admin');
      } else if (loggedUser.role === 'teacher') {
        setTeacherTab('dashboard');
        navigate('/teacher');
      } else if (loggedUser.role === 'student') {
        setStudentTab('dashboard');
        navigate('/student');
      }
    }
  };

  const handleLogoutAction = () => {
    auth.logout();
    triggerToast('Bạn đã đăng xuất khỏi hệ thống thành công.', 'info');
    navigate('/login');
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="relative h-12 w-12 flex items-center justify-center">
          <div className="absolute h-full w-full rounded-full border-4 border-slate-200 border-t-blue-650 border-t-blue-600 animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-slate-450 mt-4 tracking-wider animate-pulse uppercase">Khởi động hệ thống học tập...</p>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={
            auth.currentUser ? (
              <Navigate to={auth.currentUser.role === 'admin' ? '/admin' : auth.currentUser.role === 'teacher' ? '/teacher' : '/student'} replace />
            ) : (
              <LoginView onLogin={handleLoginSubmit} isLoading={auth.isLoading} error={auth.error} />
            )
          }
        />

        {/* Guarded Admin Route */}
        <Route
          path="/admin"
          element={
            auth.currentUser && auth.currentUser.role === 'admin' ? (
              <Layout
                user={auth.currentUser}
                profileName={auth.currentUser.name}
                activeTab={adminTab}
                setActiveTab={setAdminTab}
                onLogout={handleLogoutAction}
              >
                <AdminPortal activeTab={adminTab} onTabChange={setAdminTab} triggerToast={triggerToast} />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Guarded Teacher Route */}
        <Route
          path="/teacher"
          element={
            auth.currentUser && auth.currentUser.role === 'teacher' && auth.currentProfile ? (
              <Layout
                user={auth.currentUser}
                profileName={auth.currentUser.name}
                activeTab={teacherTab}
                setActiveTab={setTeacherTab}
                onLogout={handleLogoutAction}
              >
                <TeacherPortal
                  teacherProfile={auth.currentProfile as Teacher}
                  activeTab={teacherTab}
                  triggerToast={triggerToast}
                />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Guarded Student Route */}
        <Route
          path="/student"
          element={
            auth.currentUser && auth.currentUser.role === 'student' && auth.currentProfile ? (
              <Layout
                user={auth.currentUser}
                profileName={auth.currentUser.name}
                activeTab={studentTab}
                setActiveTab={setStudentTab}
                onLogout={handleLogoutAction}
              >
                <StudentPortal
                  studentProfile={auth.currentProfile as Student}
                  activeTab={studentTab}
                  triggerToast={triggerToast}
                />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback Catch */}
        <Route
          path="*"
          element={
            <Navigate to="/login" replace />
          }
        />
      </Routes>

      {/* Floating global notifications alerts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
