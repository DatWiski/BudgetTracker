import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import type { PaginatedResponse, Subscription } from '../types';

export const useSubscriptions = () => {
  const { data: subscriptionsPage, isLoading, error, refetch } = useQuery<PaginatedResponse<Subscription>>({
    queryKey: ['subscriptions'],
    queryFn: () => apiRequest<PaginatedResponse<Subscription>>('/api/subscriptions'),
    retry: 2
  });

  // Extract subscriptions from paginated response
  const subscriptions = Array.isArray(subscriptionsPage?.content) ? subscriptionsPage.content : [];

  return {
    subscriptions,
    isLoading,
    error,
    refetch,
    totalElements: subscriptionsPage?.totalElements || 0,
    totalPages: subscriptionsPage?.totalPages || 0
  };
};