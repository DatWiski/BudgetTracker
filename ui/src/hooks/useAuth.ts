import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import type { AuthStatus } from '../types';
import { tokenStorage, type UserInfo } from '../utils/tokenStorage';

export const useAuth = () => {
  const [localUser, setLocalUser] = useState<UserInfo | null>(() => tokenStorage.getUserInfo());
  const queryClient = useQueryClient();

  const token = tokenStorage.getToken();
  const hasValidToken = Boolean(token && !tokenStorage.isTokenExpired());

  const { data: authStatus, isLoading, error } = useQuery<AuthStatus>({
    queryKey: ['auth-status'],
    queryFn: async () => {
      const currentToken = tokenStorage.getToken();
      if (!currentToken || tokenStorage.isTokenExpired()) {
        throw new Error('No valid token');
      }

      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          tokenStorage.clear();
          setLocalUser(null);
        }
        throw new Error('Failed to check auth status');
      }
      return response.json();
    },
    retry: 1,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: hasValidToken // Only run query if we have a valid token
  });

  const isAuthenticated = hasValidToken && (authStatus?.authenticated || false);

  const login = useCallback((token: string, user: UserInfo, expiresIn?: number) => {
    tokenStorage.setToken(token, expiresIn);
    tokenStorage.setUserInfo(user);
    setLocalUser(user);
    queryClient.invalidateQueries({ queryKey: ['auth-status'] });
  }, [queryClient]);

  const logout = useCallback(async () => {
    await tokenStorage.logout();
    setLocalUser(null);
    queryClient.clear();
    // Redirect to login
    window.location.href = '/login';
  }, [queryClient]);

  // Auto-logout when token expires
  useEffect(() => {
    if (token && tokenStorage.isTokenExpired()) {
      logout();
    }
  }, [token, logout]);

  // Check for token expiring soon and refresh automatically
  useEffect(() => {
    const refreshTokenIfNeeded = async () => {
      if (token && tokenStorage.isTokenExpiringSoon(10)) {
        try {
          const refreshResult = await tokenStorage.refreshToken();
          if (refreshResult) {
            login(refreshResult.token, refreshResult.user, refreshResult.expiresIn);
          } else {
            // Refresh failed, logout user
            logout();
          }
        } catch {
          logout();
        }
      }
    };

    if (token && isAuthenticated) {
      refreshTokenIfNeeded();
    }
  }, [token, isAuthenticated, login, logout]);

  return {
    isAuthenticated,
    username: localUser?.name || authStatus?.username,
    user: localUser,
    token,
    login,
    logout,
    isLoading: hasValidToken ? isLoading : false,
    error: hasValidToken ? error : null
  };
};