import { useUiStore } from '../stores/ui.store';
import { Card } from '../components/ui/Card';
import { isSupabaseConfigured } from '../services/supabase/client';

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

      {/* Supabase cloud */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>☁️ المزامنة السحابية</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>تتبع تطور الأطفال عبر الإنترنت مع Supabase</p>
          </div>
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              background: isSupabaseConfigured() ? 'color-mix(in srgb, var(--success-text, #28a745) 10%, transparent)' : 'color-mix(in srgb, var(--warning-text, #e67e22) 10%, transparent)',
              border: '1px solid ' + (isSupabaseConfigured() ? 'var(--success-text, #28a745)' : 'var(--warning-text, #e67e22)'),
              borderRadius: 'var(--radius-md, 8px)',
            }}
          >
            {isSupabaseConfigured() ? (
              <span style={{ color: 'var(--success-text, #28a745)', fontWeight: 500 }}>
                ✅ Supabase connecté — les résultats se synchronisent automatiquement vers le cloud.
              </span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: 'var(--warning-text, #e67e22)', fontWeight: 500 }}>
                  ⚠️ Supabase non configuré. Les données restent locales.
                </span>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    📋 Voir les instructions de configuration
                  </summary>
                  <div style={{ marginTop: '12px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, direction: 'ltr', textAlign: 'left' }}>
                    <ol style={{ paddingLeft: '20px' }}>
                      <li>Crée un compte gratuit sur <strong>supabase.com</strong></li>
                      <li>Crée un nouveau projet</li>
                      <li>Va dans <strong>SQL Editor</strong> et exécute le fichier <code>src/services/supabase/migration.sql</code></li>
                      <li>Va dans <strong>Settings → API</strong> et copie le <code>Project URL</code> + <code>anon public key</code></li>
                      <li>Ajoute ces variables dans le fichier <code>.env</code> du projet :</li>
                    </ol>
                    <pre style={{
                      background: 'var(--surface-page)',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      direction: 'ltr',
                      textAlign: 'left',
                      marginTop: '8px',
                    }}>
{`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...`}
                    </pre>
                    <p style={{ marginTop: '8px' }}>
                      Pour Vercel : ajoute ces variables dans <strong>Settings → Environment Variables</strong> et redéploie.
                    </p>
                  </div>
                </details>
              </div>
            )}
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
