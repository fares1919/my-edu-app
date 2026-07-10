-- ============================================
-- Supabase Schema — Edu Quiz App
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  avatar      TEXT,
  level       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read (we'll use anon key)
CREATE POLICY "Allow all on profiles"
  ON profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
  id                    TEXT PRIMARY KEY,
  profile_id            TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id               TEXT NOT NULL,
  level                 TEXT NOT NULL,
  subject               TEXT NOT NULL,
  started_at            TIMESTAMPTZ NOT NULL,
  finished_at           TIMESTAMPTZ,
  total_questions       INTEGER NOT NULL DEFAULT 0,
  correct_count         INTEGER NOT NULL DEFAULT 0,
  wrong_count           INTEGER NOT NULL DEFAULT 0,
  score                 NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_duration        INTEGER NOT NULL DEFAULT 0,
  avg_time_per_question NUMERIC(6,2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sessions_profile_id ON sessions(profile_id);
CREATE INDEX IF NOT EXISTS idx_sessions_subject ON sessions(subject);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_profile_subject ON sessions(profile_id, subject);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on sessions"
  ON sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. ANSWERS
CREATE TABLE IF NOT EXISTS answers (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  selected_answer TEXT,
  is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at     TIMESTAMPTZ NOT NULL,
  time_spent      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);

ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on answers"
  ON answers FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. VIEW: Évolution par jour par enfant
CREATE OR REPLACE VIEW daily_scores AS
SELECT
  p.id AS profile_id,
  p.name AS profile_name,
  p.avatar,
  p.level,
  s.subject,
  DATE(s.finished_at) AS date,
  COUNT(*) AS session_count,
  ROUND(AVG(s.score)::numeric, 1) AS avg_score,
  MAX(s.score) AS best_score,
  SUM(s.correct_count) AS total_correct,
  SUM(s.total_questions) AS total_questions
FROM sessions s
JOIN profiles p ON p.id = s.profile_id
WHERE s.finished_at IS NOT NULL
GROUP BY p.id, p.name, p.avatar, p.level, s.subject, DATE(s.finished_at)
ORDER BY date DESC;

-- 5. VIEW: Résumé par enfant
CREATE OR REPLACE VIEW profile_summary AS
SELECT
  p.id AS profile_id,
  p.name AS profile_name,
  p.avatar,
  p.level,
  COUNT(s.id) FILTER (WHERE s.finished_at IS NOT NULL) AS total_sessions,
  ROUND(AVG(s.score)::numeric, 1) FILTER (WHERE s.finished_at IS NOT NULL) AS global_avg,
  ROUND(AVG(s.score)::numeric, 1) FILTER (WHERE s.finished_at IS NOT NULL AND s.score >= 75) AS passing_avg
FROM profiles p
LEFT JOIN sessions s ON s.profile_id = p.id
GROUP BY p.id, p.name, p.avatar, p.level
ORDER BY p.created_at ASC;
