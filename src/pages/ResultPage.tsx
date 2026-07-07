import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionRepo } from '../services/db/repositories/sessions.repo';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import { getAnswersBySessionId } from '../services/db/repositories/answers.repo';
import type { QuizSession, SessionAnswer } from '../types/session';
import type { Quiz } from '../types/quiz';
import { ROUTES } from '../constants/routes';
import { formatDuration } from '../utils/formatters';
import { ScoreCircle } from '../components/ui/ScoreCircle';

/* ──────────────────────────────────────────────
   Confetti particles (lightweight, CSS-only)
   ────────────────────────────────────────────── */
function ConfettiBurst() {
  const particles = useMemo(() => {
    const colors = ['#DB3B3B', '#E8860A', '#1FA65C', '#2A72E6', '#FFC24D', '#7AACFF', '#6FD199'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 8,
      drift: Math.random() > 0.5 ? 'confettiDrift' : 'confettiFall',
    }));
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size * 1.4,
            borderRadius: '2px',
            backgroundColor: p.color,
            animation: `${p.drift} ${p.duration}s ease-out ${p.delay}s both`,
            transform: `rotate(${p.id * 37}deg)`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Performance timeline dots
   ────────────────────────────────────────────── */
function PerformanceTimeline({ answers }: { answers: SessionAnswer[] }) {
  if (answers.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
      {answers.map((a, idx) => (
        <div
          key={a.id}
          title={`السؤال ${idx + 1}: ${a.isCorrect ? 'صحيح' : 'خطأ'}`}
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: a.isCorrect
              ? 'var(--accent-success, #1FA65C)'
              : 'var(--accent-error, #DB3B3B)',
            boxShadow: a.isCorrect
              ? '0 0 4px rgba(31,166,92,0.4)'
              : '0 0 4px rgba(219,59,59,0.4)',
            animation: `scaleIn 0.3s ease-out ${0.05 * idx}s both`,
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.4)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Stat line component
   ────────────────────────────────────────────── */
function StatLine({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div
      className={`stagger-${delay}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid var(--border-light, #EEF0F4)',
      }}
    >
      <span style={{ color: 'var(--text-secondary, #515968)', fontSize: '0.9rem' }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-primary, #161A20)', fontWeight: 600, fontSize: '0.95rem' }}>
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   RESULT PAGE
   ══════════════════════════════════════════════ */
export function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!sessionId) return;
      try {
        const s = await sessionRepo.getById(sessionId);
        if (!s) { navigate('/'); return; }
        setSession(s);

        const q = await quizRepo.getById(s.quizId);
        if (q) setQuiz(q);

        // Load session answers for timeline
        try {
          const ans = await getAnswersBySessionId(sessionId);
          setAnswers(ans);
        } catch {
          // answers may not exist for older sessions
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load result:', err);
        navigate('/');
      }
    }
    load();
  }, [sessionId, navigate]);

  if (loading || !session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--accent-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  const medalEmoji = session.score >= 90 ? '🥇' : session.score >= 75 ? '🥈' : session.score >= 50 ? '🥉' : null;
  const showConfetti = session.score >= 90;

  // Subject label
  const subjectLabel = session.subject
    ? session.subject.charAt(0).toUpperCase() + session.subject.slice(1)
    : quiz?.subject
      ? quiz.subject.charAt(0).toUpperCase() + quiz.subject.slice(1)
      : '—';

  // Stats lines
  const stats = [
    { label: 'المادة', value: subjectLabel },
    { label: 'عدد الأسئلة', value: `${session.totalQuestions}` },
    { label: 'صحيح', value: `${session.correctCount}`, color: 'var(--accent-success)' },
    { label: 'خطأ', value: `${session.wrongCount}`, color: 'var(--accent-error)' },
    { label: 'المدة الإجمالية', value: formatDuration(session.totalDuration) },
    { label: 'المعدل لكل سؤال', value: `${session.averageTimePerQuestion} ثانية` },
  ];

  // Accuracy percentage
  const accuracy = session.totalQuestions > 0
    ? Math.round((session.correctCount / session.totalQuestions) * 100)
    : 0;

  return (
    <>
      {showConfetti && <ConfettiBurst />}

      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: '32px',
        }}
      >
        {/* ── Score Circle Card ── */}
        <div
          className="card stagger-1"
          style={{
            textAlign: 'center',
            padding: '28px 20px 24px',
            border: 'none',
            background: 'linear-gradient(135deg, var(--surface-card) 0%, var(--surface-elevated) 100%)',
            boxShadow: 'var(--shadow-elevated)',
            borderRadius: 'var(--radius-xl, 24px)',
          }}
        >
          {/* Medal */}
          {medalEmoji && (
            <div
              style={{
                fontSize: '3.2rem',
                marginBottom: '8px',
                animation: 'scaleIn 0.5s ease-out 0.2s both',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
              }}
            >
              {medalEmoji}
            </div>
          )}

          {/* ScoreCircle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '8px',
              animation: 'scaleIn 0.6s ease-out 0.1s both',
            }}
          >
            <ScoreCircle score={session.score} size={170} />
          </div>

          {/* Message */}
          <p
            className="stagger-2"
            style={{
              margin: '6px 0 0',
              fontSize: '0.95rem',
              color: 'var(--text-secondary, #515968)',
            }}
          >
            {session.score >= 90
              ? 'ممتاز! أداء رائع 🎉'
              : session.score >= 75
                ? 'جيد جداً! عمل مشرف 👍'
                : session.score >= 50
                  ? 'يمكنك التحسن أكثر 💪'
                  : 'حاول مرة أخرى لتتحسن 📚'}
          </p>
        </div>

        {/* ── Performance Timeline ── */}
        {answers.length > 0 && (
          <div
            className="card stagger-2"
            style={{ padding: '16px 20px' }}
          >
            <h3
              style={{
                margin: '0 0 12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              أداء الأسئلة
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 500 }}>
                ● {session.correctCount} صحيح
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-error)', fontWeight: 500 }}>
                ● {session.wrongCount} خطأ
              </span>
            </div>
            <PerformanceTimeline answers={answers} />
            <p
              style={{
                margin: '10px 0 0',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                textAlign: 'center',
              }}
            >
              الدقة: {accuracy}%
            </p>
          </div>
        )}

        {/* ── Statistics Card ── */}
        <div
          className="card stagger-3"
          style={{ padding: '16px 20px' }}
        >
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            الإحصائيات
          </h3>
          <div>
            {stats.map((stat, idx) => (
              <StatLine
                key={stat.label}
                label={stat.label}
                value={stat.value}
                delay={idx + 1}
              />
            ))}
          </div>
        </div>

        {/* ── Subject Breakdown ── */}
        {session.totalQuestions > 0 && (
          <div
            className="card stagger-4"
            style={{ padding: '16px 20px' }}
          >
            <h3
              style={{
                margin: '0 0 12px',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              تفصيل النتائج
            </h3>

            {/* Accuracy bar */}
            <div style={{ marginBottom: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  marginBottom: '4px',
                }}
              >
                <span style={{ color: 'var(--text-secondary)' }}>نسبة النجاح</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {accuracy}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: 'var(--border-light, #EEF0F4)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${accuracy}%`,
                    height: '100%',
                    borderRadius: 'var(--radius-full)',
                    background: accuracy >= 75
                      ? 'var(--accent-success)'
                      : accuracy >= 50
                        ? 'var(--accent-secondary)'
                        : 'var(--accent-error)',
                    transition: 'width 1s ease-out',
                    animation: 'slideUp 0.8s ease-out 0.3s both',
                  }}
                />
              </div>
            </div>

            {/* Correct / Wrong breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <div
                style={{
                  background: 'var(--success-bg, #E8F7EE)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  textAlign: 'center',
                  animation: 'scaleIn 0.4s ease-out 0.4s both',
                }}
              >
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--success-text, #16874A)',
                  }}
                >
                  {session.correctCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--success-text, #16874A)' }}>
                  صحيح
                </div>
              </div>
              <div
                style={{
                  background: 'var(--error-bg, #FDECEC)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  textAlign: 'center',
                  animation: 'scaleIn 0.4s ease-out 0.5s both',
                }}
              >
                <div
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    color: 'var(--error-text, #B92C2C)',
                  }}
                >
                  {session.wrongCount}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--error-text, #B92C2C)' }}>
                  خطأ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div
          className="stagger-5"
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          {quiz && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--action-primary-bg)',
                color: 'var(--action-primary-text)',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-elevated)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = '';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
              }}
            >
              إعادة الاختبار
            </button>
          )}

          <Link
            to={answers.length > 0 ? '#' : ROUTES.EXAMS}
            className="btn btn-ghost"
            style={{
              textAlign: 'center',
              textDecoration: 'none',
              display: 'block',
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              background: 'var(--surface-card)',
              transition: 'background 0.2s ease, border-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--nav-hover-bg)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = '';
              (e.currentTarget as HTMLElement).style.borderColor = '';
            }}
          >
            مراجعة الإجابات
          </Link>

          <Link
            to={ROUTES.EXAMS}
            className="btn btn-ghost"
            style={{
              textAlign: 'center',
              textDecoration: 'none',
              display: 'block',
              padding: '10px 24px',
              fontSize: '0.9rem',
              color: 'var(--accent-primary)',
              borderRadius: 'var(--radius-lg)',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--action-ghost-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            العودة للاختبارات
          </Link>
        </div>

        {/* ── Secondary Links ── */}
        <div
          className="stagger-6"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '8px',
          }}
        >
          <Link
            to={ROUTES.STATS}
            style={{
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = '';
            }}
          >
            عرض الإحصائيات
          </Link>
          <Link
            to={ROUTES.MEDALS}
            style={{
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = '';
            }}
          >
            الميداليات
          </Link>
        </div>
      </div>
    </>
  );
}
