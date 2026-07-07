import type { CsvQuestionRow } from '../../types/csv';
import { detectSeparator } from './detectSeparator';
import { normalizeText } from '../../utils/normalize';

const EXPECTED_HEADERS = [
  'المستوى',
  'المادة',
  'السؤال',
  'اختيار1',
  'اختيار2',
  'اختيار3',
  'اختيار4',
  'الإجابة',
  'شرح',
  'صورة',
  'المدة',
];

export interface ParseResult {
  rows: CsvQuestionRow[];
  errors: { rowIndex: number; column?: string; message: string }[];
  separator: string | null;
  encodingError?: string;
}

export function parseCsvContent(content: string): ParseResult {
  const errors: ParseResult['errors'] = [];
  // Nettoyer le BOM (\uFEFF) qui peut être présent dans les fichiers Excel
  const cleanContent = content.replace(/^\uFEFF/, '');
  const lines = cleanContent.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: [{ rowIndex: 0, message: 'الملف فارغ' }], separator: null };
  }

  const separator = detectSeparator(lines[0]);
  if (!separator) {
    return { rows: [], errors: [{ rowIndex: 0, message: 'لم يتم التعرف على الفاصل في الملف. استخدم الفاصلة المنقوطة (;) أو الفاصلة (,)' }], separator: null };
  }

  // Valider l'en-tête — si la première ligne n'est pas un en-tête, l'ignorer et ajouter les en-têtes par défaut
  const headers = lines[0].split(separator).map(h => h.trim());
  const headerErrors = validateHeaders(headers);
  // validateHeaders ajoute un message général en index 0, puis les 8 erreurs colonne par colonne
  const isMissingHeader = headerErrors.length >= 9 &&
    headerErrors[0].startsWith('رأس الملف غير صحيح') &&
    headerErrors.slice(1).every((err, i) =>
      err.includes(`العمود ${i + 1} يجب أن يكون "${EXPECTED_HEADERS[i]}"`)
    );

  if (isMissingHeader) {
    // Pas d'en-tête — toutes les lignes sont des données
    return parseRows(EXPECTED_HEADERS, lines, separator);
  }

  if (headerErrors.length > 0) {
    return { rows: [], errors: headerErrors.map(msg => ({ rowIndex: 1, message: msg })), separator };
  }

  return parseRows(EXPECTED_HEADERS, lines.slice(1), separator);
}

function parseRows(_headers: string[], dataLines: string[], separator: string): ParseResult {
  const errors: ParseResult['errors'] = [];
  const rows: CsvQuestionRow[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const values = dataLines[i].split(separator).map(v => v.trim());
    if (values.length < 8) {
      errors.push({ rowIndex: i + 2, message: `عدد الأعمدة غير كافٍ. يوجد ${values.length} عمود بدلاً من 8 على الأقل` });
      continue;
    }

    const row: CsvQuestionRow = {
      المستوى: values[0],
      المادة: values[1],
      السؤال: values[2],
      اختيار1: values[3],
      اختيار2: values[4],
      اختيار3: values[5],
      اختيار4: values[6],
      الإجابة: normalizeText(values[7]),
      شرح: values[8]?.trim() || undefined,
      صورة: values[9]?.trim() || undefined,
      المدة: values[10]?.trim() || undefined,
    };

    rows.push(row);
  }

  return { rows, errors, separator };
}

function validateHeaders(headers: string[]): string[] {
  const errors: string[] = [];
  const requiredHeaders = EXPECTED_HEADERS.slice(0, 8);

  for (let i = 0; i < requiredHeaders.length; i++) {
    if (headers[i] !== requiredHeaders[i]) {
      errors.push(`العمود ${i + 1} يجب أن يكون "${requiredHeaders[i]}" ولكن وجد "${headers[i] || 'فارغ'}"`);
    }
  }

  if (errors.length > 0) errors.unshift('رأس الملف غير صحيح. يجب أن تكون الأعمدة بالترتيب: ' + EXPECTED_HEADERS.join(' - '));
  return errors;
}
