import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { sessionRepo } from '../services/db/repositories/sessions.repo';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import type { QuizSession } from '../types/session';
import type { Quiz } from '../types/quiz';
import { ROUTES } from '../constants/routes';
import { formatDuration } from '../utils/formatters';

export function ResultPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
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
        setLoading(false);
      } catch (err) {
        console.error('Failed to load result:', err);
        navigate('/');
      }
    }
    load();
  }, [sessionId]);

  if (loading || !session) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const medal = session.score >= 90 ? '🥇' : session.score >= 75 ? '🥈' : session.score >= 50 ? '🥉' : null;

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Carte résultat */}
      <div className="card" style={{
        textAlign: 'center',
        padding: '32px 24px',
        animation: 'fadeIn 0.4s ease-out',
      }}>
        {medal && (
          <div style={{
            fontSize: '4rem',
            marginBottom: '12px',
            animation: session.score >= 90 ? 'scaleIn 0.5s ease-out' : undefined,
          }}>
            {medal}
          </div>
        )}

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
          النتيجة
        </h1>

        <div style={{
          fontSize: '3rem',
          fontWeight: 700,
          color: 'var(--accent-primary)',
          marginBottom: '20px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {session.score}%
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <div style={{
            background: 'var(--success-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)' }}>
              {session.correctCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              صحيح
            </div>
          </div>
          <div style={{
            background: 'var(--error-bg)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error-text)' }}>
              {session.wrongCount}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              خطأ
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
            المدة الإجمالية: {formatDuration(session.totalDuration)}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
            المعدل لكل سؤال: {session.averageTimePerQuestion} ثانية
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
            عدد الأسئلة: {session.totalQuestions}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {quiz && (
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/quiz/${quiz.id}`)}
          >
            إعادة الاختبار
          </button>
        )}
        <Link
          to={ROUTES.EXAMS}
          className="btn btn-ghost"
          style={{
            textAlign: 'center',
            textDecoration: 'none',
            display: 'block',
          }}
        >
          العودة للاختبارات
        </Link>
      </div>

      {/* Liens secondaires */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
      }}>
        <Link
          to={ROUTES.STATS}
          style={{
            color: 'var(--accent-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          عرض الإحصائيات
        </Link>
        <Link
          to={ROUTES.MEDALS}
          style={{
            color: 'var(--accent-primary)',
            textDecoration: 'none',
            fontSize: '0.9rem',
          }}
        >
          الميداليات
        </Link>
      </div>
    </div>
  );
}
