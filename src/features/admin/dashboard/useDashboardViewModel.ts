import { useState, useEffect } from 'react';
import { adminApi } from '../../../api/services/adminApi';
import { AdminDashboardStats } from '../../../models/AdminDashboard';

export function useDashboardViewModel() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters for Grade Distribution
  const [filters, setFilters] = useState({
    yearId: undefined as number | undefined,
    semesterId: undefined as number | undefined,
    departmentId: undefined as number | undefined,
    majorId: undefined as number | undefined,
    classSectionId: undefined as number | undefined,
  });

  // Options for filters
  const [options, setOptions] = useState({
    years: [] as any[],
    semesters: [] as any[],
    departments: [] as any[],
    majors: [] as any[],
    classes: [] as any[]
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, distData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getGradeDistribution()
        ]);
        setStats(statsData);
        setGradeDistribution(distData);

        // Fetch filter options
        try {
          const [y, s, d, m, c] = await Promise.all([
            adminApi.getAllAcademicYears(),
            adminApi.getAllSemesters(),
            adminApi.getAllDepartments(),
            adminApi.getAllMajorsList(),
            adminApi.getAllClassSections(0, 500)
          ]);
          
          setOptions({
            years: y || [],
            semesters: s || [],
            departments: d || [],
            majors: m || [],
            classes: c.content || []
          });
        } catch (filterErr) {
          console.warn('Không thể tải dữ liệu bộ lọc:', filterErr);
        }

      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải dữ liệu thống kê');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const fetchFilteredDistribution = async (newFilters: typeof filters) => {
    try {
      const data = await adminApi.getGradeDistribution(newFilters);
      setGradeDistribution(data);
    } catch (err) {
      console.error('Lỗi khi tải phổ điểm:', err);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    // Cascading logic could go here if needed (e.g. resetting semester if year changes)
    setFilters(newFilters);
    fetchFilteredDistribution(newFilters);
  };

  const handleBatchFilterChange = (updates: Partial<typeof filters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    fetchFilteredDistribution(newFilters);
  };

  return {
    stats,
    gradeDistribution,
    filters,
    options,
    handleFilterChange,
    handleBatchFilterChange,
    isLoading,
    error,
  };
}
