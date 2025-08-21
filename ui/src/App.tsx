
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
import { useDashboard } from './hooks/useDashboard';

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
  
  // Always call useDashboard but only when authenticated
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboard(isAuthenticated);

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
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard dashboardData={dashboardData} isDashboardLoading={isDashboardLoading} />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/income" element={<Income />} />
            <Route path="/settings" element={<Settings />} />
            {/* Catch all route for authenticated users */}
            <Route path="/*" element={<Dashboard dashboardData={dashboardData} isDashboardLoading={isDashboardLoading} />} />
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