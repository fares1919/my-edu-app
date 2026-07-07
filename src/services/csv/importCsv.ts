import type { Question } from '../../types/question';
import type { Quiz } from '../../types/quiz';
import type { CsvQuestionRow, CsvImportResult } from '../../types/csv';
import type { Level, Subject } from '../../types/subject';
import { getDb } from '../db/db';
import { generateId } from '../../utils/ids';
import { normalizeText } from '../../utils/normalize';
import { isValidDuration } from '../../utils/guards';
import { DEFAULT_DURATIONS } from '../../constants/durations';
import { CYCLE_BY_LEVEL } from '../../constants/levels';
import { parseCsvContent } from './parseCsv';
import { validateCsvContent } from './validateCsv';

export interface GroupedQuestions {
  level: Level;
  subject: Subject;
  rows: CsvQuestionRow[];
}

export function groupByLevelSubject(validRows: CsvQuestionRow[]): GroupedQuestions[] {
  const groups = new Map<string, GroupedQuestions>();

  for (const row of validRows) {
    const key = `${row.المستوى}|${row.المادة}`;
    if (!groups.has(key)) {
      groups.set(key, {
        level: row.المستوى as Level,
        subject: row.المادة as Subject,
        rows: [],
      });
    }
    groups.get(key)!.rows.push(row);
  }

  return Array.from(groups.values());
}

export function buildQuizFromGroup(group: GroupedQuestions, sourceFileName?: string): { quiz: Quiz; questions: Question[] } {
  const now = new Date().toISOString();
  const quizId = generateId();
  const cycle = CYCLE_BY_LEVEL[group.level];
  const defaultDuration = DEFAULT_DURATIONS[cycle];

  const quiz: Quiz = {
    id: quizId,
    title: `${group.subject} - ${group.level}`,
    level: group.level,
    subject: group.subject,
    questionCount: group.rows.length,
    defaultDuration,
    sourceFileName,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const questions: Question[] = group.rows.map((row, index) => {
    const duration = row.المدة ? parseInt(row.المدة, 10) : undefined;

    return {
      id: generateId(),
      quizId,
      level: group.level,
      subject: group.subject,
      text: normalizeText(row.السؤال),
      choices: [
        normalizeText(row.اختيار1),
        normalizeText(row.اختيار2),
        normalizeText(row.اختيار3),
        normalizeText(row.اختيار4),
      ] as [string, string, string, string],
      correctAnswer: normalizeText(row.الإجابة),
      explanation: row.شرح ? normalizeText(row.شرح) : undefined,
      image: row.صورة?.trim() || undefined,
      duration: duration && isValidDuration(duration) ? duration : undefined,
      order: index + 1,
    };
  });

  return { quiz, questions };
}

export async function importCsvFile(
  content: string,
  sourceFileName?: string
): Promise<{ success: boolean; importedCount: number; quizCount: number; errors: string[] }> {
  const parseResult = parseCsvContent(content);
  if (parseResult.errors.length > 0 && parseResult.rows.length === 0) {
    return { success: false, importedCount: 0, quizCount: 0, errors: parseResult.errors.map(e => e.message) };
  }

  const validationResult = validateCsvContent(parseResult);
  if (validationResult.errors.length > 0 && validationResult.rows.length === 0) {
    return { success: false, importedCount: 0, quizCount: 0, errors: validationResult.errors.map(e => e.message) };
  }

  // Grouper par niveau/matière
  const groups = groupByLevelSubject(validationResult.rows);
  if (groups.length === 0) {
    return { success: false, importedCount: 0, quizCount: 0, errors: ['لا توجد أسطر صالحة للاستيراد'] };
  }

  const db = await getDb();
  let totalImported = 0;

  for (const group of groups) {
    const { quiz, questions } = buildQuizFromGroup(group, sourceFileName);
    const tx = db.transaction(['quizzes', 'questions'], 'readwrite');
    await tx.objectStore('quizzes').add(quiz);
    for (const q of questions) {
      await tx.objectStore('questions').add(q);
    }
    await tx.done;
    totalImported += questions.length;
  }

  return {
    success: true,
    importedCount: totalImported,
    quizCount: groups.length,
    errors: [],
  };
}
