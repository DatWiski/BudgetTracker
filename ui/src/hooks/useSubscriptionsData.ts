import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { convertToMonthly } from '../utils/currency';
import type { Category, PaginatedResponse, Subscription, UserCurrencyResponse } from '../types';

export const useSubscriptionsData = () => {
  const {
    data: subscriptionsPage,
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useQuery<PaginatedResponse<Subscription>>({
    queryKey: ['subscriptions'],
    queryFn: () => apiRequest<PaginatedResponse<Subscription>>('/api/subscriptions'),
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiRequest<Category[]>('/api/categories'),
  });

  const { data: currencyResp } = useQuery<UserCurrencyResponse>({
    queryKey: ['user-currency'],
    queryFn: () => apiRequest<UserCurrencyResponse>('/api/user/currency'),
  });

  const safeSubscriptions = Array.isArray(subscriptionsPage?.content)
    ? subscriptionsPage!.content
    : [];
  const safeCategories = Array.isArray(categories) ? categories! : [];

  const totalMonthlySpend = safeSubscriptions
    .filter((s: Subscription) => s.active)
    .reduce((acc: number, s: Subscription) => acc + convertToMonthly(s.price, s.period), 0);

  const isLoading = subscriptionsLoading || categoriesLoading;
  const error = subscriptionsError || categoriesError;

  const refetchAll = () => {
    refetchSubscriptions();
    refetchCategories();
  };

  const currency = currencyResp?.currency ?? 'USD';

  return {
    // raw
    subscriptionsPage,
    categories,
    currency,
    // derived
    safeSubscriptions,
    safeCategories,
    totalMonthlySpend,
    // states
    isLoading,
    error,
    // actions
    refetchAll,
    refetchSubscriptions,
    refetchCategories,
  };
};


