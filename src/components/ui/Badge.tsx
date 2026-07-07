type BadgeVariant = 'success' | 'error' | 'warning' | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  children: string;
  icon?: boolean;
}

const variantClass: Record<BadgeVariant, string> = {
  success: 'badge-success',
  error: 'badge-error',
  warning: 'badge-warning',
  info: 'badge-info',
};

const icons: Record<BadgeVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function Badge({ variant, children, icon = true }: BadgeProps) {
  return (
    <span className={`badge ${variantClass[variant]}`}>
      {icon && <span className="badge-icon">{icons[variant]}</span>}
      {children}
    </span>
  );
}
