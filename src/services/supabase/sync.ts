import { createClient } from '@supabase/supabase-js';
import type { QuizSession } from '../../types/session';
import type { Profile } from '../../types/profile';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

// ─── Types pour les réponses Supabase ──────────
interface SessionRow {
  id: string;
  profile_id: string;
  quiz_id: string;
  level: string;
  subject: string;
  started_at: string;
  finished_at: string | null;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  score: number;
  total_duration: number;
  avg_time_per_question: number;
}

interface ProfileRow {
  id: string;
  name: string;
  avatar: string | null;
  level: string;
  created_at: string;
  updated_at: string;
}

/**
 * Push a session and its answers to Supabase.
 */
export async function syncSessionToCloud(
  session: QuizSession,
  answers: QCMAnswer[]
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const sessionPayload: SessionRow = {
      id: session.id,
      profile_id: session.profileId,
      quiz_id: session.quizId,
      level: session.level,
      subject: session.subject,
      started_at: session.startedAt,
      finished_at: session.finishedAt ?? null,
      total_questions: session.totalQuestions,
      correct_count: session.correctCount,
      wrong_count: session.wrongCount,
      score: session.score,
      total_duration: session.totalDuration,
      avg_time_per_question: session.averageTimePerQuestion,
    };

    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert(sessionPayload);

    if (sessionError) {
      console.error('❌ Erreur sync session:', sessionError);
      return false;
    }

    // Insert answers (batch)
    const answersPayload = answers.map(a => ({
      id: a.id,
      session_id: a.sessionId,
      question_id: a.questionId,
      selected_answer: a.selectedAnswer,
      is_correct: a.isCorrect,
      answered_at: a.answeredAt,
      time_spent: a.timeSpent,
    }));

    const { error: answersError } = await supabase
      .from('answers')
      .upsert(answersPayload);

    if (answersError) {
      console.error('❌ Erreur sync answers:', answersError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Erreur sync cloud:', err);
    return false;
  }
}

interface QCMAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedAnswer?: string | null;
  isCorrect: boolean;
  answeredAt: string;
  timeSpent: number;
}

/**
 * Sync a profile to cloud.
 */
export async function syncProfileToCloud(profile: {
  id: string;
  name: string;
  avatar?: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}): Promise<boolean> {
  if (!supabase) return false;

  try {
    const payload: ProfileRow = {
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar ?? null,
      level: profile.level,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(payload);

    if (error) {
      console.error('❌ Erreur sync profile:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('❌ Erreur sync profile:', err);
    return false;
  }
}

// ─── Cloud queries ────────────────────────────

export async function getCloudSessionsByProfileId(profileId: string): Promise<QuizSession[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('profile_id', profileId)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur chargement cloud sessions:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    profileId: row.profile_id,
    quizId: row.quiz_id,
    level: row.level,
    subject: row.subject,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    totalQuestions: row.total_questions,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    score: row.score,
    totalDuration: row.total_duration,
    averageTimePerQuestion: row.avg_time_per_question,
  }));
}

export async function getCloudProfiles(): Promise<Array<{
  id: string;
  name: string;
  avatar: string | null;
  level: string;
  createdAt: string;
  updatedAt: string;
}>> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erreur chargement cloud profiles:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    level: row.level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
