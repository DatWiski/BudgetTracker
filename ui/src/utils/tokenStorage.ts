const TOKEN_KEY = 'budget_tracker_token';
const USER_KEY = 'budget_tracker_user';

export interface UserInfo {
  id: number;
  email: string;
  name: string;
}

export const tokenStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignore storage errors
    }
  },

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Ignore storage errors
    }
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

  isTokenExpired(token: string): boolean {
    try {
      // Decode JWT payload (base64 decode the middle part)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch {
      return true; // If we can't decode, assume expired
    }
  },

  isTokenExpiringSoon(token: string, minutesBefore: number = 5): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresInSeconds = payload.exp - now;
      return expiresInSeconds < (minutesBefore * 60);
    } catch {
      return true;
    }
  },

  clear(): void {
    this.removeToken();
  },

  async refreshToken(): Promise<{ token: string; user: UserInfo } | null> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) return null;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          token: data.token,
          user: data.user
        };
      }
      
      return null;
    } catch {
      return null;
    }
  }
};