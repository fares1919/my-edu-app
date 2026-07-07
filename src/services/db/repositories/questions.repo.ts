import type { Question } from '../../../types/question';
import { getDb } from '../db';
import { createRepository } from '../createRepository';

export const questionRepo = createRepository<Question>('questions');

export async function getQuestionsByQuizId(quizId: string): Promise<Question[]> {
  const db = await getDb();
  return db.getAllFromIndex('questions', 'by_quizId', quizId);
}

export async function getQuestionsByQuizIdOrdered(quizId: string): Promise<Question[]> {
  const db = await getDb();
  return db.getAllFromIndex('questions', 'by_quizId_order', [quizId, 0]);
}

export async function getQuestionCount(quizId: string): Promise<number> {
  const db = await getDb();
  return db.countFromIndex('questions', 'by_quizId', quizId);
}
