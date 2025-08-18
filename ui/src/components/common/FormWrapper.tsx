import React, { type ReactNode } from 'react';

export interface FormWrapperProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode: 'create' | 'edit';
  submitText?: string; // Custom submit button text
  cancelText?: string; // Custom cancel button text
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode,
  submitText,
  cancelText = 'Cancel'
}) => {
  const getSubmitText = () => {
    if (submitText) return submitText;
    if (isSubmitting) return 'Saving...';
    return mode === 'edit' ? 'Update' : 'Create';
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {children}
      
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-700/50">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          {cancelText}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
          style={{ 
            opacity: isSubmitting ? 0.6 : 1, 
            cursor: isSubmitting ? 'not-allowed' : 'pointer' 
          }}
        >
          {getSubmitText()}
        </button>
      </div>
    </form>
  );
};