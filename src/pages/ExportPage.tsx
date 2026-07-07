import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { useStatsStore } from '../stores/stats.store';
import { buildExportCsv, downloadCsv, saveExportLog } from '../services/export/exportCsv';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import { ROUTES } from '../constants/routes';
import type { Quiz } from '../types/quiz';

export function ExportPage() {
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const { sessions, loadStats } = useStatsStore();
  const [exporting, setExporting] = useState(false);

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

  const finishedSessions = sessions.filter(s => s.finishedAt);

  const handleExport = async () => {
    if (finishedSessions.length === 0) return;
    setExporting(true);
    try {
      const allQuizzes = await quizRepo.getAll();
      const quizMap = new Map<string, Quiz>();
      allQuizzes.forEach(q => quizMap.set(q.id, q));

      const csv = buildExportCsv(finishedSessions, activeProfile, quizMap);
      const fileName = `نتائج_${activeProfile.name}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(csv, fileName);
      
      await saveExportLog(activeProfile.id, { profileId: activeProfile.id }, finishedSessions.length, fileName);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ maxWidth: '512px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h1 className="page-title">تصدير النتائج</h1>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{activeProfile.name}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
            {finishedSessions.length === 0 ? 'لا توجد نتائج للتصدير' : `${finishedSessions.length} اختبار مكتمل`}
          </p>
        </div>

        {finishedSessions.length > 0 && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="btn btn-primary btn-full"
          >
            {exporting ? 'جاري التصدير...' : `تصدير ${finishedSessions.length} نتيجة`}
          </button>
        )}
      </div>
    </div>
  );
}
