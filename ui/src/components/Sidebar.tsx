
import { NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { clearCsrfToken } from '../utils/csrf';
import Icon from './Icon';

const Sidebar = () => {
  const queryClient = useQueryClient();
  
  const navItems = [
    { path: '/', name: 'Dashboard', icon: 'dashboard' },
    { path: '/subscriptions', name: 'Subscriptions', icon: 'subscriptions' },
    { path: '/bills', name: 'Bills', icon: 'bills' },
    { path: '/income', name: 'Income', icon: 'income' },
    { path: '/settings', name: 'Settings', icon: 'settings' },
  ];

  const handleLogout = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['auth-status'] });
      
      const csrfResponse = await fetch('/api/csrf-token', {
        credentials: 'include'
      });
      
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        const token = csrfData.token || csrfData.value;
        const headerName = csrfData.headerName || 'X-CSRF-TOKEN';
        
        await fetch('/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [headerName]: token
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      queryClient.clear();
      clearCsrfToken();
      await queryClient.invalidateQueries({ queryKey: ['auth-status'] });
      window.location.href = '/login';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
      color: 'white',
      width: '16rem',
      minHeight: '100vh',
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 0 50px rgba(139, 92, 246, 0.1)'
    }}>
      <div style={{ padding: '1.5rem' }}>
        {/* Logo Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            borderRadius: '12px',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
          }}>
            <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'white',
            margin: 0
          }}>BudgetTracker</h2>
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: '2rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: '600',
                textDecoration: 'none',
                marginBottom: '0.5rem',
                transition: 'all 0.3s ease',
                background: isActive 
                  ? 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? 'white' : '#e2e8f0',
                border: '1px solid ' + (isActive ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'),
                boxShadow: isActive ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none'
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateX(0px)';
                  e.currentTarget.style.color = '#e2e8f0';
                }
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={20} color={isActive ? 'white' : '#e2e8f0'} />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              width: '100%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.transform = 'translateX(0px)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Icon name="logout" size={20} color="#f87171" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;