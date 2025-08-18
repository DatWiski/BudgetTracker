import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import type { Income, Category, PaginatedResponse, UserCurrencyResponse } from '../types';

export const useIncomeData = () => {
  // Fetch income entries
  const incomeQuery = useQuery({
    queryKey: ['income'],
    queryFn: async (): Promise<PaginatedResponse<Income>> => {
      return await apiRequest('/api/income?size=1000&sortBy=incomeDate&sortDir=desc');
    },
    staleTime: 1000 * 60 * 5,
  });

  // Fetch income categories only
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'income'],
    queryFn: async (): Promise<Category[]> => {
      return await apiRequest('/api/categories?type=income');
    },
    staleTime: 1000 * 60 * 10,
  });

  // Fetch user currency
  const currencyQuery = useQuery({
    queryKey: ['user', 'currency'],
    queryFn: async (): Promise<UserCurrencyResponse> => {
      return await apiRequest('/api/user/currency');
    },
    staleTime: 1000 * 60 * 30,
  });

  // Calculate total monthly income (current month)
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const totalMonthlyIncome = incomeQuery.data?.content?.reduce((total, income) => {
    const incomeDate = new Date(income.incomeDate);
    if (incomeDate >= currentMonthStart && incomeDate <= currentMonthEnd) {
      return total + income.amount;
    }
    return total;
  }, 0) || 0;

  // Get safe defaults
  const safeIncome = incomeQuery.data?.content || [];
  const safeCategories = categoriesQuery.data || [];
  const currency = currencyQuery.data?.currency || 'USD';

  const isLoading = incomeQuery.isLoading || categoriesQuery.isLoading || currencyQuery.isLoading;
  const error = incomeQuery.error || categoriesQuery.error || currencyQuery.error;

  const refetchAll = () => {
    incomeQuery.refetch();
    categoriesQuery.refetch();
    currencyQuery.refetch();
  };

  return {
    safeIncome,
    safeCategories,
    currency,
    totalMonthlyIncome,
    isLoading,
    error,
    refetchAll,
  };
};