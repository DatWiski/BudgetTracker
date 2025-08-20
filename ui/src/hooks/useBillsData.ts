import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { convertToMonthly } from '../utils/currency';
import type { Bill, Category, PaginatedResponse, UserCurrencyResponse } from '../types';

export const useBillsData = () => {
  const {
    data: billsPage,
    isLoading: billsLoading,
    error: billsError,
    refetch: refetchBills,
  } = useQuery<PaginatedResponse<Bill>>({
    queryKey: ['bills'],
    queryFn: () => apiRequest<PaginatedResponse<Bill>>('/api/bills'),
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: ['bill-categories'],
    queryFn: () => apiRequest<Category[]>('/api/categories?type=bill'),
  });

  const { data: currencyResp } = useQuery<UserCurrencyResponse>({
    queryKey: ['user-currency'],
    queryFn: () => apiRequest<UserCurrencyResponse>('/api/user/currency'),
  });

  const safeBills = Array.isArray(billsPage?.content)
    ? billsPage!.content
    : [];
  const safeCategories = Array.isArray(categories) ? categories! : [];

  const totalMonthlySpend = safeBills
    .filter((bill: Bill) => bill.active)
    .reduce((acc: number, bill: Bill) => acc + convertToMonthly(bill.amount, bill.period), 0);

  const isLoading = billsLoading || categoriesLoading;
  const error = billsError || categoriesError;

  const refetchAll = () => {
    refetchBills();
    refetchCategories();
  };

  const currency = currencyResp?.currency ?? 'USD';

  return {
    // raw
    billsPage,
    categories,
    currency,
    // derived
    safeBills,
    safeCategories,
    totalMonthlySpend,
    // states
    isLoading,
    error,
    // actions
    refetchAll,
    refetchBills,
    refetchCategories,
  };
};