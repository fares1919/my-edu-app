import type { Level, Subject } from './subject';

export interface ExportRow {
  profileName: string;
  level: Level;
  subject: Subject;
  quizTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  totalDuration: number;
  averageTimePerQuestion: number;
}

export interface ExportFilters {
  profileId: string;
  subject?: Subject;
  from?: string;
  to?: string;
}

export interface ExportLog {
  id: string;
  profileId: string;
  filters: ExportFilters;
  recordCount: number;
  generatedAt: string;
  fileName: string;
}
