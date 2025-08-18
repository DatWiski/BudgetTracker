import React from 'react';
import { formatCurrency } from '../../utils/currency';
import type { Income } from '../../types';
import { Edit3, X, TrendingUp } from 'lucide-react';
import Card from '../common/Card';

interface IncomeListProps {
  income: Income[];
  currency: 'USD' | 'EUR';
  onEdit: (income: Income) => void;
  onDelete: (id: number) => void;
  deletingId?: number | null;
}

const IncomeList: React.FC<IncomeListProps> = ({ income, currency, onEdit, onDelete, deletingId }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Received today';
    if (diffInDays === 1) return 'Received yesterday';
    if (diffInDays < 7) return `Received ${diffInDays} days ago`;
    if (diffInDays < 30) return `Received ${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `Received ${Math.floor(diffInDays / 30)} months ago`;
    return `Received ${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <div className="grid-gap">
      {income.map((entry) => {
        const statusText = formatDate(entry.incomeDate);
        const statusColor = '#10b981'; // Green color for income

        const actions = [
          <button
            key="edit"
            onClick={() => onEdit(entry)}
            className="p-3 rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
            title="Edit income"
          >
            <Edit3 size={18} />
          </button>,
          <button
            key="delete"
            onClick={() => onDelete(entry.id)}
            disabled={deletingId === entry.id}
            className="p-3 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            title="Delete income"
          >
            <X size={18} />
          </button>
        ];

        // Build subtitle with category and description
        let subtitle = entry.categoryName || 'Uncategorized';
        if (entry.description) {
          subtitle += ` • ${entry.description}`;
        }

        return (
          <Card
            key={entry.id}
            title={entry.name}
            subtitle={subtitle}
            status={{
              text: statusText,
              color: statusColor
            }}
            icon={<TrendingUp size={36} />}
            amount={formatCurrency(entry.amount, currency)}
            amountLabel="income"
            actions={actions}
            theme="income"
          />
        );
      })}
    </div>
  );
};

export default IncomeList;