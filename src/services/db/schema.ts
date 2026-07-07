import type { Profile } from '../../types/profile';
import type { Quiz } from '../../types/quiz';
import type { Question } from '../../types/question';
import type { QuizSession, SessionAnswer } from '../../types/session';
import type { ExportLog } from '../../types/export';

export const DB_NAME = 'edu_qcm_app';
export const DB_VERSION = 1;

export interface SubjectEntity {
  id: string;
  level: string;
  name: string;
  order: number;
  isEnabled: boolean;
}

export interface AppSetting {
  key: string;
  value: string;
}

export interface DbSchema {
  profiles: {
    key: string;
    value: Profile;
    indexes: {
      by_isActive: boolean;
      by_level: string;
      by_createdAt: string;
    };
  };
  subjects: {
    key: string;
    value: SubjectEntity;
    indexes: {
      by_level: string;
      by_isEnabled: boolean;
      by_level_order: [string, number];
    };
  };
  quizzes: {
    key: string;
    value: Quiz;
    indexes: {
      by_level: string;
      by_subject: string;
      by_status: string;
      by_level_subject: [string, string];
      by_createdAt: string;
    };
  };
  questions: {
    key: string;
    value: Question;
    indexes: {
      by_quizId: string;
      by_level: string;
      by_subject: string;
      by_quizId_order: [string, number];
      by_level_subject: [string, string];
    };
  };
  sessions: {
    key: string;
    value: QuizSession;
    indexes: {
      by_profileId: string;
      by_quizId: string;
      by_level: string;
      by_subject: string;
      by_startedAt: string;
      by_profileId_startedAt: [string, string];
      by_profileId_subject: [string, string];
    };
  };
  answers: {
    key: string;
    value: SessionAnswer;
    indexes: {
      by_sessionId: string;
      by_questionId: string;
      by_sessionId_questionId: [string, string];
    };
  };
  settings: {
    key: string;
    value: AppSetting;
  };
  exports: {
    key: string;
    value: ExportLog;
    indexes: {
      by_profileId: string;
      by_generatedAt: string;
      by_profileId_generatedAt: [string, string];
    };
  };
}

export type StoreNames = keyof DbSchema;
