interface SkeletonProps {
  variant?: 'text' | 'title' | 'card' | 'custom';
  className?: string;
  count?: number;
}

export function Skeleton({ variant = 'text', className = '', count = 1 }: SkeletonProps) {
  const baseClass = variant === 'text' ? 'skeleton-text' : variant === 'title' ? 'skeleton-title' : variant === 'card' ? 'skeleton-card' : '';

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${baseClass} ${className}`} aria-hidden="true" />
      ))}
    </>
  );
}
