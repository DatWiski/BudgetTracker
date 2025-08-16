import Icon from '../components/Icon';

const Dashboard = () => {
  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="heading-1">
          Dashboard
        </h1>
        <p className="text-muted">
          Your financial overview with charts and analytics
        </p>
      </div>
      
      <div className="placeholder-card">
        <div className="mb-4">
          <Icon name="dashboard" size={48} color="var(--text-muted)" />
        </div>
        <p className="text-muted mb-4">Dashboard coming soon...</p>
        <p className="text-small">
          Advanced analytics, charts, and financial insights will be available here
        </p>
      </div>
    </div>
  );
};

export default Dashboard;