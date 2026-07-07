import type { Level, Subject, Cycle } from '../types/subject';
import { LEVELS } from '../constants/levels';
import { ALL_SUBJECTS, SUBJECTS_BY_CYCLE } from '../constants/subjects';
import { CYCLE_BY_LEVEL } from '../constants/levels';

export function isValidLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}

export function isValidSubject(value: string): value is Subject {
  return (ALL_SUBJECTS as readonly string[]).includes(value);
}

export function isSubjectForLevel(subject: Subject, level: Level): boolean {
  const cycle = CYCLE_BY_LEVEL[level];
  return SUBJECTS_BY_CYCLE[cycle].includes(subject);
}

export function isValidScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

export function isValidDuration(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
