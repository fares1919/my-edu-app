import { create } from 'zustand';
import type { Quiz } from '../types/quiz';
import type { Question } from '../types/question';
import { getActiveQuizzesByLevelSubject } from '../services/db/repositories/quizzes.repo';
import { getQuestionsByQuizIdOrdered, getQuestionCount } from '../services/db/repositories/questions.repo';
import { getSubjectsByLevel } from '../services/db/repositories/subjects.repo';
import type { SubjectEntity } from '../services/db/schema';
import { getCloudQuizzesByLevelSubject, getCloudSubjectsByLevel, getCloudQuestionsByQuizId } from '../services/supabase/sync';

interface QuizzesState {
  quizzes: Quiz[];
  questions: Question[];
  currentQuiz: Quiz | null;
  subjects: SubjectEntity[];
  cloudMode: boolean;
  isLoading: boolean;
  loadSubjects: (level: string) => Promise<void>;
  loadQuizzes: (level: string, subject: string) => Promise<void>;
  loadQuestions: (quizId: string) => Promise<void>;
  getQuestionCount: (quizId: string) => Promise<number>;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  setCloudMode: (v: boolean) => void;
}

export const useQuizzesStore = create<QuizzesState>((set) => ({
  quizzes: [],
  questions: [],
  currentQuiz: null,
  subjects: [],
  cloudMode: true, // essayer le cloud en priorité
  isLoading: false,

  loadSubjects: async (level: string) => {
    set({ isLoading: true });
    try {
      // Cloud first
      if (true) {
        const cloudSubjects = await getCloudSubjectsByLevel(level);
        if (cloudSubjects.length > 0) {
          const entities: SubjectEntity[] = cloudSubjects.map((name, i) => ({
            id: `cloud-${name}`,
            name,
            level,
            isEnabled: true,
            order: i,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          set({ subjects: entities, isLoading: false });
          return;
        }
      }

      // Fallback IndexedDB
      const subjects = await getSubjectsByLevel(level);
      const seen = new Set<string>();
      const unique = subjects.filter(s => {
        const key = s.name.trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      set({ subjects: unique.filter(s => s.isEnabled).sort((a, b) => a.order - b.order), isLoading: false });
    } catch (err) {
      console.error('Failed to load subjects:', err);
      set({ isLoading: false });
    }
  },

  loadQuizzes: async (level: string, subject: string) => {
    set({ isLoading: true });
    try {
      // Cloud first
      const cloudQuizzes = await getCloudQuizzesByLevelSubject(level, subject);
      if (cloudQuizzes.length > 0) {
        set({ quizzes: cloudQuizzes, isLoading: false });
        return;
      }

      // Fallback IndexedDB
      const quizzes = await getActiveQuizzesByLevelSubject(level, subject);
      set({ quizzes, isLoading: false });
    } catch (err) {
      console.error('Failed to load quizzes:', err);
      set({ isLoading: false });
    }
  },

  loadQuestions: async (quizId: string) => {
    set({ isLoading: true });
    try {
      // Cloud first
      const cloudQuestions = await getCloudQuestionsByQuizId(quizId);
      if (cloudQuestions.length > 0) {
        set({ questions: cloudQuestions, isLoading: false });
        return;
      }

      // Fallback IndexedDB
      const questions = await getQuestionsByQuizIdOrdered(quizId);
      set({ questions, isLoading: false });
    } catch (err) {
      console.error('Failed to load questions:', err);
      set({ isLoading: false });
    }
  },

  getQuestionCount: async (quizId: string) => {
    const cloudQuestions = await getCloudQuestionsByQuizId(quizId);
    if (cloudQuestions.length > 0) return cloudQuestions.length;
    return getQuestionCount(quizId);
  },

  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setCloudMode: (v) => set({ cloudMode: v }),
}));
