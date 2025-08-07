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
    staleTime: 0, // Always recheck auth status
    gcTime: 0, // Don't cache auth queries
    refetchOnWindowFocus: true, // Recheck when window gets focus
    refetchOnMount: true // Always refetch when component mounts
  });

  const isAuthenticated = authStatus?.authenticated || false;

  return {
    isAuthenticated,
    username: authStatus?.username,
    isLoading,
    error
  };
};