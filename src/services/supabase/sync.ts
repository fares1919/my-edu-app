import type { QuizSession, SessionAnswer } from '../../types/session';
import { supabase, isSupabaseConfigured } from './client';
import { getDb } from '../db/db';

/**
 * Push a session and its answers to Supabase.
 * Called automatically after a quiz is finished and saved locally.
 */
export async function syncSessionToCloud(
  session: QuizSession,
  answers: SessionAnswer[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) {
    console.log('⚠️ Supabase non configuré. Session sauvegardée localement uniquement.');
    return false;
  }

  try {
    // 1. Insert session
    const { error: sessionError } = await supabase
      .from('sessions')
      .upsert([{
        id: session.id,
        profile_id: session.profileId,
        quiz_id: session.quizId,
        level: session.level,
        subject: session.subject,
        started_at: session.startedAt,
        finished_at: session.finishedAt,
        total_questions: session.totalQuestions,
        correct_count: session.correctCount,
        wrong_count: session.wrongCount,
        score: session.score,
        total_duration: session.totalDuration,
        avg_time_per_question: session.averageTimePerQuestion,
      }], { onConflict: 'id' });

    if (sessionError) {
      console.error('❌ Erreur sync session:', sessionError);
      return false;
    }

    // 2. Insert answers (batch)
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
      .upsert(answersPayload, { onConflict: 'id' });

    if (answersError) {
      console.error('❌ Erreur sync answers:', answersError);
      return false;
    }

    console.log('✅ Session synchronisée vers le cloud !');
    return true;
  } catch (err) {
    console.error('❌ Erreur sync cloud:', err);
    return false;
  }
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
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert([{
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar || null,
        level: profile.level,
        created_at: profile.createdAt,
        updated_at: profile.updatedAt,
      }], { onConflict: 'id' });

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

// ─── Cloud queries for the parent dashboard ───

export async function getCloudSessionsByProfileId(profileId: string): Promise<QuizSession[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('profile_id', profileId)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('❌ Erreur chargement cloud sessions:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    profileId: row.profile_id,
    quizId: row.quiz_id,
    level: row.level as any,
    subject: row.subject as any,
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
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erreur chargement cloud profiles:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    level: row.level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}
