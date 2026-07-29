/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  Award,
  Megaphone,
  Clock,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { AIChatInterface } from './AIChatInterface';
import { User as UserType } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface LayoutProps {
  user: UserType;
  profileName: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  user,
  profileName,
  activeTab,
  setActiveTab,
  onLogout,
  children
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Define navigation based on User Role
  const getNavItems = (): NavItem[] => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Bảng thống kê', icon: ShieldAlert },
          { id: 'departments', label: 'Quản lý Khoa', icon: Settings },
          { id: 'majors', label: 'Quản lý Ngành', icon: Layers },
          { id: 'subjects', label: 'Quản lý Môn học', icon: BookOpen },
          { id: 'classes', label: 'Quản lý Lớp học', icon: Calendar },
          { id: 'teachers', label: 'Quản lý Giảng viên', icon: GraduationCap },
          { id: 'students', label: 'Quản lý Sinh viên', icon: Users },
          { id: 'announcements', label: 'Thông báo & Email', icon: Megaphone }
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Lớp được phân công', icon: BookOpen },
          { id: 'attendance', label: 'Điểm danh học viên', icon: Calendar },
          { id: 'materials', label: 'Tài liệu học tập', icon: FileTextIcon },
          { id: 'assignments', label: 'Chấm bài tập', icon: Award },
          { id: 'grades', label: 'Nhập & Xuất Điểm', icon: GridIcon },
          { id: 'profile', label: 'Hồ sơ giảng viên', icon: User }
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Trang cá nhân', icon: GraduationCap },
          { id: 'schedule', label: 'Thời khóa biểu tuần', icon: Calendar },
          { id: 'registration', label: 'Đăng ký học phần', icon: Clock },
          { id: 'study', label: 'Góc học tập & Tài liệu', icon: BookOpen },
          { id: 'homework', label: 'Nộp bài tập trực tuyến', icon: Award },
          { id: 'academic-progress', label: 'Theo dõi học tập', icon: TrendingUp },
          { id: 'profile', label: 'Hồ sơ sinh viên', icon: User }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (user.role) {
      case 'admin':
        return <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1 rounded-full font-medium border border-red-100">Quản trị viên</span>;
      case 'teacher':
        return <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium border border-blue-100">Giảng viên</span>;
      case 'student':
        return <span className="bg-emerald-50 text-emerald-600 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-100">Sinh viên</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transform transition-transform duration-300 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">HƯNG NHÂN</h1>
              <span className="text-[10px] font-medium tracking-wider text-slate-500">SMART EDUCATION</span>
            </div>
          </div>
          <button className="p-1 rounded-lg hover:bg-slate-800 md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            {user.role === 'admin' ? 'Hệ thống Quản trị' : user.role === 'teacher' ? 'Cổng Giảng viên' : 'Cổng Sinh viên'}
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-blue-200" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg mb-3 hover:bg-slate-800/40 transition-colors">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120'}
              alt={profileName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profileName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-slate-850/50 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5 text-slate-400 hover:text-red-400" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-45">
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-slate-100 md:hidden text-slate-600" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-slate-800 capitalize">
                {navItems.find(item => item.id === activeTab)?.label || 'Bảng điều khiển'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              {getRoleBadge()}
            </div>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Vai trò đăng nhập:</span>
              <span className="text-xs font-bold text-slate-800 capitalize bg-slate-100 px-2 py-1 rounded-md">{user.role}</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      <AIChatInterface />
    </div>
  );
};

// Simple Fallbacks for required icons inside layouts
const FileTextIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);

const GridIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
