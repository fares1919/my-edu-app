import type { ShuffledChoice } from '../../services/quiz/quiz.shuffle';

interface ChoiceButtonProps {
  choice: ShuffledChoice;
  selectedChoice: string | null;
  showFeedback: boolean;
  lastCorrect: boolean | null;
  correctAnswer: string;
  onClick: (text: string) => void;
}

export function ChoiceButton({
  choice,
  selectedChoice,
  showFeedback,
  lastCorrect,
  correctAnswer,
  onClick,
}: ChoiceButtonProps) {
  let borderColor = 'var(--border-default)';
  let bgColor = 'var(--surface-card)';

  if (!showFeedback) {
    borderColor =
      selectedChoice === choice.text ? 'var(--accent-primary)' : 'var(--border-default)';
    bgColor =
      selectedChoice === choice.text ? 'var(--nav-active-bg)' : 'var(--surface-card)';
  } else {
    if (choice.text === correctAnswer) {
      borderColor = 'var(--success-border)';
      bgColor = 'var(--success-bg)';
    } else if (choice.text === selectedChoice && !lastCorrect) {
      borderColor = 'var(--error-border)';
      bgColor = 'var(--error-bg)';
    } else {
      borderColor = 'var(--border-default)';
      bgColor = 'transparent';
    }
  }

  return (
    <button
      onClick={() => onClick(choice.text)}
      disabled={showFeedback}
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${borderColor}`,
        background: bgColor,
        cursor: showFeedback ? 'default' : 'pointer',
        textAlign: 'right',
        transition: 'all 0.15s ease',
        opacity:
          showFeedback &&
          choice.text !== selectedChoice &&
          choice.text !== correctAnswer
            ? 0.5
            : 1,
        fontSize: '1rem',
        color: 'var(--text-primary)',
      }}
    >
      {choice.text}
    </button>
  );
}
