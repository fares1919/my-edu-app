import { create } from 'zustand';
import type { QuizSession, SessionAnswer } from '../types/session';
import type { Question } from '../types/question';
import type { Quiz } from '../types/quiz';
import { getDb } from '../services/db/db';
import { createQuizEngine, answerQuestion, getCurrentQuestion, getCurrentShuffledChoices, type QuizEngineState } from '../services/quiz/quiz.engine';
import { syncSessionToCloud } from '../services/supabase/sync';
import type { ShuffledChoice } from '../services/quiz/quiz.shuffle';

interface SessionState {
  engine: QuizEngineState | null;
  isRunning: boolean;
  startQuiz: (quiz: Quiz, questions: Question[], profileId: string) => void;
  submitAnswer: (selectedAnswer: string | undefined, timeSpent: number) => void;
  getCurrentQuestion: () => Question | null;
  getCurrentChoices: () => ShuffledChoice[] | null;
  finishAndSave: () => Promise<QuizSession | null>;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  engine: null,
  isRunning: false,

  startQuiz: (quiz, questions, profileId) => {
    const engine = createQuizEngine(quiz, questions, profileId);
    set({ engine, isRunning: true });
  },

  submitAnswer: (selectedAnswer, timeSpent) => {
    const { engine } = get();
    if (!engine) return;
    const newEngine = answerQuestion(engine, selectedAnswer, timeSpent);
    set({ engine: newEngine, isRunning: !newEngine.isFinished });
  },

  getCurrentQuestion: () => {
    const { engine } = get();
    if (!engine) return null;
    return getCurrentQuestion(engine);
  },

  getCurrentChoices: () => {
    const { engine } = get();
    if (!engine) return null;
    return getCurrentShuffledChoices(engine);
  },

  finishAndSave: async () => {
    const { engine } = get();
    if (!engine) return null;

    const db = await getDb();
    const tx = db.transaction(['sessions', 'answers'], 'readwrite');
    
    await tx.objectStore('sessions').add(engine.session);
    for (const answer of engine.answers) {
      await tx.objectStore('answers').add(answer);
    }
    await tx.done;

    // Sync to Supabase cloud (fire & forget)
    syncSessionToCloud(engine.session, engine.answers);

    return engine.session;
  },

  reset: () => set({ engine: null, isRunning: false }),
}));
