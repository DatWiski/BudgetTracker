import React from "react";
import type { Category, BillRequest, Period } from "../../types";
import { FormWrapper } from "../common/FormWrapper";
import {
  FormField,
  TextInput,
  NumberInput,
  DateInput,
  SelectInput,
  Checkbox,
  type SelectOption,
} from "../common/FormField";

export type BillFormValues = {
  name: string;
  amount: string;
  period: Period;
  dueDate: string;
  categoryId: string;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
  values: BillFormValues;
  onChange: (values: BillFormValues) => void;
  categories: Category[];
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: BillRequest | (BillRequest & { id: number })) => void;
  editingId?: number | null;
};

const BillForm: React.FC<Props> = ({
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
    const payload: BillRequest = {
      name: values.name.trim(),
      amount: parseFloat(values.amount),
      period: values.period,
      dueDate: values.dueDate,
      categoryId: values.categoryId ? parseInt(values.categoryId) : undefined,
      active: values.active,
    };
    if (mode === "edit" && editingId != null) {
      onSubmit({ ...payload, id: editingId });
    } else {
      onSubmit(payload);
    }
  };

  // Convert categories to SelectOption format
  const categoryOptions: SelectOption[] = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  const periodOptions: SelectOption[] = [
    { value: "ONE_TIME", label: "One-time" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "YEARLY", label: "Yearly" },
  ];

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
      mode={mode}
    >
      <FormField label="Bill Name" error={errors?.name} required width="lg">
        <TextInput
          id="name"
          value={values.name}
          onChange={(value) => onChange({ ...values, name: value })}
          placeholder="e.g., Rent, Electric Bill"
          required
          maxLength={100}
        />
      </FormField>

      <FormField label="Amount" error={errors?.amount} required width="sm">
        <NumberInput
          id="amount"
          value={values.amount}
          onChange={(value) => onChange({ ...values, amount: value })}
          placeholder="0.00"
          required
          min={0}
        />
      </FormField>

      <FormField label="Period" required width="sm">
        <SelectInput
          value={values.period}
          onChange={(value) => onChange({ ...values, period: value as Period })}
          options={periodOptions}
          required
        />
      </FormField>

      <FormField label="Due Date" required width="sm">
        <DateInput
          id="due-date"
          value={values.dueDate}
          onChange={(value) => onChange({ ...values, dueDate: value })}
          required
          min="1900-01-01"
          max="2100-12-31"
        />
      </FormField>

      <FormField label="Category" error={errors?.categoryId} width="sm">
        <SelectInput
          value={values.categoryId}
          onChange={(value) => onChange({ ...values, categoryId: value })}
          options={categoryOptions}
          placeholder="Select Category"
        />
      </FormField>

      <Checkbox
        id="active"
        checked={values.active}
        onChange={(checked) => onChange({ ...values, active: checked })}
        label="Active bill"
      />
    </FormWrapper>
  );
};

export default BillForm;
