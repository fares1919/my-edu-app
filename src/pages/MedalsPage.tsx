import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { useStatsStore, calculateMedal } from '../stores/stats.store';
import { ROUTES } from '../constants/routes';
import { formatScore } from '../utils/formatters';

const MEDAL_INFO = [
  { type: 'gold' as const, emoji: '🥇', label: 'ذهبية', minScore: 90, color: '#FFD700' },
  { type: 'silver' as const, emoji: '🥈', label: 'فضية', minScore: 75, color: '#C0C0C0' },
  { type: 'bronze' as const, emoji: '🥉', label: 'برونزية', minScore: 50, color: '#CD7F32' },
];

export function MedalsPage() {
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const { summary, loadStats } = useStatsStore();

  useEffect(() => {
    if (activeProfile) loadStats(activeProfile.id);
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

  const average = summary?.globalAverage || 0;
  const currentMedal = calculateMedal(average);

  const nextMedal = MEDAL_INFO.find(m => {
    const idx = MEDAL_INFO.indexOf(m);
    return idx > 0 && average < MEDAL_INFO[idx - 1].minScore && m.minScore > average;
  });

  return (
    <div style={{ maxWidth: '512px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 className="page-title">الميداليات</h1>

      {/* Médaille actuelle */}
      <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>
          {currentMedal !== 'none' ? MEDAL_INFO.find(m => m.type === currentMedal)?.emoji : '🏅'}
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
          {currentMedal !== 'none'
            ? `ميدالية ${MEDAL_INFO.find(m => m.type === currentMedal)?.label}`
            : 'لا توجد ميدالية بعد'}
        </h2>
        <p style={{ color: 'var(--text-tertiary)', margin: '0 0 8px 0' }}>المعدل العام: {formatScore(average)}</p>
        
        {nextMedal && (
          <div className="feedback feedback-info" style={{ flexDirection: 'column', marginTop: '16px' }}>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              تبقى {Math.round(nextMedal.minScore - average)}% للحصول على الميدالية {nextMedal.label}
            </p>
            <div className="progress" style={{ marginTop: '8px' }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, (average / nextMedal.minScore) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Liste des médailles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {MEDAL_INFO.map((medal) => {
          const isUnlocked = average >= medal.minScore;
          return (
            <div
              key={medal.type}
              className="card"
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                opacity: isUnlocked ? 1 : 0.5,
                borderColor: isUnlocked ? 'var(--accent-secondary)' : 'var(--border-default)',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{medal.emoji}</span>
              <div>
                <h3 style={{
                  fontWeight: 600,
                  color: isUnlocked ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  margin: 0, fontSize: '1rem',
                }}>
                  الميدالية {medal.label}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                  {isUnlocked ? 'تم الحصول عليها ✅' : `يتطلب معدل ${formatScore(medal.minScore)} فأكثر`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
