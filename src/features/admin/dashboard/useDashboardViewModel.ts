import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { AdminDashboardStats } from '../../../models/AdminDashboard';

export function useDashboardViewModel() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
  };
}
