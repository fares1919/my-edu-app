import type { CsvQuestionRow, CsvValidationError, CsvPreviewRow, CsvImportResult } from '../../types/csv';
import type { Level, Subject } from '../../types/subject';
import { isValidLevel, isValidSubject, isSubjectForLevel } from '../../utils/guards';
import { isValidDuration } from '../../utils/guards';
import { normalizeText } from '../../utils/normalize';
import type { ParseResult } from './parseCsv';

// Mapping des libellés affichés → codes internes
const LEVEL_LABEL_TO_CODE: Record<string, string> = {
  'السنة الأولى ابتدائي': '1_ابتدائي',
  'السنة الثانية ابتدائي': '2_ابتدائي',
  'السنة الثالثة ابتدائي': '3_ابتدائي',
  'السنة الرابعة ابتدائي': '4_ابتدائي',
  'السنة الخامسة ابتدائي': '5_ابتدائي',
  'السنة الأولى متوسط': '1_متوسط',
  'السنة الثانية متوسط': '2_متوسط',
  'السنة الثالثة متوسط': '3_متوسط',
  'السنة الرابعة متوسط': '4_متوسط',
};

function resolveLevel(rawLevel: string): string {
  // 1. Essayer code interne exact
  if (isValidLevel(rawLevel)) return rawLevel;
  // 2. Essayer libellé exact
  const code = LEVEL_LABEL_TO_CODE[rawLevel.trim()];
  if (code) return code;
  // 3. Essayer libellé normalisé (espaces superflus, etc.)
  const normalized = rawLevel.trim().replace(/\s+/g, ' ');
  for (const [label, levelCode] of Object.entries(LEVEL_LABEL_TO_CODE)) {
    if (label.replace(/\s+/g, ' ') === normalized) return levelCode;
  }
  return rawLevel; // Retourner tel quel, isValidLevel échouera
}

// Mapping des libellés de matières → codes internes
const SUBJECT_LABEL_TO_CODE: Record<string, string> = {
  'الرياضيات': 'الرياضيات',
  'اللغة العربية': 'اللغة العربية',
  'التربية الإسلامية': 'التربية الإسلامية',
  'اللغة الفرنسية': 'اللغة الفرنسية',
  'التاريخ والجغرافيا': 'التاريخ والجغرافيا',
  'العلوم الفيزيائية': 'العلوم الفيزيائية',
  'علوم الطبيعة والحياة': 'العلوم الطبيعية',
  'العلوم الطبيعية': 'العلوم الطبيعية',
  'اللغة الإنجليزية': 'اللغة الإنجليزية',
  'التكنولوجيا': 'التكنولوجيا',
  'التربية المدنية': 'التربية المدنية',
};

function resolveSubject(rawSubject: string): string {
  if (isValidSubject(rawSubject)) return rawSubject;
  const code = SUBJECT_LABEL_TO_CODE[rawSubject.trim()];
  if (code) return code;
  return rawSubject;
}

// ── Field validators ──────────────────────────────────────────

function validateLevel(
  level: string | undefined,
  rowIndex: number,
): CsvValidationError[] {
  if (!level || !isValidLevel(level)) {
    return [{ rowIndex, column: 'المستوى', message: `المستوى "${level || '(فارغ)'}" غير معروف` }];
  }
  return [];
}

function validateSubject(
  subject: string | undefined,
  level: string | undefined,
  rowIndex: number,
): CsvValidationError[] {
  if (!subject) {
    return [{ rowIndex, column: 'المادة', message: 'حقل المادة فارغ' }];
  }
  if (!isValidSubject(subject)) {
    return [{ rowIndex, column: 'المادة', message: `المادة "${subject}" غير معروفة` }];
  }
  if (level && isValidLevel(level) && !isSubjectForLevel(subject as Subject, level as Level)) {
    return [{ rowIndex, column: 'المادة', message: `المادة "${subject}" غير متوفرة لهذا المستوى` }];
  }
  return [];
}

function validateQuestion(
  text: string | undefined,
  rowIndex: number,
): CsvValidationError[] {
  if (!text || text.trim().length === 0) {
    return [{ rowIndex, column: 'السؤال', message: 'السؤال فارغ' }];
  }
  return [];
}

function validateChoices(
  choices: (string | undefined)[],
  rowIndex: number,
): CsvValidationError[] {
  const errors: CsvValidationError[] = [];
  choices.forEach((choice, i) => {
    if (!choice || choice.trim().length === 0) {
      errors.push({ rowIndex, column: `اختيار${i + 1}`, message: `الاختيار ${i + 1} فارغ` });
    }
  });
  return errors;
}

function validateAnswer(
  answer: string | undefined,
  choices: (string | undefined)[],
  rowIndex: number,
): CsvValidationError[] {
  if (!answer || answer.trim().length === 0) {
    return [{ rowIndex, column: 'الإجابة', message: 'حقل الإجابة فارغ' }];
  }
  const nonEmptyChoices = choices.filter(c => c && c.trim().length > 0);
  if (nonEmptyChoices.length > 0 && !nonEmptyChoices.includes(normalizeText(answer))) {
    return [{ rowIndex, column: 'الإجابة', message: `الإجابة "${answer}" يجب أن تكون واحدة من الاختيارات الأربعة` }];
  }
  return [];
}

function validateDuration(
  duration: string | undefined,
  rowIndex: number,
): CsvValidationError[] {
  if (duration && duration.trim().length > 0) {
    const parsed = parseInt(duration, 10);
    if (isNaN(parsed) || !isValidDuration(parsed)) {
      return [{ rowIndex, column: 'المدة', message: `المدة "${duration}" يجب أن تكون رقماً صحيحاً موجباً` }];
    }
  }
  return [];
}

// ── Row validation ────────────────────────────────────────────

function validateRow(row: CsvQuestionRow, rowIndex: number): CsvValidationError[] {
  // Résoudre les libellés → codes internes
  const rawLevel = resolveLevel(row.المستوى);
  const rawSubject = resolveSubject(row.المادة);

  // Mettre à jour la ligne avec les codes résolus
  row.المستوى = rawLevel;
  row.المادة = rawSubject;

  const choices = [row.اختيار1, row.اختيار2, row.اختيار3, row.اختيار4];

  return [
    ...validateLevel(rawLevel, rowIndex),
    ...validateSubject(rawSubject, rawLevel, rowIndex),
    ...validateQuestion(row.السؤال, rowIndex),
    ...validateChoices(choices, rowIndex),
    ...validateAnswer(row.الإجابة, choices, rowIndex),
    ...validateDuration(row.المدة, rowIndex),
  ];
}

// ── Entry point ───────────────────────────────────────────────

export function validateCsvContent(parseResult: ParseResult): CsvImportResult {
  const preview: CsvPreviewRow[] = [];
  const allErrors: CsvValidationError[] = [...parseResult.errors.map(e => ({
    rowIndex: e.rowIndex,
    column: e.column,
    message: e.message,
  }))];

  const validRows: CsvQuestionRow[] = [];

  for (const row of parseResult.rows) {
    const rowIndex = parseResult.rows.indexOf(row) + 2; // +1 header, +1 zero-index
    const errors = validateRow(row, rowIndex);
    
    preview.push({
      rowIndex,
      values: row as unknown as Record<string, string>,
      isValid: errors.length === 0,
      errors,
    });

    allErrors.push(...errors);
    if (errors.length === 0) {
      validRows.push(row);
    }
  }

  return {
    rows: validRows,
    preview,
    errors: allErrors,
  };
}
