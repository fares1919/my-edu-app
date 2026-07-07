import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionRepo } from '../services/db/repositories/sessions.repo';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import { getAnswersBySessionId } from '../services/db/repositories/answers.repo';
import { getQuestionsByQuizIdOrdered } from '../services/db/repositories/questions.repo';
import type { QuizSession, SessionAnswer } from '../types/session';
import type { Question } from '../types/question';
import type { Quiz } from '../types/quiz';
import { ROUTES } from '../constants/routes';

/* ============================================================
   FlashCardData — une question + la réponse de l'utilisateur
   ============================================================ */
interface FlashCardData {
  question: Question;
  answer: SessionAnswer;
  isWrong: boolean;
}

/* ============================================================
   Styles (en objet pour éviter des dépendances CSS externes)
   ============================================================ */
const styles = {
  container: {
    maxWidth: '520px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    padding: '16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  headerTitle: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  progressBadge: {
    background: 'var(--nav-active-bg)',
    color: 'var(--nav-active-text)',
    borderRadius: 'var(--radius-full)',
    padding: '4px 14px',
    fontSize: '0.82rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center' as const,
    gap: '16px',
  },
  emptyIcon: {
    fontSize: '3.5rem',
  },
  emptyText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  // === Scene 3D ===
  scene: {
    perspective: '1200px',
    width: '100%',
    aspectRatio: '3 / 2',
    cursor: 'pointer',
  } as React.CSSProperties,
  cardWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    transition: 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
    transformStyle: 'preserve-3d' as const,
  },
  cardFace: {
    position: 'absolute' as const,
    inset: 0,
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-default)',
    background: 'var(--surface-card)',
    boxShadow: 'var(--shadow-elevated)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 24px',
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    overflow: 'hidden',
  },
  frontFace: {
  },
  backFace: {
    transform: 'rotateY(180deg)',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: '12px',
    overflowY: 'auto' as const,
  },
  questionText: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    textAlign: 'center' as const,
    lineHeight: 1.7,
    margin: 0,
    wordBreak: 'break-word' as const,
  },
  flipHint: {
    fontSize: '0.78rem',
    color: 'var(--text-tertiary)',
    marginTop: 'auto',
    paddingTop: '16px',
  },
  // === Back face fields ===
  fieldLabel: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    marginBottom: '2px',
  },
  answerChip: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  correctChip: {
    background: 'var(--success-bg)',
    color: 'var(--success-text)',
    border: '1px solid var(--success-border)',
  },
  wrongChip: {
    background: 'var(--error-bg)',
    color: 'var(--error-text)',
    border: '1px solid var(--error-border)',
  },
  explanationBox: {
    background: 'var(--info-bg)',
    border: '1px solid var(--info-border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    fontSize: '0.88rem',
    color: 'var(--info-text)',
    lineHeight: 1.6,
    width: '100%' as const,
  },
  section: {
    width: '100%' as const,
  },
  // === Navigation ===
  navRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-card)',
    color: 'var(--text-primary)',
    padding: '10px 20px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--duration-fast) ease',
    minWidth: '90px',
    fontFamily: 'var(--font-body)',
  },
  navBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const,
  },
  flipBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    background: 'var(--action-primary-bg)',
    color: 'var(--action-primary-text)',
    padding: '10px 24px',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--duration-fast) ease',
    fontFamily: 'var(--font-body)',
  },
  // === Tag « wrong » sur la face avant ===
  wrongTag: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    background: 'var(--error-bg)',
    color: 'var(--error-text)',
    border: '1px solid var(--error-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px 10px',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  },
  // === Attributions ===
  backLink: {
    color: 'var(--text-link)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
};

/* ============================================================
   ReviewPage
   ============================================================ */
