/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { User, Student, Teacher } from '../models';

export function useAuthViewModel() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Student | Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Khôi phục phiên đăng nhập khi load lại trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // API trả về format ApiResponse<UserResponse>
      // Đã config axios chặn bắt result
      const userResponse: any = await axiosClient.get('/auth/me');
      
      let userRole: 'admin' | 'teacher' | 'student' = 'student';
      if (userResponse.roles) {
        const roleNames = userResponse.roles.map((r: any) => r.name);
        if (roleNames.includes('ROLE_ADMIN') || roleNames.includes('ADMIN')) userRole = 'admin';
        else if (roleNames.includes('ROLE_TEACHER') || roleNames.includes('TEACHER')) userRole = 'teacher';
        else if (roleNames.includes('ROLE_STUDENT') || roleNames.includes('STUDENT')) userRole = 'student';
      }

      const mappedUser: User = {
        id: String(userResponse.id),
        username: userResponse.username,
        role: userRole,
        name: userResponse.fullName || userResponse.username,
        email: userResponse.email || '',
        phone: userResponse.phone || '',
        avatar: userResponse.avatarUrl,
        createdAt: userResponse.createdAt || new Date().toISOString()
      };

      setCurrentUser(mappedUser);
      
      // Tạm thời tạo profile fake để không crash UI các trang nội bộ
      // Phase sau sẽ gọi API lấy thông tin Student/Teacher chi tiết
      if (userRole === 'student') {
        setCurrentProfile({
          id: String(userResponse.id),
          userId: String(userResponse.id),
          name: mappedUser.name,
          email: mappedUser.email,
          phone: mappedUser.phone || '',
          studentCode: userResponse.studentCode || 'N/A',
          majorName: userResponse.majorName || 'Chưa cập nhật',
          classCode: userResponse.schoolClassName || 'Chưa phân lớp',
          status: 'active',
          dateOfBirth: userResponse.dateOfBirth || 'Chưa cập nhật',
          gender: userResponse.gender || 'Chưa cập nhật',
          gpa: userResponse.gpa || 0,
          totalCredits: userResponse.totalCredits || 0
        } as any);
      } else if (userRole === 'teacher') {
        setCurrentProfile({
          id: String(userResponse.id),
          userId: String(userResponse.id),
          name: mappedUser.name,
          email: mappedUser.email,
          phone: mappedUser.phone || '',
          teacherCode: userResponse.teacherCode || String(userResponse.id),
          department: userResponse.departmentName || 'N/A',
          title: userResponse.title || 'Giảng viên',
          status: 'active'
        } as any);
      }

    } catch (err: any) {
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: any = await axiosClient.post('/auth/login', { username, password });
      
      // Backend trả về AuthResponse { token, role, userInfo }
      if (response && response.token) {
        localStorage.setItem('token', response.token);
        
        let mappedRole: 'admin' | 'teacher' | 'student' = 'student';
        if (response.role === 'ROLE_ADMIN' || response.role === 'ADMIN') mappedRole = 'admin';
        if (response.role === 'ROLE_TEACHER' || response.role === 'TEACHER') mappedRole = 'teacher';
        
        const mappedUser: User = {
          id: String(response.userInfo?.id || '1'),
          username: response.userInfo?.username || username,
          role: mappedRole,
          name: response.userInfo?.fullName || username,
          email: response.userInfo?.email || '',
          createdAt: new Date().toISOString()
        };

        setCurrentUser(mappedUser);
        
        if (mappedRole === 'student') {
          setCurrentProfile({
            id: String(mappedUser.id),
            userId: String(mappedUser.id),
            name: mappedUser.name,
            email: mappedUser.email,
            phone: response.userInfo?.phone || '',
            studentCode: response.userInfo?.studentCode || 'N/A',
            majorName: response.userInfo?.majorName || 'Chưa cập nhật',
            classCode: response.userInfo?.schoolClassName || 'Chưa phân lớp',
            status: 'active',
            dateOfBirth: response.userInfo?.dateOfBirth || 'Chưa cập nhật',
            gender: response.userInfo?.gender || 'Chưa cập nhật',
            gpa: response.userInfo?.gpa || 0,
            totalCredits: response.userInfo?.totalCredits || 0
          } as any);
        } else if (mappedRole === 'teacher') {
          setCurrentProfile({
            id: String(mappedUser.id),
            userId: String(mappedUser.id),
            name: mappedUser.name,
            email: mappedUser.email,
            phone: response.userInfo?.phone || '',
            teacherCode: response.userInfo?.teacherCode || String(mappedUser.id),
            department: response.userInfo?.departmentName || 'N/A',
            title: response.userInfo?.title || 'Giảng viên',
            status: 'active'
          } as any);
        }

        return mappedUser;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentProfile(null);
    setError(null);
    
    // Gọi API logout ngầm
    axiosClient.post('/auth/logout').catch(() => {});
  };

  const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    try {
      await axiosClient.put('/auth/change-password', {
        oldPassword: oldPass,
        newPassword: newPass
      });
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Lỗi đổi mật khẩu');
    }
  };

  const updateProfileInfo = (updates: any) => {
    // API Cập nhật profile sẽ được xử lý sau ở Phase 2
    console.log('Update profile not implemented in Phase 1 yet', updates);
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
