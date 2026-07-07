import type { Level, Subject } from './subject';

export interface QuizSession {
  id: string;
  profileId: string;
  quizId: string;
  level: Level;
  subject: Subject;
  startedAt: string;
  finishedAt?: string; // renseigné à la finalisation
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number; // 0-100
  totalDuration: number; // secondes
  averageTimePerQuestion: number; // secondes
}

export interface SessionAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedAnswer?: string; // optionnel si temps écoulé
  isCorrect: boolean; // calculé à l'enregistrement
  answeredAt: string;
  timeSpent: number; // secondes
}
