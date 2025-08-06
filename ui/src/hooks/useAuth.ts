import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

interface AuthStatus {
  authenticated: boolean;
  username?: string;
}

export const useAuth = () => {
  const navigate = useNavigate();
  
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
    retry: 1
  });

  const isAuthenticated = authStatus?.authenticated || false;

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  return {
    isAuthenticated,
    username: authStatus?.username,
    isLoading,
    error
  };
};