import React from 'react';
import type { Category, SubscriptionRequest } from '../../types';

export type SubscriptionFormValues = {
  name: string;
  price: string;
  billingPeriod: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  nextBillingDate: string;
  categoryId: string;
  active: boolean;
};

type Props = {
  mode: 'create' | 'edit';
  values: SubscriptionFormValues;
  onChange: (values: SubscriptionFormValues) => void;
  categories: Category[];
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: SubscriptionRequest | (SubscriptionRequest & { id: number })) => void;
  editingId?: number | null;
};

const SubscriptionForm: React.FC<Props> = ({
  mode,
  values,
  onChange,
  categories,
  errors,
  isSubmitting,
  onCancel,
  onSubmit,
  editingId,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SubscriptionRequest = {
      name: values.name.trim(),
      price: parseFloat(values.price),
      billingPeriod: values.billingPeriod,
      nextBillingDate: values.nextBillingDate,
      categoryId: values.categoryId ? parseInt(values.categoryId) : undefined,
      active: values.active,
    };
    if (mode === 'edit' && editingId != null) {
      onSubmit({ ...payload, id: editingId });
    } else {
      onSubmit(payload);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="form-label block mb-2">
          Subscription Name
        </label>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          required
          placeholder="e.g., Netflix, Spotify"
          className="w-full text-white text-sm outline-none rounded-lg focus:border-violet-400 transition-colors"
          style={{
            background: 'var(--bg-glass-hover)',
            border: '1px solid var(--border-secondary)',
            padding: 'var(--spacing-sm) 0.75rem'
          }}
        />
        {errors?.name && <div className="text-xs mt-1" style={{ color: 'var(--color-error-light)' }}>{errors.name}</div>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label block mb-2">
            Price
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => onChange({ ...values, price: e.target.value })}
            required
            placeholder="0.00"
            className="w-full text-white text-sm outline-none rounded-lg focus:border-violet-400 transition-colors"
            style={{
              background: 'var(--bg-glass-hover)',
              border: '1px solid var(--border-secondary)',
              padding: 'var(--spacing-sm) 0.75rem'
            }}
          />
          {errors?.price && <div className="text-xs mt-1" style={{ color: 'var(--color-error-light)' }}>{errors.price}</div>}
        </div>

        <div>
          <label className="form-label block mb-2">
            Billing Period
          </label>
          <select 
            value={values.billingPeriod} 
            onChange={(e) => onChange({ ...values, billingPeriod: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' })}
            className="form-select w-full cursor-pointer"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="form-label block mb-2">
            Next Billing Date
          </label>
          <input
            id="next-billing"
            type="date"
            value={values.nextBillingDate}
            onChange={(e) => onChange({ ...values, nextBillingDate: e.target.value })}
            required
            className="w-full text-white text-sm outline-none rounded-lg focus:border-violet-400 transition-colors"
            style={{
              background: 'var(--bg-glass-hover)',
              border: '1px solid var(--border-secondary)',
              padding: 'var(--spacing-sm) 0.75rem'
            }}
          />
        </div>

        <div>
          <label className="form-label block mb-2">
            Category
          </label>
          <select 
            value={values.categoryId} 
            onChange={(e) => onChange({ ...values, categoryId: e.target.value })}
            className="form-select w-full cursor-pointer"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id.toString()}>
                {c.name}
              </option>
            ))}
          </select>
          {errors?.categoryId && (
            <div className="text-xs mt-1" style={{ color: 'var(--color-error-light)' }}>{errors.categoryId}</div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={values.active}
            onChange={(e) => onChange({ ...values, active: e.target.checked })}
            className="w-4 h-4 cursor-pointer"
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <label htmlFor="active" className="text-white cursor-pointer text-sm">
            Active subscription
          </label>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default SubscriptionForm;


