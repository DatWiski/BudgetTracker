import React from 'react';
import type { Bill } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { Edit3, X, Receipt } from 'lucide-react';
import Card from '../common/Card';

type Props = {
  bills: Bill[];
  currency: 'USD' | 'EUR';
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
  deletingId?: number | null;
};

const BillList: React.FC<Props> = ({ bills, currency, onEdit, onDelete, deletingId }) => {
  return (
    <div className="grid-gap">
      {bills.map((bill) => {
        // Use the calculated actual due date instead of the original one
        const actualDueDate = new Date(bill.actualDueDate);
        const daysUntilDue = Math.ceil(
          (actualDueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        const statusColor = daysUntilDue <= 0 ? '#f87171' : 
                           daysUntilDue <= 2 ? '#f87171' : 
                           daysUntilDue <= 7 ? '#fbbf24' : 
                           '#cbd5e1';

        const statusText = daysUntilDue > 0
          ? `Due in ${daysUntilDue} days`
          : daysUntilDue === 0
          ? 'Due today'
          : `Next due: ${actualDueDate.toLocaleDateString()}`;

        const actions = [
          <button
            key="edit"
            onClick={() => onEdit(bill)}
            className="p-3 rounded-md text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
            title="Edit bill"
          >
            <Edit3 size={18} />
          </button>,
          <button
            key="delete"
            onClick={() => onDelete(bill.id!)}
            disabled={deletingId === bill.id}
            className="p-3 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
            title="Delete bill"
          >
            <X size={18} />
          </button>
        ];

        return (
          <Card
            key={bill.id}
            title={bill.name}
            subtitle={bill.categoryName || 'Uncategorized'}
            status={{
              text: statusText,
              color: statusColor
            }}
            icon={<Receipt size={36} />}
            amount={formatCurrency(bill.amount, currency)}
            amountLabel={bill.period.toLowerCase()}
            actions={actions}
            theme="expense"
            inactive={!bill.active}
          />
        );
      })}
    </div>
  );
};

export default BillList;