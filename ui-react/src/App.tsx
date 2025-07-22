import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import SubscriptionsPage from './pages/SubscriptionsPage';
import CategoriesPage from './pages/CategoriesPage';

function Dashboard() {
  return <h1>Dashboard (coming soon)</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: 12 }}>Dashboard</Link>
        <Link to="/subscriptions" style={{ marginRight: 12 }}>Subscriptions</Link>
        <Link to="/categories">Categories</Link>
      </nav>

      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
