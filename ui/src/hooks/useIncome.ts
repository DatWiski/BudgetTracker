import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import type { Income, IncomeRequest, PaginatedResponse } from '../types';

export const useIncome = (page = 0, size = 20, sortBy = 'incomeDate', sortDir = 'desc') => {
  return useQuery({
    queryKey: ['income', page, size, sortBy, sortDir],
    queryFn: async (): Promise<PaginatedResponse<Income>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      });
      
      return await apiRequest(`/api/income?${params}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incomeData: IncomeRequest): Promise<Income> => {
      return await apiRequest('/api/income', {
        method: 'POST',
        body: JSON.stringify(incomeData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...incomeData }: { id: number } & IncomeRequest): Promise<Income> => {
      return await apiRequest(`/api/income/${id}`, {
        method: 'PUT',
        body: JSON.stringify(incomeData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest(`/api/income/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
};

export const useIncomePeriod = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['income', 'period', startDate, endDate],
    queryFn: async (): Promise<Income[]> => {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      return await apiRequest(`/api/income/period?${params}`);
    },
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useTotalIncome = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['income', 'total', startDate, endDate],
    queryFn: async (): Promise<number> => {
      const params = new URLSearchParams({
        startDate,
        endDate
      });
      
      return await apiRequest(`/api/income/total?${params}`);
    },
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};