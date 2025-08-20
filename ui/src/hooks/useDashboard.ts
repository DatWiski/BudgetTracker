import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import type { DashboardOverview } from '../types';

export const useDashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async (): Promise<DashboardOverview> => {
      return await apiRequest('/api/dashboard/overview');
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
};