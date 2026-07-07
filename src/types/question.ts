import type { Level, Subject, QuestionDuration } from './subject';

export interface Question {
  id: string;
  quizId: string;
  level: Level;
  subject: Subject;
  text: string; // non vide
  choices: [string, string, string, string]; // 4 propositions
  correctAnswer: string; // doit être === à l'un des éléments de choices
  explanation?: string;
  image?: string;
  duration?: QuestionDuration;
  order: number;
}
