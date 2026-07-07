import type { ExportLog } from '../../../types/export';
import { createRepository } from '../createRepository';
import { getDb } from '../db';

export const exportRepo = createRepository<ExportLog>('exports');

export async function getExportsByProfileId(profileId: string): Promise<ExportLog[]> {
  const db = await getDb();
  return db.getAllFromIndex('exports', 'by_profileId', profileId);
}
