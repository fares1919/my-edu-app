import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, type DbSchema } from './schema';

let dbInstance: IDBPDatabase<DbSchema> | null = null;

export async function getDb(): Promise<IDBPDatabase<DbSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await (openDB as unknown as (name: string, version: number, opts: unknown) => Promise<IDBPDatabase<DbSchema>>)(
    DB_NAME, DB_VERSION, {
    upgrade(db: IDBPDatabase<DbSchema>, _oldVersion: number) {
      // profiles
      if (!db.objectStoreNames.contains('profiles')) {
        const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
        profileStore.createIndex('by_isActive', 'isActive');
        profileStore.createIndex('by_level', 'level');
        profileStore.createIndex('by_createdAt', 'createdAt');
      }

      // subjects
      if (!db.objectStoreNames.contains('subjects')) {
        const subjectStore = db.createObjectStore('subjects', { keyPath: 'id' });
        subjectStore.createIndex('by_level', 'level');
        subjectStore.createIndex('by_isEnabled', 'isEnabled');
        subjectStore.createIndex('by_level_order', ['level', 'order']);
      }

      // quizzes
      if (!db.objectStoreNames.contains('quizzes')) {
        const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
        quizStore.createIndex('by_level', 'level');
        quizStore.createIndex('by_subject', 'subject');
        quizStore.createIndex('by_status', 'status');
        quizStore.createIndex('by_level_subject', ['level', 'subject']);
        quizStore.createIndex('by_createdAt', 'createdAt');
      }

      // questions
      if (!db.objectStoreNames.contains('questions')) {
        const questionStore = db.createObjectStore('questions', { keyPath: 'id' });
        questionStore.createIndex('by_quizId', 'quizId');
        questionStore.createIndex('by_level', 'level');
        questionStore.createIndex('by_subject', 'subject');
        questionStore.createIndex('by_quizId_order', ['quizId', 'order']);
        questionStore.createIndex('by_level_subject', ['level', 'subject']);
      }

      // sessions
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by_profileId', 'profileId');
        sessionStore.createIndex('by_quizId', 'quizId');
        sessionStore.createIndex('by_level', 'level');
        sessionStore.createIndex('by_subject', 'subject');
        sessionStore.createIndex('by_startedAt', 'startedAt');
        sessionStore.createIndex('by_profileId_startedAt', ['profileId', 'startedAt']);
        sessionStore.createIndex('by_profileId_subject', ['profileId', 'subject']);
      }

      // answers
      if (!db.objectStoreNames.contains('answers')) {
        const answerStore = db.createObjectStore('answers', { keyPath: 'id' });
        answerStore.createIndex('by_sessionId', 'sessionId');
        answerStore.createIndex('by_questionId', 'questionId');
        answerStore.createIndex('by_sessionId_questionId', ['sessionId', 'questionId']);
      }

      // settings
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // exports
      if (!db.objectStoreNames.contains('exports')) {
        const exportStore = db.createObjectStore('exports', { keyPath: 'id' });
        exportStore.createIndex('by_profileId', 'profileId');
        exportStore.createIndex('by_generatedAt', 'generatedAt');
        exportStore.createIndex('by_profileId_generatedAt', ['profileId', 'generatedAt']);
      }
    },
  });

  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
