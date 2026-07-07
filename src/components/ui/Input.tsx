import type { ReactNode, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  required?: boolean;
}

export function Input({
  label,
  hint,
  error,
  icon,
  required = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={`label ${required ? 'label-required' : ''}`}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={[
            'input',
            icon ? 'pr-10' : '',
            error ? 'input-error' : '',
            className,
          ].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {hint && !error && (
        <span id={`${inputId}-hint`} className="text-sm text-secondary">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-error`} className="text-sm font-medium" style={{ color: 'var(--error-text)' }} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
