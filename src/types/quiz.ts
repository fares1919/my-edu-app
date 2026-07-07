import type { Level, Subject, QuizStatus, QuestionDuration } from './subject';

export interface Quiz {
  id: string;
  title: string;
  level: Level;
  subject: Subject;
  questionCount: number;
  defaultDuration: QuestionDuration;
  sourceFileName?: string;
  status: QuizStatus;
  createdAt: string;
  updatedAt: string;
}
