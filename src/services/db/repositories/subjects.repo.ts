import type { SubjectEntity } from '../schema';
import { getDb } from '../db';
import { generateId } from '../../../utils/ids';
import { LEVELS } from '../../../constants/levels';
import { SUBJECTS_BY_CYCLE } from '../../../constants/subjects';
import { CYCLE_BY_LEVEL } from '../../../constants/levels';

export async function seedSubjectsIfEmpty(): Promise<void> {
  const db = await getDb();
  const count = await db.count('subjects');
  if (count > 0) return;

  const subjects: SubjectEntity[] = [];
  for (const level of LEVELS) {
    const cycle = CYCLE_BY_LEVEL[level];
    const cycleSubjects = SUBJECTS_BY_CYCLE[cycle];
    cycleSubjects.forEach((name, index) => {
      subjects.push({
        id: generateId(),
        level,
        name,
        order: index + 1,
        isEnabled: true,
      });
    });
  }

  const tx = db.transaction('subjects', 'readwrite');
  for (const s of subjects) {
    await tx.store.add(s);
  }
  await tx.done;
}

export async function getSubjectsByLevel(level: string): Promise<SubjectEntity[]> {
  const db = await getDb();
  return db.getAllFromIndex('subjects', 'by_level', level);
}

export async function getEnabledSubjectsByLevel(level: string): Promise<SubjectEntity[]> {
  const subjects = await getSubjectsByLevel(level);
  return subjects.filter(s => s.isEnabled).sort((a, b) => a.order - b.order);
}
