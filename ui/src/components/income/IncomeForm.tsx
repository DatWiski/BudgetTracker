import React, { useState, useEffect } from 'react';
import type { Category, IncomeRequest, Period } from '../../types';
import { FormWrapper } from '../common/FormWrapper';
import { 
  FormField, 
  TextInput, 
  NumberInput, 
  DateInput, 
  SelectInput, 
  TextareaInput,
  type SelectOption 
} from '../common/FormField';

export interface IncomeFormValues {
  name: string;
  amount: string;
  incomeDate: string;
  period?: string;
  description?: string;
  categoryId?: string;
}

type Props = {
  mode: 'create' | 'edit';
  values: IncomeFormValues;
  onChange: (values: IncomeFormValues) => void;
  categories: Category[];
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: IncomeRequest | (IncomeRequest & { id: number })) => void;
  editingId?: number | null;
};

const IncomeForm: React.FC<Props> = ({
  mode,
  values,
  onChange,
  categories,
  isSubmitting,
  onCancel,
  onSubmit,
  editingId,
}) => {
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
    if (mode === 'edit' && editingId != null) {
      onSubmit({ ...payload, id: editingId });
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

  // Convert categories to SelectOption format
  const categoryOptions: SelectOption[] = categories.map(c => ({
    value: c.id.toString(),
    label: c.name
  }));

  const periodOptions: SelectOption[] = [
    { value: 'ONE_TIME', label: 'One-time' },
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' }
  ];

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      mode={mode}
    >
      <FormField label="Income Name" error={errors.name} required width="lg">
        <TextInput
          id="name"
          value={values.name}
          onChange={(value) => onChange({ ...values, name: value })}
          placeholder="e.g., Monthly Salary, Freelance Payment"
          required
          maxLength={100}
        />
      </FormField>

      <FormField label="Amount" error={errors.amount} required width="sm">
        <NumberInput
          id="amount"
          value={values.amount}
          onChange={(value) => onChange({ ...values, amount: value })}
          placeholder="0.00"
          required
          min={0}
          step="0.01"
        />
      </FormField>

      <FormField label="Income Date" error={errors.incomeDate} required width="sm">
        <DateInput
          id="income-date"
          value={values.incomeDate}
          onChange={(value) => onChange({ ...values, incomeDate: value })}
          required
          min="1900-01-01"
          max="2100-12-31"
        />
      </FormField>

      <FormField label="Frequency" error={errors.period} required width="sm">
        <SelectInput
          value={values.period || 'ONE_TIME'}
          onChange={(value) => onChange({ ...values, period: value })}
          options={periodOptions}
          required
        />
      </FormField>

      <FormField label="Description" error={errors.description} width="lg">
        <TextareaInput
          id="description"
          value={values.description || ''}
          onChange={(value) => onChange({ ...values, description: value })}
          placeholder="Additional details about this income..."
          rows={3}
        />
      </FormField>

      <FormField label="Category" error={errors.categoryId} width="sm">
        <SelectInput
          value={values.categoryId || ''}
          onChange={(value) => onChange({ ...values, categoryId: value })}
          options={categoryOptions}
          placeholder="Select Category"
        />
      </FormField>
    </FormWrapper>
  );
};

export default IncomeForm;