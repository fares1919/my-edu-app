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

function validateRow(row: CsvQuestionRow, rowIndex: number): CsvValidationError[] {
  const errors: CsvValidationError[] = [];

  // Résoudre les libellés → codes internes
  const rawLevel = resolveLevel(row.المستوى);
  const rawSubject = resolveSubject(row.المادة);

  // Mettre à jour la ligne avec les codes résolus
  row.المستوى = rawLevel;
  row.المادة = rawSubject;

  // المستوى
  if (!row.المستوى || !isValidLevel(row.المستوى)) {
    errors.push({ rowIndex, column: 'المستوى', message: `المستوى "${row.المستوى || '(فارغ)'}" غير معروف` });
  }

  // المادة
  if (!row.المادة) {
    errors.push({ rowIndex, column: 'المادة', message: 'حقل المادة فارغ' });
  } else if (!isValidSubject(row.المادة)) {
    errors.push({ rowIndex, column: 'المادة', message: `المادة "${row.المادة}" غير معروفة` });
  } else if (row.المستوى && isValidLevel(row.المستوى) && !isSubjectForLevel(row.المادة as Subject, row.المستوى as Level)) {
    errors.push({ rowIndex, column: 'المادة', message: `المادة "${row.المادة}" غير متوفرة لهذا المستوى` });
  }

  // السؤال
  if (!row.السؤال || row.السؤال.trim().length === 0) {
    errors.push({ rowIndex, column: 'السؤال', message: 'السؤال فارغ' });
  }

  // اختيار1-4
  const choices = [row.اختيار1, row.اختيار2, row.اختيار3, row.اختيار4];
  choices.forEach((choice, i) => {
    if (!choice || choice.trim().length === 0) {
      errors.push({ rowIndex, column: `اختيار${i + 1}`, message: `الاختيار ${i + 1} فارغ` });
    }
  });

  // الإجابة
  const nonEmptyChoices = choices.filter(c => c && c.trim().length > 0);
  if (!row.الإجابة || row.الإجابة.trim().length === 0) {
    errors.push({ rowIndex, column: 'الإجابة', message: 'حقل الإجابة فارغ' });
  } else if (nonEmptyChoices.length > 0 && !nonEmptyChoices.includes(normalizeText(row.الإجابة))) {
    errors.push({ rowIndex, column: 'الإجابة', message: `الإجابة "${row.الإجابة}" يجب أن تكون واحدة من الاختيارات الأربعة` });
  }

  // المدة
  if (row.المدة && row.المدة.trim().length > 0) {
    const duration = parseInt(row.المدة, 10);
    if (isNaN(duration) || !isValidDuration(duration)) {
      errors.push({ rowIndex, column: 'المدة', message: `المدة "${row.المدة}" يجب أن تكون رقماً صحيحاً موجباً` });
    }
  }

  return errors;
}
