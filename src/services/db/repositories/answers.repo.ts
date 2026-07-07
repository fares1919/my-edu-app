import type { SessionAnswer } from '../../../types/session';
import { getDb } from '../db';
import { createRepository } from '../createRepository';

export const answerRepo = createRepository<SessionAnswer>('answers');

export async function getAnswersBySessionId(sessionId: string): Promise<SessionAnswer[]> {
  const db = await getDb();
  return db.getAllFromIndex('answers', 'by_sessionId', sessionId);
}
