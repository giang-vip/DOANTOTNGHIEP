/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useStore } from '../models/store';
import { User, Student, Teacher } from '../types';

export function useAuthViewModel() {
  const { users, students, teachers, updateUser } = useStore();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Student | Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize passwords database in localStorage if empty
  useEffect(() => {
    const existingPwds = localStorage.getItem('hn_passwords');
    if (!existingPwds) {
      const initialPwds: Record<string, string> = {
        admin: 'admin123',
        gv_nguyenvana: '123',
        gv_tranb: '123',
        gv_lehoangc: '123',
        sv_nguyenxuanmanh: '123',
        sv_phamminhduc: '123',
        sv_lethuthao: '123',
        sv_tranhoanganh: '123',
        sv_doanquocbao: '123'
      };
      localStorage.setItem('hn_passwords', JSON.stringify(initialPwds));
    }
  }, []);

  // Load session from localStorage on mount
  useEffect(() => {
    const sessionUserId = localStorage.getItem('hn_session_user_id');
    if (sessionUserId && users.length > 0) {
      const user = users.find(u => u.id === sessionUserId);
      if (user) {
        setCurrentUser(user);
        resolveProfile(user);
      }
    }
    setIsLoading(false);
  }, [users, students, teachers]);

  const resolveProfile = (user: User) => {
    if (user.role === 'student') {
      const profile = students.find(s => s.userId === user.id);
      if (profile) setCurrentProfile(profile);
    } else if (user.role === 'teacher') {
      const profile = teachers.find(t => t.userId === user.id);
      if (profile) setCurrentProfile(profile);
    } else {
      setCurrentProfile(null);
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    // Simulate small delay for realistic loading state
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!user) {
      setError('Tài khoản không tồn tại trên hệ thống');
      setIsLoading(false);
      return null;
    }

    // Check password
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    const correctPassword = pwds[username.toLowerCase().trim()] || '123'; // default 123 for newly created accounts

    if (password !== correctPassword) {
      setError('Mật khẩu không chính xác');
      setIsLoading(false);
      return null;
    }

    // Success
    localStorage.setItem('hn_session_user_id', user.id);
    setCurrentUser(user);
    resolveProfile(user);
    setIsLoading(false);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('hn_session_user_id');
    setCurrentUser(null);
    setCurrentProfile(null);
    setError(null);
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    const username = currentUser.username;
    const pwds = JSON.parse(localStorage.getItem('hn_passwords') || '{}');
    const currentPass = pwds[username] || '123';

    if (oldPass !== currentPass) {
      throw new Error('Mật khẩu hiện tại không chính xác');
    }

    pwds[username] = newPass;
    localStorage.setItem('hn_passwords', JSON.stringify(pwds));
    return true;
  };

  const updateProfileInfo = (updates: { email?: string; phone?: string; name?: string; birthDate?: string; gender?: 'Nam' | 'Nữ' | 'Khác' }) => {
    if (!currentUser) return;

    // Sync back to User account
    const userUpdates: Partial<User> = {};
    if (updates.email) userUpdates.email = updates.email;
    if (updates.phone) userUpdates.phone = updates.phone;
    if (updates.name) userUpdates.name = updates.name;
    if (Object.keys(userUpdates).length > 0) {
      updateUser(currentUser.id, userUpdates);
    }

    // Update in actual database lists inside localStorage via trigger
    if (currentUser.role === 'student' && currentProfile) {
      const studentProfile = currentProfile as Student;
      // We will perform localstorage edit directly and sync, or ideally let store handle it
      const savedStudents = JSON.parse(localStorage.getItem('hn_students') || '[]');
      const updatedStudents = savedStudents.map((s: Student) => 
        s.id === studentProfile.id ? { ...s, ...updates } : s
      );
      localStorage.setItem('hn_students', JSON.stringify(updatedStudents));
      // Trigger a window event or let react state update
      setCurrentProfile({ ...studentProfile, ...updates });
    } else if (currentUser.role === 'teacher' && currentProfile) {
      const teacherProfile = currentProfile as Teacher;
      const savedTeachers = JSON.parse(localStorage.getItem('hn_teachers') || '[]');
      const updatedTeachers = savedTeachers.map((t: Teacher) => 
        t.id === teacherProfile.id ? { ...t, ...updates } : t
      );
      localStorage.setItem('hn_teachers', JSON.stringify(updatedTeachers));
      setCurrentProfile({ ...teacherProfile, ...updates });
    }
  };

  return {
    currentUser,
    currentProfile,
    isLoading,
    error,
    login,
    logout,
    changePassword,
    updateProfileInfo
  };
}
