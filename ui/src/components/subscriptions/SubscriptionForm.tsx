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
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
          Subscription Name
        </label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          required
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '1rem',
          }}
          placeholder="e.g., Netflix, Spotify"
        />
        {errors?.name && <div style={{ color: '#fca5a5', marginTop: '0.25rem' }}>{errors.name}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
            Price
          </label>
          <input
            type="number"
            step="0.01"
            value={values.price}
            onChange={(e) => onChange({ ...values, price: e.target.value })}
            required
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '1rem',
            }}
            placeholder="0.00"
          />
          {errors?.price && <div style={{ color: '#fca5a5', marginTop: '0.25rem' }}>{errors.price}</div>}
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
            Billing Period
          </label>
          <select
            value={values.billingPeriod}
            onChange={(e) => onChange({
              ...values,
              billingPeriod: e.target.value as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
            })}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '1rem',
            }}
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
            Next Billing Date
          </label>
          <input
            type="date"
            value={values.nextBillingDate}
            onChange={(e) => onChange({ ...values, nextBillingDate: e.target.value })}
            required
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '1rem',
            }}
          />
        </div>

        <div>
          <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
            Category
          </label>
          <select
            value={values.categoryId}
            onChange={(e) => onChange({ ...values, categoryId: e.target.value })}
            required
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '1rem',
            }}
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors?.categoryId && (
            <div style={{ color: '#fca5a5', marginTop: '0.25rem' }}>{errors.categoryId}</div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => onChange({ ...values, active: e.target.checked })}
            style={{ marginRight: '0.5rem' }}
          />
          Active subscription
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};

export default SubscriptionForm;


