import { useEffect, useRef, useState, useCallback } from 'react';
import { getEffectiveDuration } from '../services/quiz/quiz.timer';
import type { QuizEngineState } from '../services/quiz/quiz.engine';
import type { Question } from '../types/question';
import type { Quiz } from '../types/quiz';

export interface UseQuizTimerOptions {
  isRunning: boolean;
  engine: QuizEngineState | null;
  quiz: Quiz | null;
  showAbandonConfirm: boolean;
  getCurrentQuestion: () => Question | null;
  onTimeout: (timeSpent: number) => void;
  onQuestionChange: () => void;
}

export function useQuizTimer({
  isRunning,
  engine,
  quiz,
  showAbandonConfirm,
  getCurrentQuestion,
  onTimeout,
  onQuestionChange,
}: UseQuizTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentAnswerTime, setCurrentAnswerTime] = useState(0);
  const timerRef = useRef<number | null>(null);
  const questionStartRef = useRef<number>(Date.now());

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getTimeSpent = useCallback(() => {
    return Math.round((Date.now() - questionStartRef.current) / 1000);
  }, []);

  useEffect(() => {
    if (!isRunning || !engine || !quiz || showAbandonConfirm) return;

    const question = getCurrentQuestion();
    if (!question) return;

    const duration = getEffectiveDuration(question.duration, quiz.defaultDuration);
    setTimeLeft(duration);
    setCurrentAnswerTime(0);
    onQuestionChange();
    questionStartRef.current = Date.now();

    stopTimer();

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current !== null) clearInterval(timerRef.current);
          const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);
          onTimeout(timeSpent);
          return 0;
        }
        return prev - 1;
      });
      setCurrentAnswerTime((prev) => prev + 1);
    }, 1000);

    return () => {
      stopTimer();
    };
  }, [engine?.currentQuestionIndex, isRunning, showAbandonConfirm]);

  return { timeLeft, currentAnswerTime, stopTimer, getTimeSpent };
}
