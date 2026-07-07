import type { QuizSession } from '../../types/session';
import type { ExportRow, ExportFilters } from '../../types/export';
import type { Profile } from '../../types/profile';
import type { Quiz } from '../../types/quiz';
import { generateId } from '../../utils/ids';
import { nowISO } from '../../utils/dates';
import { formatShortDate } from '../../utils/formatters';
import { getDb } from '../db/db';
import type { ExportLog } from '../../types/export';

const BOM = '\uFEFF';

export function buildExportCsv(
  sessions: QuizSession[],
  profile: Profile,
  quizzes: Map<string, Quiz>
): string {
  const headers = [
    'profileName', 'level', 'subject', 'quizTitle', 'date',
    'score', 'totalQuestions', 'correctCount', 'wrongCount',
    'totalDuration', 'averageTimePerQuestion',
  ];

  const rows: ExportRow[] = sessions.map(session => ({
    profileName: profile.name,
    level: session.level,
    subject: session.subject,
    quizTitle: quizzes.get(session.quizId)?.title || session.quizId,
    date: formatShortDate(session.startedAt),
    score: session.score,
    totalQuestions: session.totalQuestions,
    correctCount: session.correctCount,
    wrongCount: session.wrongCount,
    totalDuration: session.totalDuration,
    averageTimePerQuestion: session.averageTimePerQuestion,
  }));

  const csvLines = [
    headers.join(';'),
    ...rows.map(row =>
      [
        escapeCsvField(row.profileName),
        row.level,
        row.subject,
        escapeCsvField(row.quizTitle),
        row.date,
        row.score.toString(),
        row.totalQuestions.toString(),
        row.correctCount.toString(),
        row.wrongCount.toString(),
        row.totalDuration.toString(),
        row.averageTimePerQuestion.toString(),
      ].join(';')
    ),
  ];

  return BOM + csvLines.join('\n');
}

function escapeCsvField(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function saveExportLog(
  profileId: string,
  filters: ExportFilters,
  recordCount: number,
  fileName: string
): Promise<void> {
  const db = await getDb();
  const log: ExportLog = {
    id: generateId(),
    profileId,
    filters,
    recordCount,
    generatedAt: nowISO(),
    fileName,
  };
  await db.add('exports', log);
}
