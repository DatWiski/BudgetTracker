import React from "react";
import type { Category, SubscriptionRequest, Period } from "../../types";
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

export type SubscriptionFormValues = {
  name: string;
  price: string;
  period: Period;
  nextBillingDate: string;
  categoryId: string;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
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
      period: values.period,
      nextBillingDate: values.nextBillingDate,
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
      <FormField label="Subscription Name" error={errors?.name} required width="lg">
        <TextInput
          id="name"
          value={values.name}
          onChange={(value) => onChange({ ...values, name: value })}
          placeholder="e.g., Netflix, Spotify"
          required
          maxLength={100}
        />
      </FormField>

      <FormField label="Price" error={errors?.price} required width="sm">
        <NumberInput
          id="price"
          value={values.price}
          onChange={(value) => onChange({ ...values, price: value })}
          placeholder="0.00"
          required
          min={0}
        />
      </FormField>

      <FormField label="Billing Period" required width="sm">
        <SelectInput
          value={values.period}
          onChange={(value) => onChange({ ...values, period: value as Period })}
          options={periodOptions}
          required
        />
      </FormField>

      <FormField label="Next Billing Date" required width="sm">
        <DateInput
          id="next-billing"
          value={values.nextBillingDate}
          onChange={(value) => onChange({ ...values, nextBillingDate: value })}
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
        label="Active subscription"
      />
    </FormWrapper>
  );
};

export default SubscriptionForm;
