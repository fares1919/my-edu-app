interface TimerProps {
  seconds: number;
  total?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function Timer({ seconds, total, size = 'md' }: TimerProps) {
  const isWarning = total ? seconds <= total * 0.25 : seconds <= 10;
  const isDanger = seconds <= 5;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div
      className={`timer ${isDanger ? 'timer-danger' : isWarning ? 'timer-warning' : ''} ${sizeClass}`}
      aria-live="polite"
      aria-label={`${mins} minutes et ${secs} secondes restantes`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 1.5" />
        <path d="M9 2h6" />
      </svg>
      {display}
    </div>
  );
}
