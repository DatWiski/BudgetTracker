import type { FC } from 'react';
import { formatCurrency } from '../utils/currency';
import { formatRelativeTime, daysUntilBilling } from '../utils/dateCalculations';
import Icon from '../components/Icon';
import { StatCard, Card, LoadingSpinner } from '../components/ui';
import { useSubscriptions } from '../hooks/useSubscriptions';
import { useSubscriptionMetrics } from '../hooks/useSubscriptionMetrics';
import { theme } from '../styles/theme';
import type { RecentActivity } from '../types';

const Dashboard: FC = () => {
  const { subscriptions, isLoading } = useSubscriptions();
  const { metrics, upcomingBills, recentActivity } = useSubscriptionMetrics(subscriptions);


  return (
    <div style={{
      padding: theme.spacing.xl,
      minHeight: '100vh',
      color: theme.colors.white
    }}>
      {/* Header */}
      <div style={{ marginBottom: theme.spacing['2xl'] }}>
        <h1 style={{
          fontSize: theme.typography.fontSize['4xl'],
          fontWeight: theme.typography.fontWeight.extrabold,
          background: theme.gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: theme.spacing.sm
        }}>
          Dashboard
        </h1>
        <p style={{
          color: theme.colors.gray[400],
          fontSize: theme.typography.fontSize.lg
        }}>
          Welcome back! Here's your financial overview
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing['2xl']
      }}>
        <StatCard
          title="Total Spending"
          value={formatCurrency(metrics.totalMonthlySpend)}
          subtitle="Monthly"
          description={`From ${metrics.activeSubscriptions} active subscriptions`}
          iconName="money"
          gradientColors={[theme.colors.secondary[500], theme.colors.primary[500]]}
          isLoading={isLoading}
        />
        
        <StatCard
          title="Subscriptions"
          value={metrics.activeSubscriptions}
          subtitle="Active"
          description={isLoading ? 'Loading...' : `${formatCurrency(metrics.totalMonthlySpend)}/month total`}
          iconName="subscriptions"
          gradientColors={[theme.colors.primary[500], theme.colors.primary[700]]}
          isLoading={isLoading}
        />
        
        <StatCard
          title="Upcoming Bills"
          value={metrics.upcomingBills}
          subtitle="Due Soon"
          description={
            upcomingBills.length > 0 ? (
              `⚠️ ${upcomingBills[0].name} due ${
                daysUntilBilling(upcomingBills[0].nextBillingDate) === 0 
                  ? 'today' 
                  : `in ${daysUntilBilling(upcomingBills[0].nextBillingDate)} days`
              }`
            ) : (
              '✅ No bills due this week'
            )
          }
          iconName="calendar"
          gradientColors={[theme.colors.success[500], theme.colors.success[600]]}
          isLoading={isLoading}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 style={{ 
          fontSize: theme.typography.fontSize['2xl'], 
          fontWeight: theme.typography.fontWeight.bold, 
          color: theme.colors.white, 
          marginBottom: theme.spacing.xl 
        }}>
          Recent Activity
        </h3>
        
        {isLoading ? (
          <LoadingSpinner message="Loading recent activity..." />
        ) : recentActivity.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: theme.colors.gray[400], 
            padding: theme.spacing.xl 
          }}>
            <div style={{ marginBottom: theme.spacing.md }}>
              <Icon name="activity" size={48} color={theme.colors.gray[400]} />
            </div>
            <p>No recent subscription activity to show.</p>
            <p style={{ fontSize: theme.typography.fontSize.sm }}>
              Your subscription charges will appear here once they occur.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            {recentActivity.map((activity: RecentActivity) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.spacing.md,
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: theme.borderRadius.md,
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: activity.categoryColor || 'rgba(255, 255, 255, 0.1)',
                    borderRadius: theme.borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon name="subscriptions" size={24} color={theme.colors.white} />
                  </div>
                  <div>
                    <div style={{ 
                      color: theme.colors.white, 
                      fontWeight: theme.typography.fontWeight.semibold, 
                      fontSize: theme.typography.fontSize.md 
                    }}>
                      {activity.name}
                    </div>
                    <div style={{ 
                      color: theme.colors.gray[400], 
                      fontSize: theme.typography.fontSize.sm 
                    }}>
                      {formatRelativeTime(activity.daysSinceLastBilling)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: theme.colors.white, 
                    fontWeight: theme.typography.fontWeight.bold, 
                    fontSize: theme.typography.fontSize.lg 
                  }}>
                    {formatCurrency(activity.price)}
                  </div>
                  <div style={{
                    color: theme.colors.primary[500],
                    fontSize: theme.typography.fontSize.xs,
                    textTransform: 'uppercase',
                    fontWeight: theme.typography.fontWeight.semibold
                  }}>
                    {activity.billingPeriod.toLowerCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;