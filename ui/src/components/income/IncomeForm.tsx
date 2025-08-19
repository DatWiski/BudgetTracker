import { useState, useEffect } from 'react';
import type { Category, IncomeRequest, Period } from '../../types';
import { FormField } from '../common/FormField';
import { FormWrapper } from '../common/FormWrapper';

export interface IncomeFormValues {
  name: string;
  amount: string;
  incomeDate: string;
  period?: string;
  description?: string;
  categoryId?: string;
}

interface IncomeFormProps {
  mode: 'create' | 'edit';
  values: IncomeFormValues;
  onChange: (values: IncomeFormValues) => void;
  categories: Category[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: IncomeRequest | ({ id: number } & IncomeRequest)) => void;
  editingId?: number | null;
}

const IncomeForm = ({
  mode,
  values,
  onChange,
  categories,
  isSubmitting,
  onCancel,
  onSubmit,
  editingId
}: IncomeFormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      newErrors.name = 'Income name is required';
    }

    if (!values.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(values.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    if (!values.incomeDate) {
      newErrors.incomeDate = 'Income date is required';
    } else {
      const incomeDate = new Date(values.incomeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (incomeDate > today) {
        newErrors.incomeDate = 'Income date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const payload: IncomeRequest = {
      name: values.name.trim(),
      amount: parseFloat(values.amount),
      incomeDate: values.incomeDate,
      period: (values.period || 'ONE_TIME') as Period,
      description: values.description?.trim() || undefined,
      categoryId: values.categoryId ? parseInt(values.categoryId) : undefined,
    };

    if (mode === 'edit' && editingId) {
      onSubmit({ id: editingId, ...payload });
    } else {
      onSubmit(payload);
    }
  };

  // Clear errors when values change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [values]);

  return (
    <FormWrapper 
      onSubmit={handleSubmit} 
      onCancel={onCancel} 
      isSubmitting={isSubmitting} 
      mode={mode}
    >
      <FormField
        label="Income Name"
        error={errors.name}
        required
      >
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...values, name: e.target.value })}
          placeholder="e.g., Monthly Salary, Freelance Payment"
          className="form-input"
          required
        />
      </FormField>

      <FormField
        label="Amount"
        error={errors.amount}
        required
      >
        <input
          type="number"
          name="amount"
          value={values.amount}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...values, amount: e.target.value })}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="form-input"
          required
        />
      </FormField>

      <FormField
        label="Income Date"
        error={errors.incomeDate}
        required
      >
        <input
          type="date"
          name="incomeDate"
          value={values.incomeDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...values, incomeDate: e.target.value })}
          className="form-input"
          required
        />
      </FormField>

      <FormField
        label="Frequency"
        error={errors.period}
        required
      >
        <select
          name="period"
          value={values.period || 'ONE_TIME'}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...values, period: e.target.value })}
          className="form-select"
        >
          <option value="ONE_TIME">One-time</option>
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </FormField>

      <FormField
        label="Description (Optional)"
        error={errors.description}
      >
        <textarea
          name="description"
          value={values.description || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...values, description: e.target.value })}
          placeholder="Additional details about this income..."
          rows={3}
          className="form-input"
        />
      </FormField>

      {categories.length > 0 && (
        <FormField
          label="Category (Optional)"
          error={errors.categoryId}
        >
          <select
            name="categoryId"
            value={values.categoryId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...values, categoryId: e.target.value })}
            className="form-select"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
      )}
    </FormWrapper>
  );
};

export default IncomeForm;