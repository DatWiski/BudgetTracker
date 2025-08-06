import type { FC } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Subscription {
  id: number;
  name: string;
  price: number;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'WEEKLY';
  nextBillingDate: string;
  isActive: boolean;
  categoryId: number;
  categoryName?: string;
  categoryColor?: string;
}

const Dashboard: FC = () => {
  // Fetch subscriptions
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/subscriptions', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      return response.json();
    }
  });

  // Calculate metrics
  const activeSubscriptions = subscriptions.filter((sub: Subscription) => sub.isActive);
  const totalMonthlySpend = activeSubscriptions.reduce((total: number, sub: Subscription) => {
    const monthlyAmount = sub.billingPeriod === 'YEARLY' ? sub.price / 12 : 
                         sub.billingPeriod === 'WEEKLY' ? sub.price * 4.33 : sub.price;
    return total + monthlyAmount;
  }, 0);

  // Get upcoming bills (next 7 days)
  const upcomingBills = activeSubscriptions.filter((sub: Subscription) => {
    const daysUntilBilling = Math.ceil(
      (new Date(sub.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilBilling >= 0 && daysUntilBilling <= 7;
  }).sort((a: Subscription, b: Subscription) => 
    new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
  );

  // Get recent activity (subscriptions billed in the last 30 days)
  const recentActivity = activeSubscriptions
    .map((sub: Subscription) => {
      const nextBilling = new Date(sub.nextBillingDate);
      const lastBilling = new Date(nextBilling);
      
      // Calculate last billing date based on billing period
      switch (sub.billingPeriod) {
        case 'MONTHLY':
          lastBilling.setMonth(lastBilling.getMonth() - 1);
          break;
        case 'YEARLY':
          lastBilling.setFullYear(lastBilling.getFullYear() - 1);
          break;
        case 'WEEKLY':
          lastBilling.setDate(lastBilling.getDate() - 7);
          break;
      }

      const daysSinceLastBilling = Math.ceil(
        (new Date().getTime() - lastBilling.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...sub,
        lastBillingDate: lastBilling,
        daysSinceLastBilling
      };
    })
    .filter((sub: Subscription & { daysSinceLastBilling: number }) => sub.daysSinceLastBilling <= 30 && sub.daysSinceLastBilling >= 0)
    .sort((a: Subscription & { daysSinceLastBilling: number }, b: Subscription & { daysSinceLastBilling: number }) => a.daysSinceLastBilling - b.daysSinceLastBilling)
    .slice(0, 5);

  const formatDaysAgo = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 14) return '1 week ago';
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return '1 month ago';
  };

  return (
    <div style={{
      padding: '2rem',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Dashboard
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '1.1rem'
        }}>
          Welcome back! Here's your financial overview
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        
        {/* Total Spending Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              💰
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Monthly</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {isLoading ? '...' : `$${totalMonthlySpend.toFixed(2)}`}
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: 0 }}>Total Spending</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              From {activeSubscriptions.length} active subscriptions
            </span>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📱
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Active</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {isLoading ? '...' : activeSubscriptions.length}
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: 0 }}>Subscriptions</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem' }}>
            <span style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
              {isLoading ? 'Loading...' : `$${totalMonthlySpend.toFixed(2)}/month total`}
            </span>
          </div>
        </div>

        {/* Upcoming Bills Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📋
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Due Soon</div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'white' }}>
                {isLoading ? '...' : upcomingBills.length}
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', margin: 0 }}>Upcoming Bills</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem' }}>
            {upcomingBills.length > 0 ? (
              <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>
                ⚠️ {upcomingBills[0].name} due {
                  Math.ceil((new Date(upcomingBills[0].nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) === 0 
                    ? 'today' 
                    : `in ${Math.ceil((new Date(upcomingBills[0].nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                }
              </span>
            ) : (
              <span style={{ color: '#10b981', fontSize: '0.875rem' }}>✅ No bills due this week</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '2rem' }}>Recent Activity</h3>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            Loading recent activity...
          </div>
        ) : recentActivity.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
            <p>No recent subscription activity to show.</p>
            <p style={{ fontSize: '0.875rem' }}>Your subscription charges will appear here once they occur.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentActivity.map((activity: Subscription & { daysSinceLastBilling: number }) => (
              <div key={activity.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: activity.categoryColor || 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem'
                  }}>
                    📱
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: '600', fontSize: '1rem' }}>{activity.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                      {formatDaysAgo(activity.daysSinceLastBilling)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'white', fontWeight: '700', fontSize: '1.1rem' }}>
                    ${activity.price.toFixed(2)}
                  </div>
                  <div style={{
                    color: '#3b82f6',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>
                    {activity.billingPeriod.toLowerCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;