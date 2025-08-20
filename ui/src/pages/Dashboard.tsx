import { formatCurrency } from '../utils/currency';
import Icon from '../components/Icon';
import HeaderFinancialBar from '../components/HeaderFinancialBar';
import type { DashboardOverview } from '../types';

interface DashboardProps {
  dashboardData?: DashboardOverview;
  isDashboardLoading?: boolean;
}

const Dashboard = ({ dashboardData, isDashboardLoading }: DashboardProps) => {
  const data = dashboardData;
  const isLoading = isDashboardLoading;
  const error = null; // Error handling from parent level

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="mb-10">
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-muted">Your financial overview</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="mb-10">
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-muted">Your financial overview</p>
        </div>
        <div className="glass-card text-center">
          <Icon name="error" size={24} color="var(--color-error)" />
          <p className="text-muted mt-2">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const overview = data!;

  return (
    <div className="page-container">
      <div className="mb-10">
        <h1 className="heading-1">
          Dashboard
        </h1>
        <p className="text-muted">
          Your financial overview for this month
        </p>
      </div>
      
      {/* Financial Overview - Better Design */}
      <div className="mb-4">
        <HeaderFinancialBar data={overview} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Total Income</h3>
            <Icon name="income" size={20} color="var(--color-success)" />
          </div>
          <p className="text-2xl font-semibold text-success">
            {formatCurrency(overview.totalIncome)}
          </p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Total Expenses</h3>
            <Icon name="expense" size={20} color="var(--color-error)" />
          </div>
          <p className="text-2xl font-semibold text-error">
            {formatCurrency(overview.totalExpenses)}
          </p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Available</h3>
            <Icon name="wallet" size={20} color="var(--color-primary)" />
          </div>
          <p className={`text-2xl font-semibold ${overview.availableMoney >= 0 ? 'text-success' : 'text-error'}`}>
            {formatCurrency(overview.availableMoney)}
          </p>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Subscriptions</h3>
            <Icon name="subscription" size={20} color="var(--color-accent)" />
          </div>
          <p className="text-xl font-semibold">
            {formatCurrency(overview.subscriptionExpenses)}
          </p>
          <p className="text-small text-muted">
            {overview.activeSubscriptions} services
          </p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Bills</h3>
            <Icon name="bill" size={20} color="var(--color-warning)" />
          </div>
          <p className="text-xl font-semibold">
            {formatCurrency(overview.billExpenses)}
          </p>
          <p className="text-small text-muted">
            {overview.activeBills} bills
          </p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Savings Rate</h3>
            <Icon name="savings" size={20} color="var(--color-success)" />
          </div>
          <p className={`text-xl font-semibold ${overview.savingsRate >= 20 ? 'text-success' : overview.savingsRate >= 10 ? 'text-warning' : 'text-error'}`}>
            {overview.savingsRate.toFixed(1)}%
          </p>
          <p className="text-small text-muted">
            of income saved
          </p>
        </div>

        <div className="glass-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-muted">Monthly Budget</h3>
            <Icon name="budget" size={20} color="var(--color-primary)" />
          </div>
          <p className="text-xl font-semibold">
            {overview.totalExpenses > 0 ? Math.round((overview.totalExpenses / overview.totalIncome) * 100) : 0}%
          </p>
          <p className="text-small text-muted">
            of income used
          </p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;