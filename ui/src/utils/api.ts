import { getRequestHeaders, clearCsrfToken } from './csrf';

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
    let headers = options.headers || {};

    // Add CSRF token for non-GET requests
    if (options.method && options.method !== 'GET') {
      const csrfHeaders = await getRequestHeaders();
      headers = { ...headers, ...csrfHeaders };
    }

    const response = await fetch(withBaseUrl(url), {
      ...options,
      headers,
      credentials: 'include'
    });

    // Handle no-content responses (e.g., DELETE 204)
    if (response.status === 204) {
      // @ts-expect-error allow void return for no-content endpoints
      return undefined;
    }

    // Handle CSRF token expiration
    if (response.status === 403) {
      clearCsrfToken();
      // Retry once with new token
      const csrfHeaders = await getRequestHeaders();
      const retryResponse = await fetch(withBaseUrl(url), {
        ...options,
        headers: { ...headers, ...csrfHeaders },
        credentials: 'include'
      });

      if (retryResponse.status === 204) {
        // @ts-expect-error allow void return for no-content endpoints
        return undefined;
      }

      if (!retryResponse.ok) {
        throw new ApiError(
          retryResponse.status,
          retryResponse.statusText,
          `API request failed: ${retryResponse.statusText}`
        );
      }

      return retryResponse.json();
    }

    if (response.status === 401) {
      // Unauthenticated: redirect to login
      window.location.href = '/login';
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