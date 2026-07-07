import type { Profile } from '../../../types/profile';
import { getDb } from '../db';
import { createRepository } from '../createRepository';

export const profileRepo = createRepository<Profile>('profiles');

export async function getActiveProfile(): Promise<Profile | undefined> {
  const db = await getDb();
  const allProfiles = await (db as any).getAll('profiles');
  return allProfiles.find((p: Profile) => p.isActive === true);
}

export async function setActiveProfile(profileId: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('profiles', 'readwrite');
  const allProfiles = await tx.store.getAll();
  for (const p of allProfiles) {
    if (p.id === profileId && !p.isActive) {
      await tx.store.put({ ...p, isActive: true, updatedAt: new Date().toISOString() });
    } else if (p.isActive && p.id !== profileId) {
      await tx.store.put({ ...p, isActive: false, updatedAt: new Date().toISOString() });
    }
  }
  await tx.done;
}

export async function deactivateAllProfiles(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('profiles', 'readwrite');
  const allProfiles = await tx.store.getAll();
  for (const p of allProfiles) {
    if (p.isActive) {
      await tx.store.put({ ...p, isActive: false, updatedAt: new Date().toISOString() });
    }
  }
  await tx.done;
}
