import React from 'react';
import type { Subscription } from '../../types';
import { formatCurrency } from '../../utils/currency';

type Props = {
  subscriptions: Subscription[];
  currency: 'USD' | 'EUR';
  onEdit: (s: Subscription) => void;
  onDelete: (id: number) => void;
  deletingId?: number | null;
};

const SubscriptionList: React.FC<Props> = ({ subscriptions, currency, onEdit, onDelete, deletingId }) => {
  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {subscriptions.map((subscription) => {
        const daysUntilBilling = Math.ceil(
          (new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div
            key={subscription.id}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: subscription.categoryColor || '#8b5cf6',
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{subscription.name}</h3>
                  {!subscription.active && (
                    <span
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#fca5a5',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontWeight: '600',
                      }}
                    >
                      INACTIVE
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{subscription.categoryName}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    {daysUntilBilling > 0
                      ? `Due in ${daysUntilBilling} days`
                      : daysUntilBilling === 0
                      ? 'Due today'
                      : `Overdue by ${Math.abs(daysUntilBilling)} days`}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>
                  {formatCurrency(subscription.price, currency)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {subscription.billingPeriod.toLowerCase()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => onEdit(subscription)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(subscription.id!)}
                  disabled={deletingId === subscription.id}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    opacity: deletingId === subscription.id ? 0.7 : 1,
                  }}
                >
                  {deletingId === subscription.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SubscriptionList;


