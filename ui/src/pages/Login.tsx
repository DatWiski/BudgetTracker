import { theme } from '../styles/theme';
import { Card } from '../components/ui';
import Icon from '../components/Icon';

const Login = () => {
  
  // Check for OAuth error in URL
  const urlParams = new URLSearchParams(window.location.search);
  const hasOAuthError = urlParams.get('error') === 'oauth_failed';

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.gradients.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{maxWidth: '450px', width: '100%', zIndex: 10}}>
        {/* Logo and Header */}
        <div style={{textAlign: 'center', marginBottom: theme.spacing['2xl']}}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: `0 auto ${theme.spacing['2xl']}`,
            background: `linear-gradient(135deg, ${theme.colors.success[500]}, ${theme.colors.primary[500]})`,
            borderRadius: theme.borderRadius.xl,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shadows.lg,
            transition: 'all 0.3s ease'
          }}>
            <Icon name="money" size={50} color={theme.colors.white} />
          </div>
          
          <h1 style={{
            fontSize: theme.typography.fontSize['4xl'],
            fontWeight: theme.typography.fontWeight.extrabold,
            color: theme.colors.white,
            marginBottom: theme.spacing.md,
            letterSpacing: '-0.025em',
            lineHeight: '1.2'
          }}>
            BudgetTracker
          </h1>
        </div>

        {/* Login Card */}
        <Card>
          
          <div style={{textAlign: 'center', marginBottom: theme.spacing['2xl']}}>
            <h3 style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.white,
              marginBottom: theme.spacing.md
            }}>
              Welcome Back
            </h3>
            <p style={{
              color: theme.colors.gray[300],
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              Sign in
            </p>
              
            {hasOAuthError && (
              <div style={{
                marginTop: theme.spacing.xl,
                padding: theme.spacing.xl,
                background: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${theme.colors.danger[500]}40`,
                borderRadius: theme.borderRadius.lg
              }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.sm, gap: theme.spacing.sm}}>
                  <Icon name="alert" size={20} color={theme.colors.danger[500]} />
                  <span style={{color: theme.colors.danger[500], fontWeight: theme.typography.fontWeight.bold, fontSize: theme.typography.fontSize.lg}}>Development Mode</span>
                </div>
                <p style={{color: theme.colors.danger[500], fontSize: theme.typography.fontSize.sm, lineHeight: '1.6'}}>
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
              padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
              background: theme.colors.white,
              color: theme.colors.gray[800],
              fontWeight: theme.typography.fontWeight.bold,
              fontSize: theme.typography.fontSize.lg,
              borderRadius: theme.borderRadius.lg,
              border: 'none',
              cursor: 'pointer',
              boxShadow: theme.shadows.md,
              transition: 'all 0.3s ease',
              gap: theme.spacing.md
            }}
          >
            <svg style={{width: '28px', height: '28px'}} viewBox="0 0 24 24">
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
        </Card>

      </div>
    </div>
  );
};

export default Login;