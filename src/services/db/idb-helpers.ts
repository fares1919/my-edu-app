import type { IDBPDatabase } from 'idb';
import type { DbSchema } from './schema';

type TableName = 'profiles' | 'subjects' | 'quizzes' | 'questions' | 'sessions' | 'answers' | 'settings' | 'exports';

export async function getAll<T>(db: IDBPDatabase<DbSchema>, store: TableName): Promise<T[]> {
  return (db as unknown as Record<string, (store: string) => Promise<T[]>>).getAll(store);
}

export async function getByKey<T>(db: IDBPDatabase<DbSchema>, store: TableName, key: string): Promise<T | undefined> {
  return (db as unknown as Record<string, (store: string, key: string) => Promise<T | undefined>>).get(store, key);
}

export async function addItem<T>(db: IDBPDatabase<DbSchema>, store: TableName, value: T): Promise<void> {
  await (db as unknown as Record<string, (store: string, val: T) => Promise<void>>).add(store, value);
}

export async function putItem<T>(db: IDBPDatabase<DbSchema>, store: TableName, value: T): Promise<void> {
  await (db as unknown as Record<string, (store: string, val: T) => Promise<void>>).put(store, value);
}

export async function deleteItem(db: IDBPDatabase<DbSchema>, store: TableName, key: string): Promise<void> {
  await (db as unknown as Record<string, (store: string, key: string) => Promise<void>>).delete(store, key);
}

export async function getAllFromIndex<T>(
  db: IDBPDatabase<DbSchema>,
  store: TableName,
  indexName: string,
  value: unknown
): Promise<T[]> {
  return (db as unknown as Record<string, (store: string, idx: string, val: unknown) => Promise<T[]>>).getAllFromIndex(store, indexName, value);
}

export async function getCountFromIndex(
  db: IDBPDatabase<DbSchema>,
  store: TableName,
  indexName: string,
  value: unknown
): Promise<number> {
  return (db as unknown as Record<string, (store: string, idx: string, val: unknown) => Promise<number>>).countFromIndex(store, indexName, value);
}

export async function clearStore(db: IDBPDatabase<DbSchema>, store: TableName): Promise<void> {
  await (db as unknown as Record<string, (store: string) => Promise<void>>).clear(store);
}
