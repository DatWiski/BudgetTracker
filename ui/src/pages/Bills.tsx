

import Icon from '../components/Icon';

const Bills = () => {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: 'white' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          Bills
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
          Track and manage your upcoming bills
        </p>
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <Icon name="bills" size={48} color="#94a3b8" />
        </div>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '1rem' }}>Bills tracking coming soon...</p>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Track upcoming bills, payment history, and set reminders
        </p>
      </div>
    </div>
  );
};

export default Bills;