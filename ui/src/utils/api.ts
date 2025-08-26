import { tokenStorage } from './tokenStorage';

let isRefreshing = false;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

const withBaseUrl = (url: string): string => {
  if (API_BASE_URL && url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
};

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  
  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

export const apiRequest = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add JWT Authorization header
    const token = tokenStorage.getToken();
    if (token && !tokenStorage.isTokenExpired()) {
      headers = {
        ...headers,
        'Authorization': `Bearer ${token}`
      };
    }

    const response = await fetch(withBaseUrl(url), {
      ...options,
      headers,
      credentials: 'include' // Include cookies for refresh token
    });

    // Handle no-content responses (e.g., DELETE 204)
    if (response.status === 204) {
      // @ts-expect-error allow void return for no-content endpoints
      return undefined;
    }

    if (response.status === 401 && !isRefreshing) {
      // Try to refresh token before logging out
      isRefreshing = true;
      try {
        const refreshResult = await tokenStorage.refreshToken();
        if (refreshResult) {
          // Token refreshed successfully, retry the original request
          isRefreshing = false;
          headers = {
            ...headers,
            'Authorization': `Bearer ${refreshResult.token}`
          };
          
          // Retry the original request with new token
          const retryResponse = await fetch(withBaseUrl(url), {
            ...options,
            headers,
            credentials: 'include'
          });
          
          if (retryResponse.ok) {
            return retryResponse.status === 204 ? undefined as T : retryResponse.json();
          }
        }
        
        // Refresh failed, clear tokens and redirect
        tokenStorage.clear();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized', 'Authentication required');
      } catch {
        tokenStorage.clear();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized', 'Authentication required');
      } finally {
        isRefreshing = false;
      }
    } else if (response.status === 401) {
      // Already refreshing or refresh failed, just throw error
      throw new ApiError(401, 'Unauthorized', 'Authentication required');
    }

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use the default message
      }

      throw new ApiError(response.status, response.statusText, errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};