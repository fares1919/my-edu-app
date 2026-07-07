import type { Question } from '../../types/question';

interface FeedbackPanelProps {
  showFeedback: boolean;
  lastCorrect: boolean | null;
  timeLeft: number;
  displayQuestion: Question | null;
  isFinished: boolean;
  saveAndFinish: () => void;
}

export function FeedbackPanel({
  showFeedback,
  lastCorrect,
  timeLeft,
  displayQuestion,
  isFinished,
  saveAndFinish,
}: FeedbackPanelProps) {
  if (!showFeedback || !displayQuestion) return null;

  return (
    <div
      className="card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          background: lastCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
          border: `1px solid ${
            lastCorrect ? 'var(--success-border)' : 'var(--error-border)'
          }`,
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>
            {lastCorrect ? '✅' : timeLeft === 0 ? '⏰' : '❌'}
          </span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontWeight: 600,
                color: lastCorrect
                  ? 'var(--success-text)'
                  : 'var(--error-text)',
                margin: '0 0 4px 0',
              }}
            >
              {timeLeft === 0
                ? 'انتهى الوقت!'
                : lastCorrect
                  ? 'إجابة صحيحة!'
                  : 'إجابة خاطئة'}
            </p>
            {!lastCorrect && (
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  margin: '0 0 4px 0',
                }}
              >
                الإجابة الصحيحة:{' '}
                <strong>{displayQuestion.correctAnswer}</strong>
              </p>
            )}
            {displayQuestion.explanation && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-tertiary)',
                  margin: '4px 0 0 0',
                }}
              >
                💡 {displayQuestion.explanation}
              </p>
            )}
          </div>
        </div>
      </div>

      {isFinished ? (
        <button
          className="btn btn-primary"
          onClick={saveAndFinish}
          style={{ width: '100%' }}
        >
          عرض النتيجة
        </button>
      ) : (
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-tertiary)',
            margin: 0,
          }}
        >
          جارٍ الانتقال إلى السؤال التالي...
        </p>
      )}
    </div>
  );
}
