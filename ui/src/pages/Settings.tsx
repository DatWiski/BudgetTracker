

import Icon from '../components/Icon';

const Settings = () => {
  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="heading-1">
          Settings
        </h1>
        <p className="text-muted">
          Customize your BudgetTracker experience
        </p>
      </div>
      
      <div className="placeholder-card">
        <div className="mb-4">
          <Icon name="settings" size={48} color="var(--text-muted)" />
        </div>
        <p className="text-muted mb-4">Settings coming soon...</p>
        <p className="text-small">
          Manage preferences, categories, and account settings
        </p>
      </div>
    </div>
  );
}

export default Settings;