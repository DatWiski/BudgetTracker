import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthHandler = () => {
  const { login } = useAuth();

  useEffect(() => {
    // Check URL for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        login(token, user);
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
      } catch (error) {
        console.error('Error parsing OAuth callback data:', error);
        // Clean up URL anyway
        window.history.replaceState({}, document.title, '/');
      }
    }
  }, [login]);

  return null; // This component only handles auth, doesn't render anything
};