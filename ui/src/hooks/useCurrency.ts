import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCurrency = () => {
  const queryClient = useQueryClient();

  const { data: userCurrency, isLoading } = useQuery<string>({
    queryKey: ['user-currency'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/currency', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch currency');
      }
      
      const data = await response.json();
      return data.currency;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: async (currency: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/currency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currency })
      });

      if (!response.ok) {
        throw new Error('Failed to update currency');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-currency'] });
      // Invalidate other queries that depend on currency
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    }
  });

  return {
    currency: userCurrency || 'USD', // Default to USD if not loaded yet
    isLoading,
    updateCurrency: updateCurrencyMutation.mutate,
    isUpdating: updateCurrencyMutation.isPending
  };
};