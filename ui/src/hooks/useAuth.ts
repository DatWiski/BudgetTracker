import { useQuery } from '@tanstack/react-query';
import type { AuthStatus } from '../types';

export const useAuth = () => {
  const { data: authStatus, isLoading, error } = useQuery<AuthStatus>({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to check auth status');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false, // Don't recheck on focus
    refetchOnMount: false // Don't always refetch on mount
  });

  const isAuthenticated = authStatus?.authenticated || false;

  return {
    isAuthenticated,
    username: authStatus?.username,
    isLoading,
    error
  };
};