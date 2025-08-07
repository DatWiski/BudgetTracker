
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Bills from './pages/Bills';
import Income from './pages/Income';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';

// Create a client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});


// Main application component with authentication guard
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while checking authentication - no UI at all for anonymous users
  if (isLoading) {
    return null;
  }

  // If not authenticated, show login page for all routes
  if (!isAuthenticated) {
    return <Login />;
  }

  // User is authenticated, show the main app with all routes
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #1a1a2e 100%)'
    }}>
      <Sidebar />
      <main style={{ flex: 1 }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/income" element={<Income />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch all route for authenticated users */}
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;