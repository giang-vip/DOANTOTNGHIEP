import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { UserAdmin, UserCreationRequest, UserUpdateRequest } from '../../../models/UserAdmin';

export function useUserListViewModel() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleName, setRoleName] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserAdmin | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<UserCreationRequest | UserUpdateRequest>({
    username: '',
    password: '',
    email: '',
    fullName: '',
    gender: 'Nam',
    roles: ['STUDENT']
  });

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [roleName, status]);

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminApi.getAllUsers(page, pageSize, debouncedSearch, roleName, status);
        if (isActive) {
          setUsers(response.content || []);
          setTotalPages(response.totalPages || 0);
          setTotalElements(response.totalElements || 0);
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.message || 'Lỗi khi tải dữ liệu người dùng');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [page, pageSize, debouncedSearch, roleName, status]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      username: '',
      password: '',
      email: '',
      fullName: '',
      gender: 'Nam',
      roles: ['STUDENT']
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (item: UserAdmin) => {
    setEditingItem(item);
    setFormData({ 
      email: item.email,
      fullName: item.fullName,
      gender: item.gender || 'Nam',
      status: item.status,
      roles: item.roles ? item.roles.map(r => r.name) : ['STUDENT']
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      roles: [value] 
    }));
  };

  const validate = (): boolean => {
    const tempErrors: Record<string, string> = {};
    if (!editingItem && !('username' in formData ? formData.username.trim() : true)) {
      tempErrors.username = 'Tên đăng nhập không được để trống';
    }
    if (!editingItem && !('password' in formData ? formData.password?.trim() : true)) {
      tempErrors.password = 'Mật khẩu không được để trống';
    }
    if (!formData.email?.trim()) tempErrors.email = 'Email không được để trống';
    if (!formData.fullName?.trim()) tempErrors.fullName = 'Họ tên không được để trống';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async (onSuccess: (msg: string) => void) => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (editingItem && editingItem.id) {
        const updatedUser = await adminApi.updateUser(editingItem.id, formData as UserUpdateRequest);
        setUsers(prev => prev.map(u => u.id === editingItem.id ? updatedUser : u));
        onSuccess(`Đã cập nhật người dùng ${formData.fullName} thành công!`);
      } else {
        const newUser = await adminApi.createUser(formData as UserCreationRequest);
        setUsers(prev => [newUser, ...prev]);
        setTotalElements(prev => prev + 1);
        onSuccess(`Đã tạo tài khoản ${formData.fullName} thành công!`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, username: string, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${username}?`)) {
      setIsLoading(true);
      try {
        await adminApi.deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        setTotalElements(prev => prev - 1);
        onSuccess(`Đã xóa tài khoản ${username} thành công!`);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi xóa người dùng');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResetPassword = async (user: UserAdmin, onSuccess: (msg: string) => void) => {
    if (confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản ${user.username} về mặc định (123456) không?`)) {
      setIsLoading(true);
      try {
        const updateReq = {
          email: user.email,
          fullName: user.fullName,
          gender: user.gender,
          status: user.status,
          roles: user.roles?.map(r => r.name) || [],
          password: '123456'
        } as unknown as UserUpdateRequest;
        const updatedUser = await adminApi.updateUser(user.id, updateReq);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
        onSuccess(`Khôi phục mật khẩu cho ${user.username} thành công!`);
      } catch (err: any) {
        alert(err.message || 'Lỗi khi khôi phục mật khẩu');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    roleName,
    setRoleName,
    status,
    setStatus,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalElements,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    formData,
    errors,
    openAddModal,
    openEditModal,
    handleInputChange,
    handleRoleChange,
    handleSave,
    handleDelete,
    handleResetPassword
  };
}
