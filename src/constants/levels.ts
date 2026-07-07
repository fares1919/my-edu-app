import type { Level, Cycle } from '../types/subject';

export const LEVELS: Level[] = [
  '1_ابتدائي',
  '2_ابتدائي',
  '3_ابتدائي',
  '4_ابتدائي',
  '5_ابتدائي',
  '1_متوسط',
  '2_متوسط',
  '3_متوسط',
  '4_متوسط',
];

export const CYCLE_BY_LEVEL: Record<Level, Cycle> = {
  '1_ابتدائي': 'primaire',
  '2_ابتدائي': 'primaire',
  '3_ابتدائي': 'primaire',
  '4_ابتدائي': 'primaire',
  '5_ابتدائي': 'primaire',
  '1_متوسط': 'moyen',
  '2_متوسط': 'moyen',
  '3_متوسط': 'moyen',
  '4_متوسط': 'moyen',
};

export const LEVEL_LABELS: Record<Level, string> = {
  '1_ابتدائي': 'السنة الأولى ابتدائي',
  '2_ابتدائي': 'السنة الثانية ابتدائي',
  '3_ابتدائي': 'السنة الثالثة ابتدائي',
  '4_ابتدائي': 'السنة الرابعة ابتدائي',
  '5_ابتدائي': 'السنة الخامسة ابتدائي',
  '1_متوسط': 'السنة الأولى متوسط',
  '2_متوسط': 'السنة الثانية متوسط',
  '3_متوسط': 'السنة الثالثة متوسط',
  '4_متوسط': 'السنة الرابعة متوسط',
};

export function getCycle(level: Level): Cycle {
  return CYCLE_BY_LEVEL[level];
}
