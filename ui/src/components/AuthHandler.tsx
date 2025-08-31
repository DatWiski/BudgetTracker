import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export const AuthHandler = () => {
  const { login } = useAuth();

  useEffect(() => {
    // Check URL for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userStr = urlParams.get("user");

    console.log("🔓 AuthHandler: Checking URL params", {
      hasToken: !!token,
      hasUser: !!userStr,
      fullUrl: window.location.href
    });

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log("🔓 AuthHandler: Processing login", { token: token.substring(0, 20) + "...", user });
        // Default to 30 minutes if no specific expiry provided
        login(token, user, 30 * 60);
        console.log("🔓 AuthHandler: Login completed, cleaning URL");
        // Clean up URL
        window.history.replaceState({}, document.title, "/");
      } catch (error) {
        console.error("❌ AuthHandler: Error parsing OAuth callback data:", error);
        // Clean up URL anyway
        window.history.replaceState({}, document.title, "/");
      }
    }
  }, [login]);

  return null; // This component only handles auth, doesn't render anything
};
