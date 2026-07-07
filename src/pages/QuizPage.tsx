import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { useSessionStore } from '../stores/session.store';
import type { Question } from '../types/question';
import type { Quiz } from '../types/quiz';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import { questionRepo } from '../services/db/repositories/questions.repo';
import { getEffectiveDuration } from '../services/quiz/quiz.timer';
import type { ShuffledChoice } from '../services/quiz/quiz.shuffle';

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const { startQuiz, submitAnswer, getCurrentQuestion, getCurrentChoices, engine, isRunning, finishAndSave, reset } = useSessionStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAnswerTime, setCurrentAnswerTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const timerRef = useRef<number | null>(null);
  const questionStartRef = useRef<number>(Date.now());
  const hasSavedRef = useRef(false);
  const lastQuestionRef = useRef<Question | null>(null);
  const lastChoicesRef = useRef<ShuffledChoice[] | null>(null);

  // Charger le quiz et les questions
  useEffect(() => {
    async function loadQuiz() {
      if (!quizId || !activeProfile) return;
      try {
        const q = await quizRepo.getById(quizId);
        if (!q) { navigate('/exams'); return; }
        setQuiz(q);

        const qs = await questionRepo.getAll().then(all => all.filter(q => q.quizId === quizId));
        const sorted = qs.sort((a, b) => a.order - b.order);
        setQuestions(sorted);

        startQuiz(q, sorted, activeProfile.id);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load quiz:', err);
        navigate('/exams');
      }
    }
    loadQuiz();

    return () => { reset(); if (timerRef.current) clearInterval(timerRef.current); };
  }, [quizId, activeProfile]);

  // Confirmation d'abandon — navigation / refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && !hasSavedRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = () => {
      if (isRunning && !hasSavedRef.current) {
        setShowAbandonConfirm(true);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isRunning]);

  const handleAbandon = () => {
    hasSavedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    reset();
    navigate('/exams');
  };

  // Démarrer le timer quand la question change
  useEffect(() => {
    if (!isRunning || !engine || !quiz || showAbandonConfirm) return;

    const question = getCurrentQuestion();
    if (!question) return;

    const duration = getEffectiveDuration(question.duration, quiz.defaultDuration);
    setTimeLeft(duration);
    setCurrentAnswerTime(0);
    setSelectedChoice(null);
    setShowFeedback(false);
    setLastCorrect(null);
    questionStartRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
          handleTimeout(timeSpent);
          return 0;
        }
        return prev - 1;
      });
      setCurrentAnswerTime(prev => prev + 1);
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [engine?.currentQuestionIndex, isRunning, showAbandonConfirm]);

  const handleTimeout = useCallback((timeSpent: number) => {
    submitAnswer(undefined, timeSpent);
    setShowFeedback(true);
    setLastCorrect(false);
    updateLastRefs();
  }, [submitAnswer]);

  const handleChoiceClick = (choiceText: string) => {
    if (showFeedback) return;
    setSelectedChoice(choiceText);

    if (timerRef.current) clearInterval(timerRef.current);
    const question = getCurrentQuestion();
    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
    const isCorrect = choiceText.trim() === question?.correctAnswer.trim();
    setLastCorrect(isCorrect);
    submitAnswer(choiceText, timeSpent);
    setShowFeedback(true);
    updateLastRefs();
  };

  // Sauvegarder la dernière question et ses choix pour l'affichage du feedback final
  const updateLastRefs = () => {
    const q = getCurrentQuestion();
    if (q) {
      lastQuestionRef.current = q;
    }
    // Pour le dernier feedback, on prend la question précédente via l'engine
    if (engine && engine.questions.length > 0) {
      const lastIdx = engine.questions.length - 1;
      lastQuestionRef.current = engine.questions[lastIdx];
    }
    if (engine && engine.shuffledChoices.length > 0) {
      const lastIdx = engine.shuffledChoices.length - 1;
      lastChoicesRef.current = engine.shuffledChoices[lastIdx];
    }
  };

  const handleNext = () => {
    if (engine?.isFinished) {
      saveAndFinish();
    } else {
      setShowFeedback(false);
      setSelectedChoice(null);
    }
  };

  const saveAndFinish = async () => {
    hasSavedRef.current = true;
    const session = await finishAndSave();
    if (session) {
      reset();
      navigate(`/result/${session.id}`);
    }
  };

  // Auto-advance après feedback (sauf pour la dernière question)
  useEffect(() => {
    if (showFeedback && !engine?.isFinished && !showAbandonConfirm) {
      const timer = setTimeout(() => handleNext(), 1500);
      return () => clearTimeout(timer);
    }
  }, [showFeedback, engine?.isFinished, showAbandonConfirm]);

  if (loading || !engine) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  const question = getCurrentQuestion();
  const choices = getCurrentChoices();
  const answeredCount = engine.answers.length;
  const totalCount = engine.session.totalQuestions;
  const displayQuestion = question || lastQuestionRef.current;
  const displayChoices = choices || lastChoicesRef.current;
  const isFinished = engine.isFinished;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Modal d'abandon */}
      {showAbandonConfirm && (
        <div className="overlay" onClick={() => setShowAbandonConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} dir="rtl">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              هل تريد الخروج من الاختبار؟
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              لن يتم حفظ النتائج الحالية، ولن تظهر في الإحصائيات.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => setShowAbandonConfirm(false)}>
                متابعة الاختبار
              </button>
              <button className="btn btn-ghost" onClick={handleAbandon}>
                تأكيد الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'abandon */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowAbandonConfirm(true)}
        >
          ← خروج
        </button>
      </div>

      {/* Progression */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
          {isFinished && showFeedback
            ? `النتيجة`
            : `السؤال ${answeredCount + 1} من ${totalCount}`}
        </span>
        {!isFinished && (
          <span style={{
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            fontWeight: timeLeft <= 10 ? 700 : 400,
            color: timeLeft <= 10 ? 'var(--accent-error)' : 'var(--text-tertiary)',
            transition: 'color 0.3s ease',
          }}>
            {timeLeft} ثانية
          </span>
        )}
      </div>

      {/* Barre de progression */}
      <div style={{
        width: '100%',
        height: '6px',
        background: 'var(--surface-card)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'var(--accent-primary)',
          borderRadius: '999px',
          transition: 'width 0.3s ease',
          width: `${(answeredCount / Math.max(totalCount, 1)) * 100}%`,
          marginRight: 'auto',
        }} />
      </div>

      {/* Question — affichée sauf si fini ET feedback visible (on montre le résumé) */}
      {!isFinished && displayQuestion && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.7,
          }}>
            {displayQuestion.text}
          </h2>

          {/* Choix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayChoices?.map((choice, index) => {
              let borderColor = 'var(--border-default)';
              let bgColor = 'var(--surface-card)';

              if (!showFeedback) {
                borderColor = selectedChoice === choice.text
                  ? 'var(--accent-primary)'
                  : 'var(--border-default)';
                bgColor = selectedChoice === choice.text
                  ? 'var(--nav-active-bg)'
                  : 'var(--surface-card)';
              } else {
                if (choice.text === displayQuestion.correctAnswer) {
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
                  key={index}
                  onClick={() => handleChoiceClick(choice.text)}
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
                    opacity: showFeedback && choice.text !== selectedChoice && choice.text !== displayQuestion.correctAnswer ? 0.5 : 1,
                    fontSize: '1rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  {choice.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback — visible après chaque réponse */}
      {showFeedback && displayQuestion && (
        <div className="card" style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: lastCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
            border: `1px solid ${lastCorrect ? 'var(--success-border)' : 'var(--error-border)'}`,
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                {lastCorrect ? '✅' : timeLeft === 0 ? '⏰' : '❌'}
              </span>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontWeight: 600,
                  color: lastCorrect ? 'var(--success-text)' : 'var(--error-text)',
                  margin: '0 0 4px 0',
                }}>
                  {timeLeft === 0
                    ? 'انتهى الوقت!'
                    : lastCorrect
                      ? 'إجابة صحيحة!'
                      : 'إجابة خاطئة'}
                </p>
                {!lastCorrect && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                    الإجابة الصحيحة: <strong>{displayQuestion.correctAnswer}</strong>
                  </p>
                )}
                {displayQuestion.explanation && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                    💡 {displayQuestion.explanation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bouton suivant ou résultat */}
          {isFinished ? (
            <button className="btn btn-primary" onClick={saveAndFinish} style={{ width: '100%' }}>
              عرض النتيجة
            </button>
          ) : (
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: 0 }}>
              جارٍ الانتقال إلى السؤال التالي...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
