import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { useStatsStore } from '../stores/stats.store';
import { ROUTES } from '../constants/routes';
import { formatShortDate, formatScore } from '../utils/formatters';
import { SUBJECT_LABELS } from '../constants/subjects';
import { LEVEL_LABELS } from '../constants/levels';

export function StatsPage() {
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const { summary, sessions, isLoading, loadStats } = useStatsStore();

  useEffect(() => {
    if (activeProfile) {
      loadStats(activeProfile.id);
    }
  }, [activeProfile]);

  if (!activeProfile) {
    return (
      <div style={{ maxWidth: '512px', margin: '0 auto', textAlign: 'center', paddingTop: '48px' }}>
        <p style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>يرجى اختيار ملف شخصي أولاً</p>
        <button onClick={() => navigate(ROUTES.PROFILES)} className="btn btn-primary">
          اختيار ملف
        </button>
      </div>
    );
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
    </div>
  );

  const recentSessions = [...sessions].filter(s => s.finishedAt).reverse().slice(0, 20);

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 className="page-title">الإحصائيات</h1>

      {/* Résumé */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: '1.125rem', margin: 0, color: 'var(--text-primary)' }}>{activeProfile.name}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>{LEVEL_LABELS[activeProfile.level]}</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatScore(summary?.globalAverage || 0)}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>المعدل العام</div>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>
          عدد الاختبارات: {summary?.totalSessions || 0}
        </p>
      </div>

      {/* Matières */}
      {summary && summary.bySubject.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>المعدل حسب المادة</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {summary.bySubject.map((stat) => (
              <div key={stat.subject} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{SUBJECT_LABELS[stat.subject]}</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{formatScore(stat.averageScore)}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{stat.sessionCount} اختبار</div>
                <div className="progress">
                  <div
                    className="progress-fill"
                    style={{ width: `${stat.averageScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0 }}>آخر الاختبارات</h2>
        {recentSessions.length === 0 ? (
          <div className="empty-state">
            <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>لا توجد اختبارات سابقة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentSessions.map((s) => {
              const scoreColor = s.score >= 75 ? 'var(--success-text)' : s.score >= 50 ? 'var(--warning-text)' : 'var(--error-text)';
              return (
                <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>{SUBJECT_LABELS[s.subject]}</p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>{formatShortDate(s.startedAt)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: scoreColor }}>
                      {formatScore(s.score)}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{s.totalQuestions} أسئلة</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
