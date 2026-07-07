import type { CsvQuestionRow } from '../../types/csv';
import { normalizeText } from '../../utils/normalize';
import { detectSeparator } from './detectSeparator';
import { parseCsvContent } from './parseCsv';

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

/**
 * Detect if content looks like CSV (has semicolons or commas with CSV-like headers).
 */
function looksLikeCsv(content: string): boolean {
  const clean = content.replace(/^\uFEFF/, '');
  const firstLine = clean.split(/[\r\n]+/).find(l => l.trim().length > 0);
  if (!firstLine) return false;

  const separator = detectSeparator(firstLine);
  if (!separator) return false;

  // Check if first line contains expected CSV headers
  const headers = firstLine.split(separator).map(h => h.trim());
  const csvKeywords = ['المستوى', 'المادة', 'السؤال', 'اختيار'];
  return csvKeywords.some(keyword => headers.some(h => h.includes(keyword)));
}

interface BlockMetadata {
  المستوى?: string;
  المادة?: string;
}

/**
 * Parse a single question block into a CsvQuestionRow.
 */
function parseBlock(
  lines: string[],
  inheritedMeta: BlockMetadata,
  blockIndex: number,
): { row: CsvQuestionRow; errors: { rowIndex: number; message: string }[] } {
  const errors: { rowIndex: number; message: string }[] = [];
  const meta: BlockMetadata = { ...inheritedMeta };
  let questionText = '';
  const choices: string[] = [];
  let answerRaw = '';
  let explanation = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments
    if (trimmed.startsWith('#')) continue;

    // Metadata
    if (trimmed.startsWith('المستوى:')) {
      meta.المستوى = trimmed.slice(trimmed.indexOf(':') + 1).trim();
      continue;
    }
    if (trimmed.startsWith('المادة:')) {
      meta.المادة = trimmed.slice(trimmed.indexOf(':') + 1).trim();
      continue;
    }

    // Answer line
    if (trimmed.startsWith('الإجابة:')) {
      answerRaw = trimmed.slice(trimmed.indexOf(':') + 1).trim();
      continue;
    }

    // Explanation line
    if (trimmed.startsWith('الشرح:')) {
      explanation = trimmed.slice(trimmed.indexOf(':') + 1).trim();
      continue;
    }

    // Choice lines: أ. / ب. / ج. / د.
    if (/^[أبجد]\.\s*/.test(trimmed)) {
      choices.push(trimmed.replace(/^[أبجد]\.\s*/, '').trim());
      continue;
    }

    // If none of the above and no question set yet, this is the question text
    if (!questionText) {
      questionText = trimmed;
    }
  }

  // --- Validation ---
  if (!questionText) {
    errors.push({
      rowIndex: blockIndex + 1,
      message: 'لا يوجد نص سؤال في هذه المجموعة',
    });
  }

  if (choices.length < 4) {
    errors.push({
      rowIndex: blockIndex + 1,
      message: `يجب أن يحتوي السؤال على 4 اختيارات، ولكن وجد ${choices.length}`,
    });
  }

  // Pad choices to 4 if fewer (so row can still be constructed)
  while (choices.length < 4) {
    choices.push('');
  }

  // Map answer text to the choice index
  let answerIndex = -1;
  if (answerRaw) {
    const normalizedAnswer = normalizeText(answerRaw);
    for (let i = 0; i < 4; i++) {
      if (normalizeText(choices[i]) === normalizedAnswer) {
        answerIndex = i;
        break;
      }
    }
    if (answerIndex === -1) {
      // Try partial match as fallback
      for (let i = 0; i < 4; i++) {
        if (choices[i].includes(answerRaw) || answerRaw.includes(choices[i])) {
          answerIndex = i;
          break;
        }
      }
    }
    if (answerIndex === -1) {
      errors.push({
        rowIndex: blockIndex + 1,
        message: `الإجابة "${answerRaw}" لا تطابق أي خيار من الاختيارات`,
      });
    }
  }

  const row: CsvQuestionRow = {
    المستوى: meta.المستوى || '',
    المادة: meta.المادة || '',
    السؤال: questionText,
    اختيار1: choices[0],
    اختيار2: choices[1],
    اختيار3: choices[2],
    اختيار4: choices[3],
    الإجابة: answerIndex >= 0 ? choices[answerIndex] : answerRaw,
    شرح: explanation || undefined,
    صورة: undefined,
    المدة: undefined,
  };

  return { row, errors };
}

export function parseTxtContent(content: string): ParseResult {
  const errors: ParseResult['errors'] = [];
  const cleanContent = content.replace(/^\uFEFF/, '');

  // Auto-detect CSV — if it looks like CSV, delegate to parseCsvContent
  if (looksLikeCsv(cleanContent)) {
    return parseCsvContent(content);
  }

  // Split into blocks by --- or double newline (two or more consecutive newlines)
  const blocks = cleanContent.split(/^-{3,}$|(?:\r?\n){2,}/m).filter(b => b.trim().length > 0);

  if (blocks.length === 0) {
    return { rows: [], errors: [{ rowIndex: 0, message: 'الملف فارغ' }], separator: null };
  }

  const rows: CsvQuestionRow[] = [];
  const inheritedMeta: BlockMetadata = {};

  for (let i = 0; i < blocks.length; i++) {
    const blockLines = blocks[i].split(/\r?\n/).filter(l => l.trim().length > 0);
    if (blockLines.length === 0) continue;

    const { row, errors: blockErrors } = parseBlock(blockLines, inheritedMeta, i);

    // Inherit metadata from this block for the next one
    if (row.المستوى) inheritedMeta.المستوى = row.المستوى;
    if (row.المادة) inheritedMeta.المادة = row.المادة;

    rows.push(row);
    errors.push(...blockErrors.map(e => ({ ...e, column: undefined })));
  }

  return { rows, errors, separator: null };
}
