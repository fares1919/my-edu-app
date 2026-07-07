interface ProgressBarProps {
  value: number;     // 0–100
  variant?: 'primary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const variantClass = {
  primary: 'progress-fill',
  success: 'progress-fill progress-fill-success',
  warning: 'progress-fill progress-fill-warning',
  error: 'progress-fill progress-fill-error',
};

export function ProgressBar({ value, variant = 'primary', showLabel = false, size = 'md' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-3">
      <div className={`progress ${size === 'sm' ? 'h-1.5' : ''}`} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={variantClass[variant]}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-semibold tabular-nums shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}
