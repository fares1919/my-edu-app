interface QuizOptionProps {
  text: string;
  index: number;
  selected: boolean;
  state: 'default' | 'correct' | 'wrong' | 'disabled';
  onClick: () => void;
  disabled?: boolean;
}

const LABELS = ['أ', 'ب', 'ج', 'د']; // A, B, C, D in Arabic

export function QuizOption({ text, index, selected, state, onClick, disabled }: QuizOptionProps) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isDisabled = state === 'disabled' || disabled;

  const classNames = [
    'quiz-option',
    selected && state === 'default' ? 'quiz-option-selected' : '',
    isCorrect ? 'quiz-option-correct' : '',
    isWrong ? 'quiz-option-wrong' : '',
    isDisabled ? 'quiz-option-disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classNames}
      onClick={onClick}
      disabled={isDisabled}
      type="button"
      aria-pressed={selected}
      aria-label={`الخيار ${LABELS[index]}: ${text}`}
    >
      <span className="quiz-option-marker">{LABELS[index]}</span>
      <span className="flex-1 text-right">{text}</span>
      {isCorrect && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      {isWrong && (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </button>
  );
}
