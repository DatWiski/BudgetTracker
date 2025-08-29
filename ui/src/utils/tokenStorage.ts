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

// Safety controls to prevent login lockout
let refreshAttemptCount = 0;
let lastRefreshAttempt = 0;
const MAX_REFRESH_ATTEMPTS_PER_SESSION = 1; // Only 1 attempt per page load
const REFRESH_TIMEOUT_MS = 5000; // 5 second timeout
const MIN_TIME_BETWEEN_REFRESH_ATTEMPTS = 10000; // 10 seconds between attempts

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
    console.log('🔒 tokenStorage.clear: Clearing all tokens and resetting safety controls');
    this.removeToken();
    // Reset safety controls
    refreshAttemptCount = 0;
    lastRefreshAttempt = 0;
    refreshPromise = null;
  },

  // Method to reset refresh attempt tracking (for testing purposes)
  resetRefreshTracking(): void {
    console.log('🔒 tokenStorage.resetRefreshTracking: Resetting refresh tracking');
    refreshAttemptCount = 0;
    lastRefreshAttempt = 0;
    refreshPromise = null;
  },

  // Debug method to check refresh attempt status
  getRefreshStatus(): { attemptCount: number; timeSinceLastAttempt: number; hasActivePromise: boolean } {
    return {
      attemptCount: refreshAttemptCount,
      timeSinceLastAttempt: Date.now() - lastRefreshAttempt,
      hasActivePromise: !!refreshPromise
    };
  },

  async refreshToken(): Promise<{ token: string; user: UserInfo; expiresIn: number } | null> {
    console.log('🔒 tokenStorage.refreshToken: Starting refresh attempt', {
      attemptCount: refreshAttemptCount,
      timeSinceLastAttempt: Date.now() - lastRefreshAttempt,
      hasExistingPromise: !!refreshPromise
    });

    // Return existing refresh promise if already in progress
    if (refreshPromise) {
      console.log('🔒 tokenStorage.refreshToken: Returning existing promise');
      return refreshPromise;
    }

    // Safety check: prevent too many refresh attempts
    const now = Date.now();
    if (refreshAttemptCount >= MAX_REFRESH_ATTEMPTS_PER_SESSION) {
      console.log('❌ tokenStorage.refreshToken: Max attempts reached, refusing to refresh');
      return null;
    }

    if (now - lastRefreshAttempt < MIN_TIME_BETWEEN_REFRESH_ATTEMPTS) {
      console.log('❌ tokenStorage.refreshToken: Too soon since last attempt, refusing to refresh');
      return null;
    }

    refreshAttemptCount++;
    lastRefreshAttempt = now;

    // Create new refresh promise with timeout
    refreshPromise = Promise.race([
      (async () => {
        try {
          console.log('🔒 tokenStorage.refreshToken: Making fetch request to /api/auth/refresh');
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include', // Include cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('🔒 tokenStorage.refreshToken: Response received', {
            status: response.status,
            ok: response.ok
          });

          if (response.ok) {
            const data: TokenRefreshResponse = await response.json();
            console.log('✅ tokenStorage.refreshToken: Success', {
              hasAccessToken: !!data.accessToken,
              hasUser: !!data.user,
              expiresIn: data.expiresIn
            });
            return {
              token: data.accessToken,
              user: data.user,
              expiresIn: data.expiresIn
            };
          } else {
            console.log('❌ tokenStorage.refreshToken: Server returned error', response.status);
            return null;
          }
        } catch (error) {
          console.log('❌ tokenStorage.refreshToken: Network error', error);
          return null;
        }
      })(),
      // Timeout promise
      new Promise<null>((_, reject) => {
        setTimeout(() => {
          console.log('❌ tokenStorage.refreshToken: Timeout after', REFRESH_TIMEOUT_MS, 'ms');
          reject(new Error('Refresh timeout'));
        }, REFRESH_TIMEOUT_MS);
      })
    ]).catch(() => {
      console.log('❌ tokenStorage.refreshToken: Promise caught error (timeout or network)');
      return null;
    }).finally(() => {
      console.log('🔒 tokenStorage.refreshToken: Cleaning up promise');
      refreshPromise = null;
    });

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