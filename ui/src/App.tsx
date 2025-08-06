
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Bills from './pages/Bills';
import Income from './pages/Income';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

// Component to handle popup OAuth completion
function PopupHandler() {
  useEffect(() => {
    // Check if we're in a popup window
    if (window.opener && window.opener !== window) {
      // We're in a popup - check if we're authenticated
      fetch('/api/auth/status', { credentials: 'include' })
        .then(response => response.json())
        .then(data => {
          if (data.authenticated) {
            // Success! Tell parent window and close popup
            window.opener.postMessage({ type: 'OAUTH_SUCCESS' }, window.location.origin);
            window.close();
          } else {
            // Still not authenticated, might be an error page
            console.log('Not authenticated in popup');
          }
        })
        .catch(error => {
          console.error('Error checking auth status:', error);
          // Close popup anyway to prevent it staying open
          window.close();
        });
    }
  }, []);

  return <div>Completing login...</div>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Login page without sidebar */}
          <Route path="/login" element={<Login />} />
          
          {/* Main app routes with sidebar */}
          <Route path="/*" element={
            <div style={{
              display: 'flex',
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)'
            }}>
              <PopupHandler />
              <Sidebar />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/income" element={<Income />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;