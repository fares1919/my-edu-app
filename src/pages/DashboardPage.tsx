import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { getCloudProfiles, getCloudSessionsByProfileId } from '../services/supabase/sync';
import { isSupabaseConfigured } from '../services/supabase/client';
import { getSessionsByProfileId } from '../services/db/repositories/sessions.repo';
import { LEVEL_LABELS } from '../constants/levels';
import { SUBJECT_LABELS } from '../constants/subjects';
import type { QuizSession } from '../types/session';

// ─── Types ──────────────────────────────────────
interface KidData {
  id: string;
  name: string;
  avatar: string | null;
  level: string;
  sessions: QuizSession[];
  globalAvg: number;
  bySubject: { subject: string; avg: number; count: number }[];
  trend: { date: string; avg: number }[];
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [kids, setKids] = useState<KidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'checking' | 'offline' | 'online'>('checking');
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setSyncStatus(isSupabaseConfigured() ? 'online' : 'offline');

    try {
      let profiles: Array<{ id: string; name: string; avatar: string | null; level: string }>;

      if (isSupabaseConfigured()) {
        profiles = await getCloudProfiles();
      } else {
        // Fallback: load from IndexedDB
        const localProfiles = useProfilesStore.getState().profiles;
        profiles = localProfiles.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar || null,
          level: p.level,
        }));
      }

      // Load sessions for each profile
      const kidsData: KidData[] = [];
      for (const profile of profiles) {
        let sessions: QuizSession[];

        if (isSupabaseConfigured()) {
          sessions = await getCloudSessionsByProfileId(profile.id);
        } else {
          sessions = await getSessionsByProfileId(profile.id);
        }

        const finished = sessions.filter(s => s.finishedAt);

        // Global avg
        const globalAvg = finished.length > 0
          ? Math.round(finished.reduce((sum, s) => sum + s.score, 0) / finished.length)
          : 0;

        // By subject
        const subjectMap = new Map<string, number[]>();
        for (const s of finished) {
          const arr = subjectMap.get(s.subject) || [];
          arr.push(s.score);
          subjectMap.set(s.subject, arr);
        }
        const bySubject = Array.from(subjectMap.entries())
          .map(([subject, scores]) => ({
            subject,
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            count: scores.length,
          }))
          .sort((a, b) => b.count - a.count);

        // Trend (daily averages)
        const dayMap = new Map<string, number[]>();
        for (const s of finished) {
          const day = s.finishedAt!.slice(0, 10);
          const arr = dayMap.get(day) || [];
          arr.push(s.score);
          dayMap.set(day, arr);
        }
        const trend = Array.from(dayMap.entries())
          .map(([date, scores]) => ({
            date,
            avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-14); // Last 14 days

        kidsData.push({
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar,
          level: profile.level,
          sessions: finished,
          globalAvg,
          bySubject,
          trend,
        });
      }

      setKids(kidsData);
    } catch (err) {
      console.error('❌ Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid var(--accent-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-tertiary)' }}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  const allSubjects = Array.from(new Set(kids.flatMap(k => k.bySubject.map(s => s.subject)))).sort();

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            👨‍👩‍👧‍👦 لوحة تحكم الأهل
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
            تابع تطور أطفالك في الاختبارات
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SyncBadge status={syncStatus} />
          <button className="btn btn-ghost btn-sm" onClick={loadDashboard}>
            🔄 تحديث
          </button>
        </div>
      </div>

      {syncStatus === 'offline' && (
        <div className="card" style={{
          background: 'var(--warning-bg, #FFF3CD)',
          border: '1px solid var(--warning-border, #FFEAA7)',
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: 'var(--warning-text, #856404)',
        }}>
          ⚠️ Supabase non configuré. Les données viennent du stockage local.
          Configure les variables <code>.env</code> pour activer le cloud.
        </div>
      )}

      {/* If no data */}
      {kids.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-tertiary)', margin: 0 }}>
            لا يوجد أطفال بعد. قم بإنشاء ملفات شخصية أولاً.
          </p>
        </div>
      )}

      {/* Kids cards */}
      {kids.map(kid => (
        <KidCard
          key={kid.id}
          kid={kid}
          selectedSubject={selectedSubject}
          onSubjectFilter={setSelectedSubject}
        />
      ))}

      {/* Subject filter for detailed view */}
      {kids.length > 0 && allSubjects.length > 0 && (
        <div className="card" style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
            تصفية حسب المادة
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${selectedSubject === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedSubject('all')}
            >
              🏫 جميع المواد
            </button>
            {allSubjects.map(sub => (
              <button
                key={sub}
                className={`btn btn-sm ${selectedSubject === sub ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedSubject(sub)}
              >
                {SUBJECT_LABELS[sub as keyof typeof SUBJECT_LABELS] || sub}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sync Badge ─────────────────────────────────
function SyncBadge({ status }: { status: 'checking' | 'offline' | 'online' }) {
  const styles: Record<string, { dot: string; text: string; label: string }> = {
    checking: { dot: '#888', text: 'var(--text-tertiary)', label: '...' },
    offline: { dot: '#dc3545', text: '#dc3545', label: 'محلي' },
    online: { dot: '#28a745', text: '#28a745', label: '☁️ متصل' },
  };
  const s = styles[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontSize: '0.8125rem', fontWeight: 500, color: s.text,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  );
}

// ─── Kid Card ───────────────────────────────────
function KidCard({
  kid,
  selectedSubject,
  onSubjectFilter,
}: {
  kid: KidData;
  selectedSubject: string | 'all';
  onSubjectFilter: (s: string | 'all') => void;
}) {
  const filteredSessions = selectedSubject === 'all'
    ? kid.sessions
    : kid.sessions.filter(s => s.subject === selectedSubject);

  const filteredAvg = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((a, b) => a + b, 0) / filteredSessions.length)
    : 0;

  const scoreColor = filteredAvg >= 75 ? 'var(--success-text, #28a745)'
    : filteredAvg >= 50 ? 'var(--warning-text, #e67e22)'
    : 'var(--error-text, #dc3545)';

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>{kid.avatar || '👤'}</span>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {kid.name}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              {LEVEL_LABELS[kid.level as keyof typeof LEVEL_LABELS] || kid.level}
              {' · '}<strong>{kid.sessions.length}</strong> اختبار{kid.sessions.length > 1 ? 'ات' : ''}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: scoreColor }}>
            {filteredAvg}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {selectedSubject === 'all' ? 'المعدل العام' : SUBJECT_LABELS[selectedSubject as keyof typeof SUBJECT_LABELS] || selectedSubject}
          </div>
        </div>
      </div>

      {/* Bar de progression */}
      <div className="progress" style={{ height: '8px' }}>
        <div
          className="progress-fill"
          style={{
            width: `${filteredAvg}%`,
            background: filteredAvg >= 75 ? 'var(--success-text, #28a745)'
              : filteredAvg >= 50 ? 'var(--warning-text, #e67e22)'
              : 'var(--error-text, #dc3545)',
            transition: 'width 0.6s ease',
          }}
        />
      </div>

      {/* Mini trend chart (barres) */}
      {kid.trend.length > 1 && (
        <div>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
            📈 التطور (آخر 14 يوم)
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '48px' }}>
            {kid.trend.map((t, i) => {
              const heightPct = Math.max(t.avg, 5);
              return (
                <div
                  key={t.date}
                  title={`${t.date}: ${t.avg}%`}
                  style={{
                    flex: 1,
                    height: `${heightPct}%`,
                    minHeight: '4px',
                    background: t.avg >= 75 ? 'var(--success-text, #28a745)'
                      : t.avg >= 50 ? 'var(--warning-text, #e67e22)'
                      : 'var(--error-text, #dc3545)',
                    borderRadius: '2px 2px 0 0',
                    opacity: 0.7 + (i / kid.trend.length) * 0.3,
                    transition: 'all 0.3s ease',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Matières */}
      {kid.bySubject.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {kid.bySubject.map(sub => {
            const subColor = sub.avg >= 75 ? 'var(--success-text, #28a745)'
              : sub.avg >= 50 ? 'var(--warning-text, #e67e22)'
              : 'var(--error-text, #dc3545)';
            return (
              <button
                key={sub.subject}
                onClick={() => onSubjectFilter(sub.subject)}
                style={{
                  background: 'var(--surface-page)',
                  border: '1px solid var(--border-light, #e0e0e0)',
                  borderRadius: 'var(--radius-md, 8px)',
                  padding: '10px 12px',
                  textAlign: 'right',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {SUBJECT_LABELS[sub.subject as keyof typeof SUBJECT_LABELS] || sub.subject}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: subColor }}>{sub.avg}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{sub.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Derniers tests */}
      {filteredSessions.length > 0 && (
        <details>
          <summary style={{
            fontSize: '0.875rem', fontWeight: 500,
            color: 'var(--text-secondary)', cursor: 'pointer',
            padding: '4px 0',
          }}>
            آخر الاختبارات ({filteredSessions.length})
          </summary>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredSessions.slice(-10).reverse().map(s => {
              const col = s.score >= 75 ? 'var(--success-text, #28a745)'
                : s.score >= 50 ? 'var(--warning-text, #e67e22)'
                : 'var(--error-text, #dc3545)';
              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: '0.8125rem', padding: '8px 10px',
                  background: 'var(--surface-page)',
                  borderRadius: '6px',
                }}>
                  <span style={{ color: 'var(--text-primary)' }}>
                    {SUBJECT_LABELS[s.subject as keyof typeof SUBJECT_LABELS] || s.subject}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: col }}>{s.score}%</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {s.finishedAt?.slice(0, 10)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}
