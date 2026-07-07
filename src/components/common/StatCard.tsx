interface StatCardProps {
  value: string | number;
  label: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ value, label, icon, trend }: StatCardProps) {
  const trendColor = trend === 'up' ? 'var(--success-text)' : trend === 'down' ? 'var(--error-text)' : 'var(--text-secondary)';

  return (
    <div className="stat-card">
      {icon && <div className="text-2xl mb-1" aria-hidden="true">{icon}</div>}
      <div className="stat-value" style={trend ? { color: trendColor } : undefined}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
