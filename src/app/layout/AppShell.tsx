import type { ReactNode } from 'react';
import { useAppStore } from '../../stores/app.store';
import { useUiStore } from '../../stores/ui.store';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const isReady = useAppStore((s) => s.isReady);
  const initState = useAppStore((s) => s.initState);
  const isOffline = useAppStore((s) => s.isOffline);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const location = useLocation();

  if (initState === 'loading' && !isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--surface-page)' }} dir="rtl">
        <div className="text-center animate-scale-in">
          <div className="w-12 h-12 border-4 rounded-full mx-auto mb-4"
            style={{
              borderColor: 'var(--border-default)',
              borderTopColor: 'var(--accent-primary)'
            }}
          />
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--surface-page)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40"
        style={{
          background: 'var(--surface-card)',
          borderBottom: '1px solid var(--border-default)',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to={ROUTES.HOME} className="text-xl font-bold no-underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            تطبيق الاختبارات
          </Link>
          <div className="flex items-center gap-3">
            {isOffline && (
              <span className="badge badge-warning text-xs" role="status">
                غير متصل
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="btn btn-ghost btn-sm !min-h-0 !min-w-0 !p-2"
              aria-label="القائمة"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        {/* Sidebar — Desktop */}
        <aside className="w-56 shrink-0 min-h-[calc(100vh-3.5rem)] p-4 hidden md:block"
          style={{
            background: 'var(--surface-card)',
            borderLeft: '1px solid var(--border-default)'
          }}
        >
          <nav className="space-y-1" aria-label="القائمة الرئيسية">
            <SidebarLink to={ROUTES.HOME} label="الرئيسية" icon="home" current={location.pathname} />
            <SidebarLink to={ROUTES.PROFILES} label="الملفات الشخصية" icon="profile" current={location.pathname} />
            <SidebarLink to={ROUTES.DASHBOARD} label="لوحة الأهل" icon="dashboard" current={location.pathname} />
            <SidebarLink to={ROUTES.EXAMS} label="الاختبارات" icon="exam" current={location.pathname} />
            <SidebarLink to="/quiz-manage" label="إدارة الأسئلة" icon="edit" current={location.pathname} />
            <SidebarLink to={ROUTES.STATS} label="الإحصائيات" icon="stats" current={location.pathname} />
            <SidebarLink to={ROUTES.MEDALS} label="الميداليات" icon="medal" current={location.pathname} />
            <SidebarLink to={ROUTES.IMPORT} label="استيراد" icon="import" current={location.pathname} />
            <SidebarLink to={ROUTES.EXPORT} label="تصدير" icon="export" current={location.pathname} />
            <SidebarLink to={ROUTES.SETTINGS} label="الإعدادات" icon="settings" current={location.pathname} />
          </nav>
        </aside>

        {/* Sidebar — Mobile Overlay */}
        {sidebarOpen && (
          <>
            <div
              onClick={toggleSidebar}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              aria-hidden="true"
            />
            <aside
              className="fixed top-0 right-0 z-50 w-64 h-full p-4 md:hidden"
              style={{
                background: 'var(--surface-card)',
                borderLeft: '1px solid var(--border-default)',
                boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
                animation: 'slideInLeft 0.2s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.125rem' }}>القائمة</span>
                <button
                  onClick={toggleSidebar}
                  className="btn btn-ghost btn-sm !min-h-0 !min-w-0 !p-2"
                  aria-label="إغلاق القائمة"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="space-y-1" aria-label="القائمة الرئيسية">
                <SidebarLink to={ROUTES.HOME} label="الرئيسية" icon="home" current={location.pathname} />
                <SidebarLink to={ROUTES.PROFILES} label="الملفات الشخصية" icon="profile" current={location.pathname} />
                <SidebarLink to={ROUTES.DASHBOARD} label="لوحة الأهل" icon="dashboard" current={location.pathname} />
                <SidebarLink to={ROUTES.EXAMS} label="الاختبارات" icon="exam" current={location.pathname} />
                <SidebarLink to="/quiz-manage" label="إدارة الأسئلة" icon="edit" current={location.pathname} />
                <SidebarLink to={ROUTES.STATS} label="الإحصائيات" icon="stats" current={location.pathname} />
                <SidebarLink to={ROUTES.MEDALS} label="الميداليات" icon="medal" current={location.pathname} />
                <SidebarLink to={ROUTES.IMPORT} label="استيراد" icon="import" current={location.pathname} />
                <SidebarLink to={ROUTES.EXPORT} label="تصدير" icon="export" current={location.pathname} />
                <SidebarLink to={ROUTES.SETTINGS} label="الإعدادات" icon="settings" current={location.pathname} />
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 animate-fade-in min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Sidebar Link ────────────────────────────────────────────
interface SidebarLinkProps {
  to: string;
  label: string;
  icon: string;
  current: string;
}

function SidebarLink({ to, label, icon, current }: SidebarLinkProps) {
  const isActive = current === to || current.startsWith(to + '/');

  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium no-underline transition-all duration-150"
      style={{
        background: isActive ? 'var(--nav-active-bg)' : 'transparent',
        color: isActive ? 'var(--nav-active-text)' : 'var(--text-secondary)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--nav-hover-bg)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      <SidebarIcon name={icon} />
      <span>{label}</span>
    </Link>
  );
}

// ─── Icons ───────────────────────────────────────────────────
function SidebarIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    profile: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
    exam: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
    stats: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    medal: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>,
    edit: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    import: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    export: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  };
  return icons[name] || null;
}
