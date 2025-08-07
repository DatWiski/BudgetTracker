// CSRF token management utility
let csrfToken: string | null = null;
let csrfHeaderName: string | null = null;

export const getCsrfToken = async (): Promise<string> => {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }

    const data = await response.json();
    // Spring's CsrfToken object has a 'token' method, but when serialized it becomes 'token' property
    csrfToken = data.token || data.value; // Try both possible property names
    if (!csrfToken) {
      console.error('CSRF token response:', data);
      throw new Error('CSRF token not found in response');
    }
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

export const getRequestHeaders = async (): Promise<Record<string, string>> => {
  if (csrfToken && csrfHeaderName) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (csrfHeaderName) {
      headers[csrfHeaderName] = csrfToken!;
    }
    return headers;
  }

  try {
    // First fetch the CSRF token info to get the correct header name
    const response = await fetch('/api/csrf-token', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token info');
    }
    
    const tokenData = await response.json();
    csrfToken = tokenData.token || tokenData.value;
    csrfHeaderName = tokenData.headerName || 'X-CSRF-TOKEN';
    
    if (!csrfToken) {
      console.error('CSRF token response:', tokenData);
      throw new Error('CSRF token not found');
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (csrfHeaderName) {
      headers[csrfHeaderName] = csrfToken!;
    }
    return headers;
  } catch (error) {
    console.error('Error getting CSRF headers:', error);
    throw error;
  }
};

// Clear token on logout or errors
export const clearCsrfToken = (): void => {
  csrfToken = null;
  csrfHeaderName = null;
};