import React from 'react';
import type { Subscription } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Edit3, X, CreditCard } from 'lucide-react';
import Card from '../common/Card';

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

        const statusColor = daysUntilBilling < 0 ? '#f87171' : 
                           daysUntilBilling <= 2 ? '#f87171' : 
                           daysUntilBilling <= 7 ? '#fbbf24' : 
                           '#cbd5e1';

        const statusText = daysUntilBilling > 0
          ? `Due in ${daysUntilBilling} days`
          : daysUntilBilling === 0
          ? 'Due today'
          : `Overdue by ${Math.abs(daysUntilBilling)} days`;

        const actions = [
          <button
            key="edit"
            onClick={() => onEdit(subscription)}
            className="p-3 rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
            title="Edit subscription"
          >
            <Edit3 size={18} />
          </button>,
          <button
            key="delete"
            onClick={() => onDelete(subscription.id!)}
            disabled={deletingId === subscription.id}
            className="p-3 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            title="Delete subscription"
          >
            <X size={18} />
          </button>
        ];

        return (
          <Card
            key={subscription.id}
            title={subscription.name}
            subtitle={subscription.categoryName || 'Uncategorized'}
            status={{
              text: statusText,
              color: statusColor
            }}
            icon={<CreditCard size={36} />}
            amount={formatCurrency(subscription.price, currency)}
            amountLabel={subscription.billingPeriod.toLowerCase()}
            actions={actions}
            theme="expense"
            inactive={!subscription.active}
          />
        );
      })}
    </div>
  );
};

export default SubscriptionList;