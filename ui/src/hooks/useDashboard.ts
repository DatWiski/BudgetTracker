import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../utils/api";
import type { DashboardOverview } from "../types";

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
