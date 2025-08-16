

import Icon from '../components/Icon';

const Income = () => {
  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="heading-1">
          Income
        </h1>
        <p className="text-muted">
          Track your income sources and financial growth
        </p>
      </div>
      
      <div className="placeholder-card">
        <div className="mb-4">
          <Icon name="income" size={48} color="var(--text-muted)" />
        </div>
        <p className="text-muted mb-4">Income tracking coming soon...</p>
        <p className="text-small">
          Record income sources, track growth, and analyze financial trends
        </p>
      </div>
    </div>
  );}


export default Income;