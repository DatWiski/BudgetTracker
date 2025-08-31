import React, { type ReactNode } from "react";

// Base form field wrapper
export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  width?: "sm" | "md" | "lg" | "full";
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  children,
  width = "md",
}) => {
  const widthClasses = {
    sm: "175px",
    md: "250px",
    lg: "350px",
    full: "100%",
  };

  return (
    <div style={{ maxWidth: widthClasses[width] }}>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && <div className="text-xs mt-2 text-red-400">{error}</div>}
    </div>
  );
};

// Text input component
export interface TextInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "password";
  maxLength?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  maxLength,
}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full text-white text-base outline-none rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all duration-200"
      style={{
        background: "rgba(51, 65, 85, 0.8)",
        border: "1px solid rgba(100, 116, 139, 0.4)",
        padding: "12px 16px",
        color: "#ffffff",
      }}
    />
  );
};

// Number input component
export interface NumberInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: number;
  max?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  step = "0.01",
  min,
  max,
}) => {
  return (
    <input
      id={id}
      type="number"
      step={step}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full text-white text-base outline-none rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all duration-200"
      style={{
        background: "rgba(51, 65, 85, 0.8)",
        border: "1px solid rgba(100, 116, 139, 0.4)",
        padding: "12px 16px",
        color: "#ffffff",
      }}
    />
  );
};

// Date input component
export interface DateInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  min?: string;
  max?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  value,
  onChange,
  required,
  min,
  max,
}) => {
  return (
    <input
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      min={min}
      max={max}
      className="w-full text-white text-base outline-none rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all duration-200"
      style={{
        background: "rgba(51, 65, 85, 0.8)",
        border: "1px solid rgba(100, 116, 139, 0.4)",
        padding: "12px 16px",
        color: "#ffffff",
      }}
    />
  );
};

// Select dropdown component
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder,
  required,
}) => {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full text-white text-base outline-none rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all duration-200 cursor-pointer"
      style={{
        background: "rgba(51, 65, 85, 0.8)",
        border: "1px solid rgba(100, 116, 139, 0.4)",
        padding: "12px 16px",
        color: "#ffffff",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Textarea component
export interface TextareaInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}

export const TextareaInput: React.FC<TextareaInputProps> = ({
  id,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
  maxLength,
}) => {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full text-white text-base outline-none rounded-lg focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all duration-200 resize-vertical"
      style={{
        background: "rgba(51, 65, 85, 0.8)",
        border: "1px solid rgba(100, 116, 139, 0.4)",
        padding: "12px 16px",
        color: "#ffffff",
        minHeight: "80px",
      }}
    />
  );
};

// Checkbox component
export interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 cursor-pointer rounded"
        style={{ accentColor: "var(--color-primary)" }}
      />
      <label htmlFor={id} className="text-white cursor-pointer text-base font-medium">
        {label}
      </label>
    </div>
  );
};
