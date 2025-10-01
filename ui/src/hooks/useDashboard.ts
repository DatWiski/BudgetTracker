import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";
import type { DashboardOverview, FinancialTimeSeries, CategoryBreakdown } from "../types";

export const useDashboard = (enabled: boolean = true) => {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async (): Promise<DashboardOverview> => {
      return await apiRequest("/api/dashboard/overview");
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: enabled, // Only run when enabled
  });

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
};

export const useFinancialTimeSeries = (months: number = 6, enabled: boolean = true) => {
  const timeSeriesQuery = useQuery({
    queryKey: ["dashboard", "time-series", months],
    queryFn: async (): Promise<FinancialTimeSeries> => {
      return await apiRequest(`/api/dashboard/time-series?months=${months}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled, // Only run when enabled
  });

  return {
    data: timeSeriesQuery.data,
    isLoading: timeSeriesQuery.isLoading,
    error: timeSeriesQuery.error,
    refetch: timeSeriesQuery.refetch,
  };
};

export const useCategoryBreakdown = (enabled: boolean = true) => {
  const categoryQuery = useQuery({
    queryKey: ["dashboard", "category-breakdown"],
    queryFn: async (): Promise<CategoryBreakdown> => {
      return await apiRequest("/api/dashboard/category-breakdown");
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled, // Only run when enabled
  });

  return {
    data: categoryQuery.data,
    isLoading: categoryQuery.isLoading,
    error: categoryQuery.error,
    refetch: categoryQuery.refetch,
  };
};
