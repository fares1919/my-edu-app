import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { useSessionStore } from '../stores/session.store';
import type { Question } from '../types/question';
import type { Quiz } from '../types/quiz';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import { questionRepo } from '../services/db/repositories/questions.repo';
import type { ShuffledChoice } from '../services/quiz/quiz.shuffle';
import { useQuizTimer } from '../hooks/useQuizTimer';
import { AbandonModal } from '../components/modals/AbandonModal';
import { ChoiceButton } from '../components/ui/ChoiceButton';
import { FeedbackPanel } from '../components/ui/FeedbackPanel';

export function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const {
    startQuiz,
    submitAnswer,
    getCurrentQuestion,
    getCurrentChoices,
    engine,
    isRunning,
    finishAndSave,
    reset,
  } = useSessionStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const hasSavedRef = useRef(false);
  const lastQuestionRef = useRef<Question | null>(null);
  const lastChoicesRef = useRef<ShuffledChoice[] | null>(null);

  // Charger le quiz et les questions
  useEffect(() => {
    async function loadQuiz() {
      if (!quizId || !activeProfile) return;
      try {
        const q = await quizRepo.getById(quizId);
        if (!q) {
          navigate('/exams');
          return;
        }
        setQuiz(q);

        const qs = await questionRepo
          .getAll()
          .then((all) => all.filter((qs) => qs.quizId === quizId));
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

    return () => {
      reset();
    };
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
    reset();
    navigate('/exams');
  };

  // Sauvegarder la dernière question et ses choix pour l'affichage du feedback final
  const updateLastRefs = useCallback(() => {
    if (engine && engine.answers.length > 0) {
      const lastIdx = engine.answers.length - 1;
      lastQuestionRef.current = engine.questions[lastIdx];
      lastChoicesRef.current = engine.shuffledChoices[lastIdx];
    }
  }, [engine]);

  const handleTimeout = useCallback(
    (timeSpent: number) => {
      submitAnswer(undefined, timeSpent);
      setShowFeedback(true);
      setLastCorrect(false);
      updateLastRefs();
    },
    [submitAnswer, updateLastRefs],
  );

  const handleQuestionChange = useCallback(() => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setLastCorrect(null);
  }, []);

  const { timeLeft, currentAnswerTime, stopTimer, getTimeSpent } = useQuizTimer({
    isRunning,
    engine,
    quiz,
    showAbandonConfirm,
    getCurrentQuestion,
    onTimeout: handleTimeout,
    onQuestionChange: handleQuestionChange,
  });

  const handleChoiceClick = (choiceText: string) => {
    if (showFeedback) return;
    setSelectedChoice(choiceText);

    stopTimer();
    const question = getCurrentQuestion();
    const timeSpent = getTimeSpent();
    const isCorrect = choiceText.trim() === question?.correctAnswer.trim();
    setLastCorrect(isCorrect);
    submitAnswer(choiceText, timeSpent);
    setShowFeedback(true);
    updateLastRefs();
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
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

  const question = getCurrentQuestion();
  const choices = getCurrentChoices();
  const answeredCount = engine.answers.length;
  const totalCount = engine.session.totalQuestions;
  const displayQuestion = question || lastQuestionRef.current;
  const displayChoices = choices || lastChoicesRef.current;
  const isFinished = engine.isFinished;

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <AbandonModal
        show={showAbandonConfirm}
        onClose={() => setShowAbandonConfirm(false)}
        onConfirm={handleAbandon}
      />

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
          {isFinished && showFeedback
            ? `النتيجة`
            : `السؤال ${answeredCount + 1} من ${totalCount}`}
        </span>
        {!isFinished && (
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              fontWeight: timeLeft <= 10 ? 700 : 400,
              color: timeLeft <= 10
                ? 'var(--accent-error)'
                : 'var(--text-tertiary)',
              transition: 'color 0.3s ease',
            }}
          >
            {timeLeft} ثانية
          </span>
        )}
      </div>

      {/* Barre de progression */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'var(--surface-card)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'var(--accent-primary)',
            borderRadius: '999px',
            transition: 'width 0.3s ease',
            width: `${(answeredCount / Math.max(totalCount, 1)) * 100}%`,
            marginRight: 'auto',
          }}
        />
      </div>

      {/* Question — affichée sauf si fini ET feedback visible (on montre le résumé) */}
      {!isFinished && displayQuestion && (
        <div
          className="card"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {displayQuestion.text}
          </h2>

          {/* Choix */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayChoices?.map((choice, index) => (
              <ChoiceButton
                key={index}
                choice={choice}
                selectedChoice={selectedChoice}
                showFeedback={showFeedback}
                lastCorrect={lastCorrect}
                correctAnswer={displayQuestion.correctAnswer}
                onClick={handleChoiceClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Feedback — visible après chaque réponse */}
      <FeedbackPanel
        showFeedback={showFeedback}
        lastCorrect={lastCorrect}
        timeLeft={timeLeft}
        displayQuestion={displayQuestion}
        isFinished={isFinished}
        saveAndFinish={saveAndFinish}
      />
    </div>
  );
}
