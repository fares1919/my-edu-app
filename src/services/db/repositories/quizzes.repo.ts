import type { Quiz } from '../../../types/quiz';
import { getDb } from '../db';
import { createRepository } from '../createRepository';

export const quizRepo = createRepository<Quiz>('quizzes');

export async function getQuizzesByLevel(level: string): Promise<Quiz[]> {
  const db = await getDb();
  return db.getAllFromIndex('quizzes', 'by_level', level);
}

export async function getQuizzesByLevelSubject(level: string, subject: string): Promise<Quiz[]> {
  const db = await getDb();
  return db.getAllFromIndex('quizzes', 'by_level_subject', [level, subject]);
}

export async function getActiveQuizzesByLevelSubject(level: string, subject: string): Promise<Quiz[]> {
  const quizzes = await getQuizzesByLevelSubject(level, subject);
  return quizzes.filter(q => q.status === 'active');
}
