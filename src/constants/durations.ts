import type { Cycle, QuestionDuration } from '../types/subject';

export const DEFAULT_DURATIONS: Record<Cycle, QuestionDuration> = {
  primaire: 60, // 60 secondes par question
  moyen: 45,    // 45 secondes par question
};
