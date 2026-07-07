import type { QuizSession } from '../../../types/session';
import { getDb } from '../db';
import { createRepository } from '../createRepository';

export const sessionRepo = createRepository<QuizSession>('sessions');

export async function getSessionsByProfileId(profileId: string): Promise<QuizSession[]> {
  const db = await getDb();
  return db.getAllFromIndex('sessions', 'by_profileId', profileId);
}

export async function getSessionsByProfileIdChronological(profileId: string): Promise<QuizSession[]> {
  const db = await getDb();
  return db.getAllFromIndex('sessions', 'by_profileId_startedAt', [profileId, '']);
}

export async function getSessionsByProfileIdSubject(profileId: string, subject: string): Promise<QuizSession[]> {
  const db = await getDb();
  return db.getAllFromIndex('sessions', 'by_profileId_subject', [profileId, subject]);
}
