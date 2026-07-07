import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', elevated = false, interactive = false, onClick }: CardProps) {
  return (
    <div
      className={[
        'card',
        elevated ? 'card-elevated' : '',
        interactive ? 'card-interactive' : '',
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
