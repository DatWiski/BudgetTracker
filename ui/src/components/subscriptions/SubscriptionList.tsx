import React from 'react';
import type { Subscription } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Edit, Trash2 } from 'lucide-react';

type Props = {
  subscriptions: Subscription[];
  currency: 'USD' | 'EUR';
  onEdit: (s: Subscription) => void;
  onDelete: (id: number) => void;
  deletingId?: number | null;
};

const SubscriptionList: React.FC<Props> = ({ subscriptions, currency, onEdit, onDelete, deletingId }) => {
  return (
    <div className="grid-gap">
      {subscriptions.map((subscription) => {
        const daysUntilBilling = Math.ceil(
          (new Date(subscription.nextBillingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        return (
          <div 
            key={subscription.id} 
            className="glass-card-strong flex-between mb-4"
            style={{ padding: 'var(--spacing-xl)' }}
          >
            <div className="flex items-center gap-4">
              <div className="category-dot" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="heading-3 text-lg">
                    {subscription.name}
                  </h3>
                  {!subscription.active && (
                    <span className="status-badge">
                      INACTIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-small">
                    {subscription.categoryName || 'Uncategorized'}
                  </span>
                  <span className="text-small">
                    {daysUntilBilling > 0
                      ? `Due in ${daysUntilBilling} days`
                      : daysUntilBilling === 0
                      ? 'Due today'
                      : `Overdue by ${Math.abs(daysUntilBilling)} days`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white text-2xl font-bold">
                  {formatCurrency(subscription.price, currency)}
                </div>
                <div className="text-xs uppercase font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {subscription.billingPeriod.toLowerCase()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(subscription)}
                  className="btn-icon"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(subscription.id!)}
                  disabled={deletingId === subscription.id}
                  className="btn-icon-danger"
                >
                  <Trash2 size={16} />
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