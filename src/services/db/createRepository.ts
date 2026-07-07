import type { IDBPDatabase } from 'idb';
import type { DbSchema } from './schema';
import { getDb } from './db';

export interface Repository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(value: T): Promise<void>;
  update(value: T): Promise<void>;
  remove(id: string): Promise<void>;
}

type TableName = 'profiles' | 'subjects' | 'quizzes' | 'questions' | 'sessions' | 'answers' | 'settings' | 'exports';

export function createRepository<T extends { id: string }>(
  storeName: TableName
): Repository<T> {
  return {
    async getAll(): Promise<T[]> {
      const db: IDBPDatabase<DbSchema> = await getDb();
      return (db as unknown as Record<string, (store: string) => Promise<T[]>>).getAll(storeName);
    },

    async getById(id: string): Promise<T | undefined> {
      const db: IDBPDatabase<DbSchema> = await getDb();
      return (db as unknown as Record<string, (store: string, key: string) => Promise<T | undefined>>).get(storeName, id);
    },

    async create(value: T): Promise<void> {
      const db: IDBPDatabase<DbSchema> = await getDb();
      await (db as unknown as Record<string, (store: string, val: T) => Promise<void>>).add(storeName, value);
    },

    async update(value: T): Promise<void> {
      const db: IDBPDatabase<DbSchema> = await getDb();
      await (db as unknown as Record<string, (store: string, val: T) => Promise<void>>).put(storeName, value);
    },

    async remove(id: string): Promise<void> {
      const db: IDBPDatabase<DbSchema> = await getDb();
      await (db as unknown as Record<string, (store: string, key: string) => Promise<void>>).delete(storeName, id);
    },
  };
}
