import type { AppSetting } from '../schema';
import { getDb } from '../db';

export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDb();
  const setting = await db.get('settings', key);
  return setting?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.put('settings', { key, value });
}

export async function getMultipleSettings(keys: string[]): Promise<Record<string, string | undefined>> {
  const result: Record<string, string | undefined> = {};
  const db = await getDb();
  for (const key of keys) {
    const setting = await db.get('settings', key);
    result[key] = setting?.value;
  }
  return result;
}
