import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import type { AuthStatus } from "../types";
import { tokenStorage, type UserInfo } from "../utils/tokenStorage";

export const useAuth = () => {
  const [localUser, setLocalUser] = useState<UserInfo | null>(() => tokenStorage.getUserInfo());
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  const token = tokenStorage.getToken();
  const hasValidToken = Boolean(token && !tokenStorage.isTokenExpired());

  console.log("🔓 useAuth: Current state", {
    hasToken: !!token,
    hasValidToken,
    hasLocalUser: !!localUser,
    isInitializing,
  });

  const {
    data: authStatus,
    isLoading,
    error,
  } = useQuery<AuthStatus>({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const currentToken = tokenStorage.getToken();
      if (!currentToken || tokenStorage.isTokenExpired()) {
        throw new Error("No valid token");
      }

      const response = await fetch("/api/auth/status", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          tokenStorage.clear();
          setLocalUser(null);
        }
        throw new Error("Failed to check auth status");
      }
      return response.json();
    },
    retry: 1,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: hasValidToken, // Only run query if we have a valid token
  });

  // Calculate authentication state
  const isAuthenticated = hasValidToken && (authStatus?.authenticated || false);
  const finalIsLoading = isInitializing || (hasValidToken ? isLoading : false);

  const login = useCallback(
    (token: string, user: UserInfo, expiresIn?: number) => {
      tokenStorage.setToken(token, expiresIn);
      tokenStorage.setUserInfo(user);
      setLocalUser(user);
      queryClient.invalidateQueries({ queryKey: ["auth-status"] });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await tokenStorage.logout();
    setLocalUser(null);
    queryClient.clear();
    // Redirect to login
    window.location.href = "/login";
  }, [queryClient]);

  // CRITICAL: Try to refresh token on page load (only once!)
  useEffect(() => {
    const attemptInitialRefresh = async () => {
      console.log("🔓 useAuth: Starting initial refresh attempt on page load");

      // Get current values at execution time
      const currentToken = tokenStorage.getToken();
      const currentHasValidToken = Boolean(currentToken && !tokenStorage.isTokenExpired());
      const currentUser = tokenStorage.getUserInfo();

      // If we already have a valid token, no need to refresh
      if (currentHasValidToken) {
        console.log("🔓 useAuth: Already have valid token, skipping initial refresh");
        setIsInitializing(false);
        return;
      }

      // If we have no user info at all, user probably needs to login fresh
      if (!currentUser) {
        console.log("🔓 useAuth: No user info, user needs fresh login");
        setIsInitializing(false);
        return;
      }

      try {
        console.log("🔓 useAuth: Attempting refresh for existing user");
        const refreshResult = await tokenStorage.refreshToken();

        if (refreshResult) {
          console.log("✅ useAuth: Initial refresh successful");
          tokenStorage.setToken(refreshResult.token, refreshResult.expiresIn);
          setLocalUser(refreshResult.user);
          queryClient.invalidateQueries({ queryKey: ["auth-status"] });
        } else {
          console.log("❌ useAuth: Initial refresh failed, user needs to login");
          // Don't logout here - just let them see login page
        }
      } catch (error) {
        console.log("❌ useAuth: Initial refresh error", error);
        // Don't logout here - just let them see login page
      } finally {
        setIsInitializing(false);
      }
    };

    // Only run once on mount - using ref values to avoid dependencies
    attemptInitialRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - run once on mount only

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

    if (token && isAuthenticated && !isInitializing) {
      refreshTokenIfNeeded();
    }
  }, [token, isAuthenticated, isInitializing, login, logout]);

  console.log("🔓 useAuth: Final state", {
    isAuthenticated,
    finalIsLoading,
    hasValidToken,
    authStatusAuthenticated: authStatus?.authenticated,
  });

  return {
    isAuthenticated,
    username: localUser?.name || authStatus?.username,
    user: localUser,
    token,
    login,
    logout,
    isLoading: finalIsLoading,
    error: hasValidToken ? error : null,
  };
};
