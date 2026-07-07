interface FeedbackProps {
  correct: boolean;
  explanation?: string | null;
}

export function Feedback({ correct, explanation }: FeedbackProps) {
  return (
    <div
      className={`feedback ${correct ? 'feedback-correct' : 'feedback-wrong'}`}
      role="alert"
    >
      <span className="feedback-icon" aria-hidden="true">
        {correct ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        )}
      </span>
      <div>
        <strong>{correct ? '✓ إجابة صحيحة' : '✕ إجابة خاطئة'}</strong>
        {explanation && (
          <p className="mt-1 text-sm opacity-85">{explanation}</p>
        )}
      </div>
    </div>
  );
}
