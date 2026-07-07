import type { Subject } from './subject';
import type { QuizSession } from './session';

export type { Medal } from './subject';

export interface SubjectStat {
  subject: Subject;
  averageScore: number;
  sessionCount: number;
}

export interface ProfileStatsSummary {
  profileId: string;
  globalAverage: number;
  totalSessions: number;
  bySubject: SubjectStat[];
}

export type MedalThreshold = {
  medal: string;
  minAverage: number;
  label: string;
};
