

import Icon from '../components/Icon';

const Bills = () => {
  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="heading-1">
          Bills
        </h1>
        <p className="text-muted">
          Track and manage your upcoming bills
        </p>
      </div>
      
      <div className="placeholder-card">
        <div className="mb-4">
          <Icon name="bills" size={48} color="var(--text-muted)" />
        </div>
        <p className="text-muted mb-4">Bills tracking coming soon...</p>
        <p className="text-small">
          Track upcoming bills, payment history, and set reminders
        </p>
      </div>
    </div>
  );}


export default Bills;