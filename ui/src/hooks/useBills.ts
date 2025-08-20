import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import type { Bill, BillRequest, PaginatedResponse } from '../types';

export const useBills = () => {
  const { data: billsPage, isLoading, error, refetch } = useQuery<PaginatedResponse<Bill>>({
    queryKey: ['bills'],
    queryFn: () => apiRequest<PaginatedResponse<Bill>>('/api/bills'),
    retry: 2
  });

  // Extract bills from paginated response
  const bills = Array.isArray(billsPage?.content) ? billsPage.content : [];

  return {
    bills,
    isLoading,
    error,
    refetch,
    totalElements: billsPage?.totalElements || 0,
    totalPages: billsPage?.totalPages || 0
  };
};

export const useCreateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bill: BillRequest) => 
      apiRequest('/api/bills', {
        method: 'POST',
        body: JSON.stringify(bill)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
};

export const useUpdateBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: { id: number } & BillRequest) =>
      apiRequest(`/api/bills/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
};

export const useDeleteBill = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/bills/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['bill-categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
    },
  });
};