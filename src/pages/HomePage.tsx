import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { ROUTES } from '../constants/routes';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/common/EmptyState';

export function HomePage() {
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const profiles = useProfilesStore((s) => s.profiles);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header text-center">
        <h1 className="page-title text-3xl md:text-4xl">
          مرحباً بك في تطبيق الاختبارات
        </h1>
        <p className="page-subtitle mt-2">
          اختبر معلوماتك وراجع دروسك بطريقة ممتعة
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Profile Card */}
        <Card interactive onClick={() => navigate(ROUTES.PROFILES)}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {activeProfile ? activeProfile.name : 'الملف الشخصي'}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {activeProfile ? `المستوى: ${activeProfile.level}` : 'ليس هناك ملف نشط'}
              </p>
            </div>
          </div>
        </Card>

        {/* Exams Card */}
        <Card interactive onClick={() => navigate(activeProfile ? ROUTES.EXAMS : ROUTES.PROFILES)}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                الاختبارات
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                اختر مادة وابدأ الاختبار
              </p>
            </div>
          </div>
        </Card>

        {/* Manage Questions Card */}
        <Card interactive onClick={() => navigate('/quiz-manage')}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                إدارة الأسئلة
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                أضف أو احذف الأسئلة والاختبارات
              </p>
            </div>
          </div>
        </Card>

        {/* Stats Card */}
        <Card interactive onClick={() => navigate(ROUTES.STATS)}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                الإحصائيات
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                تابع تقدمك
              </p>
            </div>
          </div>
        </Card>

        {/* Medals Card */}
        <Card interactive onClick={() => navigate(ROUTES.MEDALS)}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                الميداليات
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                انظر إنجازاتك
              </p>
            </div>
          </div>
        </Card>

        {/* Import Card */}
        <Card interactive onClick={() => navigate(ROUTES.IMPORT)}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                استيراد
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                أضف اختبارات جديدة من ملف CSV
              </p>
            </div>
          </div>
        </Card>

        {/* Export Card */}
        <Card interactive onClick={() => navigate(ROUTES.EXPORT)}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--nav-active-bg)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg mb-0.5" style={{ color: 'var(--text-primary)' }}>
                تصدير
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                صدّر النتائج إلى ملف CSV
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Empty state when no profiles */}
      {profiles.length === 0 && (
        <Card className="text-center py-10">
          <EmptyState
            icon="👤"
            title="لا يوجد أي ملف شخصي بعد"
            description="أنشئ ملفك الشخصي لتبدأ الاختبارات وتتبع تقدمك"
            action={
              <Button variant="primary" onClick={() => navigate(ROUTES.PROFILE_NEW)}>
                إنشاء ملف شخصي
              </Button>
            }
          />
        </Card>
      )}
    </div>
  );
}
