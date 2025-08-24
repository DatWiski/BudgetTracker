const USER_KEY = 'budget_tracker_user';

export interface UserInfo {
  id: number;
  email: string;
  name: string;
}

interface TokenRefreshResponse {
  accessToken: string;
  expiresIn: number;
  user: UserInfo;
}

// In-memory storage for access token
let accessToken: string | null = null;
let tokenExpiryTime: number | null = null;
let refreshPromise: Promise<{ token: string; user: UserInfo; expiresIn: number } | null> | null = null;

export const tokenStorage = {
  getToken(): string | null {
    return accessToken;
  },

  setToken(token: string, expiresIn: number = 30 * 60): void {
    accessToken = token;
    tokenExpiryTime = Date.now() + (expiresIn * 1000); // Convert to milliseconds
  },

  removeToken(): void {
    accessToken = null;
    tokenExpiryTime = null;
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore storage errors
    }
  },

  isTokenExpired(): boolean {
    if (!accessToken || !tokenExpiryTime) {
      return true;
    }
    return Date.now() >= tokenExpiryTime;
  },

  isTokenExpiringSoon(minutesBefore: number = 5): boolean {
    if (!accessToken || !tokenExpiryTime) {
      return true;
    }
    const expiresInMs = tokenExpiryTime - Date.now();
    return expiresInMs < (minutesBefore * 60 * 1000);
  },

  getUserInfo(): UserInfo | null {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUserInfo(user: UserInfo): void {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors
    }
  },


  clear(): void {
    this.removeToken();
  },

  async refreshToken(): Promise<{ token: string; user: UserInfo; expiresIn: number } | null> {
    // Return existing refresh promise if already in progress
    if (refreshPromise) {
      return refreshPromise;
    }

    // Create new refresh promise
    refreshPromise = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include', // Include cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data: TokenRefreshResponse = await response.json();
          return {
            token: data.accessToken,
            user: data.user,
            expiresIn: data.expiresIn
          };
        }
        
        return null;
      } catch {
        return null;
      } finally {
        // Clear the promise when done
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Ignore errors, still clear local state
    } finally {
      this.clear();
    }
  }
};