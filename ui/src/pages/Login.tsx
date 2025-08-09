import { useQueryClient } from '@tanstack/react-query';

type OAuthSuccessMessage = { type: 'OAUTH_SUCCESS'; origin?: string };
const isOAuthSuccessMessage = (data: unknown): data is OAuthSuccessMessage => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as { type?: unknown }).type === 'OAUTH_SUCCESS'
  );
};

const Login = () => {
  const queryClient = useQueryClient();
  
  // Check for OAuth error in URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthError = urlParams.get('error') === 'oauth_failed';

  const handleGoogleLogin = () => {
    // Open Google OAuth2 in a popup window
    const popup = window.open(
      '/oauth2/authorization/google',
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    // Listen for success message from popup
    const handleMessage = (event: MessageEvent) => {
      if (!(event.source === popup && isOAuthSuccessMessage(event.data))) {
        return;
      }

      // Validate origin: allow same-origin and optional configured backend origin
      const allowedOrigins = new Set<string>([window.location.origin]);
      const envOrigin = import.meta.env.VITE_BACKEND_ORIGIN as string | undefined;
      if (envOrigin) {
        allowedOrigins.add(envOrigin);
      }

      if (!allowedOrigins.has(event.origin)) {
        // Ignore messages from unexpected origins
        return;
      }

      // Clear auth cache to trigger re-check and navigate
      queryClient.clear();
      window.location.href = '/';
      window.removeEventListener('message', handleMessage);
    };
    
    window.addEventListener('message', handleMessage);
    
    // Also check if popup was closed manually (fallback)
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        // Don't auto-refresh - let user try again if needed
      }
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e  50%, #0f3460 75%, #533483 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Clean background - no floating elements */}

      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1); }
          50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.4), 0 0 60px rgba(139, 92, 246, 0.2); }
        }
      `}</style>

      <div className="relative w-full max-w-md z-10" style={{zIndex: 10}}>
        {/* Logo and Header */}
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 2rem',
            background: 'linear-gradient(135deg, #10b981, #3b82f6, #8b5cf6)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: 'glow 3s ease-in-out infinite',
            position: 'relative'
          }} 
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}>
            <svg style={{width: '50px', height: '50px', color: 'white', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, #ffffff, #e2e8f0, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            letterSpacing: '-0.025em',
            lineHeight: '1.2'
          }}>
            BudgetTracker
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            color: '#e2e8f0',
            marginBottom: '0.75rem',
            fontWeight: '600'
          }}>
            Master Your Financial Future
          </p>
          
          <p style={{
            fontSize: '1rem',
            color: '#cbd5e1',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            Transform your financial habits with intelligent tracking, smart insights, and automated bill management
          </p>
        </div>

        {/* Modern Login Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '3rem 2.5rem',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          position: 'relative',
          transition: 'all 0.5s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.transform = 'translateY(-8px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'translateY(0px)';
        }}>
          
          <div style={{position: 'relative', zIndex: 1}}>
            <div style={{textAlign: 'center', marginBottom: '2.5rem'}}>
              <h3 style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '1rem',
                letterSpacing: '0.025em'
              }}>
                Welcome Back
              </h3>
              <p style={{
                color: '#e2e8f0',
                fontSize: '1.125rem',
                fontWeight: '500'
              }}>
                Sign in to unlock your financial insights
              </p>
              
              {hasOAuthError && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem'}}>
                    <svg style={{width: '24px', height: '24px', color: '#fca5a5', marginRight: '0.75rem'}} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span style={{color: '#fca5a5', fontWeight: '700', fontSize: '1.1rem'}}>Development Mode</span>
                  </div>
                  <p style={{color: '#fca5a5', fontSize: '0.95rem', lineHeight: '1.6'}}>
                    OAuth2 not configured with real Google credentials. Using dummy credentials for development testing.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleGoogleLogin}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem 2rem',
                background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                color: '#1f2937',
                fontWeight: '700',
                fontSize: '1.125rem',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc, #ffffff)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px) scale(1)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
              }}
            >
              <svg style={{width: '28px', height: '28px', marginRight: '1rem'}} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>


          </div>
        </div>

        {/* Security Badge */}
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '1rem 2rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.1)'
          }}>
            <div style={{
              marginRight: '1rem',
              padding: '0.5rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
              borderRadius: '10px'
            }}>
              <svg style={{width: '20px', height: '20px', color: '#10b981'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div style={{textAlign: 'left'}}>
              <span style={{
                color: '#10b981',
                fontWeight: '700',
                fontSize: '1.1rem',
                display: 'block'
              }}>Enterprise Security</span>
              <span style={{
                color: '#6ee7b7',
                fontSize: '0.85rem',
                opacity: 0.8
              }}>Powered by Google OAuth 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;