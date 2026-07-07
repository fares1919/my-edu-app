import { create } from 'zustand';
import type { QuizSession } from '../types/session';
import type { ProfileStatsSummary, SubjectStat, Medal } from '../types/stats';
import type { Subject } from '../types/subject';
import { getSessionsByProfileId } from '../services/db/repositories/sessions.repo';
import { ALL_SUBJECTS } from '../constants/subjects';

interface StatsState {
  sessions: QuizSession[];
  summary: ProfileStatsSummary | null;
  isLoading: boolean;
  loadStats: (profileId: string) => Promise<void>;
  calculateMedal: (averageScore: number) => Medal;
}

const MEDAL_THRESHOLDS = [
  { medal: 'gold' as Medal, minAverage: 90 },
  { medal: 'silver' as Medal, minAverage: 75 },
  { medal: 'bronze' as Medal, minAverage: 50 },
];

export function calculateMedal(averageScore: number): Medal {
  for (const t of MEDAL_THRESHOLDS) {
    if (averageScore >= t.minAverage) return t.medal;
  }
  return 'none';
}

export const useStatsStore = create<StatsState>((set) => ({
  sessions: [],
  summary: null,
  isLoading: false,

  loadStats: async (profileId: string) => {
    set({ isLoading: true });
    try {
      const sessions = await getSessionsByProfileId(profileId);
      
      const finishedSessions = sessions.filter(s => s.finishedAt);
      const totalSessions = finishedSessions.length;
      
      if (totalSessions === 0) {
        set({ sessions: finishedSessions, summary: {
          profileId,
          globalAverage: 0,
          totalSessions: 0,
          bySubject: [],
        }, isLoading: false });
        return;
      }

      const globalAverage = Math.round(
        finishedSessions.reduce((sum, s) => sum + s.score, 0) / totalSessions
      );

      // Par sujet
      const subjectScores = new Map<Subject, number[]>();
      for (const s of finishedSessions) {
        const current = subjectScores.get(s.subject) || [];
        current.push(s.score);
        subjectScores.set(s.subject, current);
      }

      const bySubject: SubjectStat[] = Array.from(subjectScores.entries())
        .map(([subject, scores]) => ({
          subject,
          averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          sessionCount: scores.length,
        }))
        .sort((a, b) => b.sessionCount - a.sessionCount);

      set({
        sessions,
        summary: { profileId, globalAverage, totalSessions, bySubject },
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
      set({ isLoading: false });
    }
  },

  calculateMedal,
}));