export function ReviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<QuizSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [cards, setCards] = useState<FlashCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  /* ---- Chargement des données ---- */
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function load() {
      try {
        const s = await sessionRepo.getById(sessionId);
        if (!s || cancelled) { navigate('/'); return; }

        const [q, answers, questions] = await Promise.all([
          quizRepo.getById(s.quizId),
          getAnswersBySessionId(sessionId),
          getQuestionsByQuizIdOrdered(s.quizId),
        ]);

        if (cancelled) return;

        // Construire un index questionId → Question
        const qMap = new Map<string, Question>();
        for (const qq of questions) qMap.set(qq.id, qq);

        // Associer chaque réponse à sa question, filtrer les wrong
        const all: FlashCardData[] = [];
        for (const a of answers) {
          const question = qMap.get(a.questionId);
          if (!question) continue;
          all.push({
            question,
            answer: a,
            isWrong: !a.isCorrect,
          });
        }

        // Ne garder que les mauvaises réponses
        const wrongCards = all.filter((c) => c.isWrong);

        setSession(s);
        if (q) setQuiz(q);
        // Si aucune mauvaise réponse, on montre tout
        setCards(wrongCards.length > 0 ? wrongCards : all);
        setCurrentIndex(0);
        setIsFlipped(false);
        setLoading(false);
      } catch (err) {
        console.error('ReviewPage — load error:', err);
        if (!cancelled) navigate('/');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId, navigate]);

  /* ---- Navigation helpers ---- */
  const total = cards.length;

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((f) => !f);
  }, []);

  /* ---- Keyboard ---- */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFlip();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goPrev, goNext, toggleFlip]);

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  /* ---- Aucune carte (cas improbable) ---- */
  if (total === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🎉</div>
        <p style={styles.emptyText}>لا توجد بطاقات للمراجعة</p>
        <Link to={ROUTES.HOME} style={styles.backLink}>← العودة للرئيسية</Link>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const hasNext = currentIndex < total - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div style={styles.container}>
      {/* ---- En-tête ---- */}
      <div style={styles.header}>
        <Link to={ROUTES.RESULT(sessionId!)} style={styles.backLink}>
          ← النتيجة
        </Link>
        <h1 style={styles.headerTitle}>
          {quiz?.title ?? 'مراجعة'}
        </h1>
        <span style={styles.progressBadge}>
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* ---- Carte 3D ---- */}
      <div
        style={styles.scene}
        onClick={toggleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'اضغط لقلب البطاقة' : 'اضغط لقلب البطاقة'}
      >
        <div
          style={{
            ...styles.cardWrapper,
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Face avant — Question */}
          <div style={{ ...styles.cardFace, ...styles.frontFace }}>
            {currentCard.isWrong && (
              <div style={styles.wrongTag}>خطأ</div>
            )}
            <p style={styles.questionText}>{currentCard.question.text}</p>
            <div style={styles.flipHint}>اضغط للاطلاع على الإجابة</div>
          </div>

          {/* Face arrière — Réponse + Explication */}
          <div style={{ ...styles.cardFace, ...styles.backFace }}>
            {/* Ce que l'utilisateur a répondu */}
            <div style={styles.section}>
              <div style={styles.fieldLabel}>إجابتك</div>
              <span
                style={{
                  ...styles.answerChip,
                  ...(currentCard.answer.isCorrect
                    ? styles.correctChip
                    : styles.wrongChip),
                }}
              >
                {currentCard.answer.selectedAnswer ?? '(لم يتم الاختيار)'}
              </span>
            </div>

            {/* La bonne réponse */}
            <div style={styles.section}>
              <div style={styles.fieldLabel}>الإجابة الصحيحة</div>
              <span style={{ ...styles.answerChip, ...styles.correctChip }}>
                {currentCard.question.correctAnswer}
              </span>
            </div>

            {/* Explication */}
            {currentCard.question.explanation && (
              <div style={styles.section}>
                <div style={styles.fieldLabel}>الشرح</div>
                <div style={styles.explanationBox}>
                  {currentCard.question.explanation}
                </div>
              </div>
            )}

            <div style={{ ...styles.flipHint, marginTop: 'auto' }}>
              اضغط لقلب البطاقة
            </div>
          </div>
        </div>
      </div>

      {/* ---- Navigation ---- */}
      <div style={styles.navRow}>
        <button
          style={{ ...styles.navBtn, ...(hasPrev ? {} : styles.navBtnDisabled) }}
          onClick={(e) => { e.stopPropagation(); goPrev(); }}
          disabled={!hasPrev}
          aria-label="السابق"
        >
          ← السابق
        </button>

        <button
          style={styles.flipBtn}
          onClick={(e) => { e.stopPropagation(); toggleFlip(); }}
          aria-label={isFlipped ? 'إخفاء الإجابة' : 'عرض الإجابة'}
        >
          {isFlipped ? 'إخفاء' : 'عرض الإجابة'}
        </button>

        <button
          style={{ ...styles.navBtn, ...(hasNext ? {} : styles.navBtnDisabled) }}
          onClick={(e) => { e.stopPropagation(); goNext(); }}
          disabled={!hasNext}
          aria-label="التالي"
        >
          التالي →
        </button>
      </div>

      {/* ---- Indication clavier ---- */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          margin: 0,
        }}
      >
        استخدم الأسهم ← → للتنقل والمسافة للقلب
      </p>
    </div>
  );
}
