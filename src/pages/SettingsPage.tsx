import { useUiStore } from '../stores/ui.store';
import { Card } from '../components/ui/Card';

type ThemeOption = 'light' | 'dark' | 'high-contrast';
type FontOption = 'normal' | 'large' | 'dyslexic';

const THEMES: { value: ThemeOption; label: string; icon: string }[] = [
  { value: 'light', label: 'فاتح', icon: '☀️' },
  { value: 'dark', label: 'داكن', icon: '🌙' },
  { value: 'high-contrast', label: 'تباين عالي', icon: '♿' },
];

const FONTS: { value: FontOption; label: string; desc: string }[] = [
  { value: 'normal', label: 'عادي', desc: 'Noto Sans Arabic' },
  { value: 'large', label: 'كبير', desc: 'حجم 120%' },
  { value: 'dyslexic', label: 'مناسب للقراءة', desc: 'Cairo' },
];

export function SettingsPage() {
  const { theme, fontSize, animationsEnabled, setTheme, setFontSize, setAnimationsEnabled } = useUiStore();

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="page-header">
        <h1 className="page-title">الإعدادات</h1>
        <p className="page-subtitle">خصّص تجربتك في التطبيق</p>
      </div>

      {/* Theme */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>المظهر</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>اختر نمط العرض المناسب لك</p>
          </div>
          <div className="flex gap-2">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: theme === t.value ? 'var(--action-primary-bg)' : 'var(--surface-page)',
                  color: theme === t.value ? 'var(--action-primary-text)' : 'var(--text-secondary)',
                  border: theme === t.value ? 'none' : '1px solid var(--border-default)',
                }}
                aria-pressed={theme === t.value}
              >
                <div className="text-lg mb-1" aria-hidden="true">{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Font */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>الخط</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>اختر الخط وحجمه المناسبين لقراءة مريحة</p>
          </div>
          <div className="flex gap-2">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFontSize(f.value)}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: fontSize === f.value ? 'var(--action-primary-bg)' : 'var(--surface-page)',
                  color: fontSize === f.value ? 'var(--action-primary-text)' : 'var(--text-secondary)',
                  border: fontSize === f.value ? 'none' : '1px solid var(--border-default)',
                }}
                aria-pressed={fontSize === f.value}
              >
                <div className="font-semibold">{f.label}</div>
                <div className="text-xs mt-0.5 opacity-75">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Animations */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>الحركات</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>فعّل أو عطّل الحركات والانتقالات</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAnimationsEnabled(true)}
              className="flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: animationsEnabled ? 'var(--action-primary-bg)' : 'var(--surface-page)',
                color: animationsEnabled ? 'var(--action-primary-text)' : 'var(--text-secondary)',
                border: animationsEnabled ? 'none' : '1px solid var(--border-default)',
              }}
              aria-pressed={animationsEnabled}
            >
              <div className="text-lg mb-1" aria-hidden="true">✨</div>
              مفعّلة
            </button>
            <button
              onClick={() => setAnimationsEnabled(false)}
              className="flex-1 py-3 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: !animationsEnabled ? 'var(--action-primary-bg)' : 'var(--surface-page)',
                color: !animationsEnabled ? 'var(--action-primary-text)' : 'var(--text-secondary)',
                border: !animationsEnabled ? 'none' : '1px solid var(--border-default)',
              }}
              aria-pressed={!animationsEnabled}
            >
              <div className="text-lg mb-1" aria-hidden="true">🔇</div>
              معطّلة
            </button>
          </div>
        </div>
      </Card>

      {/* Accessibility info */}
      <div className="text-center py-4">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          متوافق مع معايير WCAG AA — تباين 4.5:1
        </p>
      </div>
    </div>
  );
}
