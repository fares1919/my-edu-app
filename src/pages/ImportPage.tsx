import { useState, useRef } from 'react';
import { useImportStore } from '../stores/import.store';
import type { CsvPreviewRow } from '../types/csv';

export function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { preview, importState, importResult, setFile, analyzeFile, executeImport, reset } = useImportStore();
  const [fileName, setFileName] = useState('');
  const [formatTab, setFormatTab] = useState<'csv' | 'txt'>('csv');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setFile(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    analyzeFile();
  };

  const handleImport = async () => {
    await executeImport();
  };

  const handleReset = () => {
    reset();
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">استيراد اختبارات</h1>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">
            اختر ملف (CSV أو TXT)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileSelect}
            className="input"
            style={{ padding: '8px 12px' }}
          />
        </div>

        {/* Format info tabs */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={() => setFormatTab('csv')}
            className={`btn btn-sm ${formatTab === 'csv' ? 'btn-primary' : 'btn-ghost'}`}
          >
            تنسيق CSV
          </button>
          <button
            onClick={() => setFormatTab('txt')}
            className={`btn btn-sm ${formatTab === 'txt' ? 'btn-primary' : 'btn-ghost'}`}
          >
            تنسيق TXT
          </button>
        </div>

        {formatTab === 'csv' && (
          <div className="feedback feedback-info" style={{ fontSize: '0.875rem' }}>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>التنسيق المطلوب (CSV):</p>
              <p dir="ltr" style={{ fontFamily: 'monospace', fontSize: '0.8125rem', margin: 0 }}>المستوى; المادة; السؤال; اختيار1; اختيار2; اختيار3; اختيار4; الإجابة; شرح; صورة; المدة</p>
            </div>
          </div>
        )}

        {formatTab === 'txt' && (
          <div className="feedback feedback-info" style={{ fontSize: '0.875rem' }}>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>التنسيق المطلوب (TXT):</p>
              <pre dir="rtl" style={{
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                direction: 'rtl',
                textAlign: 'right',
                lineHeight: 1.6,
              }}>
{`المستوى: السنة الرابعة متوسط
المادة: علوم الطبيعة والحياة

ما هو مصدر الطاقة الرئيسي على الأرض؟
أ. الشمس
ب. القمر
ج. الرياح
د. المياه
الإجابة: الشمس
الشرح: الشمس هي مصدر الطاقة الرئيسي

---

المستوى: السنة الثالثة متوسط
المادة: اللغة العربية

ما معنى كلمة العلم؟
أ. الجهل
ب. المعرفة
ج. الظن
د. الشك
الإجابة: المعرفة
الشرح: العلم هو المعرفة والإدراك`}
              </pre>
              <ul style={{ fontSize: '0.8125rem', margin: '8px 0 0 0', paddingRight: '20px' }}>
                <li>كل سؤال في مجموعة مستقلة</li>
                <li>تفصل المجموعات بخط <code dir="ltr">---</code> أو سطر فارغ</li>
                <li>الأسطر التي تبدأ بـ <code>#</code> تُعتبر تعليقات ويتم تجاهلها</li>
                <li>بيانات <code>المستوى:</code> و <code>المادة:</code> اختيارية وتُورث للمجموعة التالية</li>
                <li>الاختيارات تبدأ بـ <code>أ.</code> <code>ب.</code> <code>ج.</code> <code>د.</code></li>
                <li>الإجابة: النص المطابق لأحد الاختيارات</li>
                <li>الشرح: اختياري</li>
              </ul>
            </div>
          </div>
        )}

        {fileName && !preview && (
          <button onClick={handleAnalyze} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            تحليل الملف
          </button>
        )}

        {preview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span style={{ fontWeight: 600 }}>{preview.rows.length}</span> سطر صالح
                {preview.errors.length > 0 && (
                  <span style={{ color: 'var(--error-text)', marginRight: '8px' }}>{preview.errors.length} خطأ</span>
                )}
              </div>
              <button onClick={handleReset} className="btn btn-ghost btn-sm">
                تغيير الملف
              </button>
            </div>

            {/* Prévisualisation */}
            {preview.preview.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--nav-hover-bg)' }}>
                      <th style={{ padding: '8px', textAlign: 'right' }}>#</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>المستوى</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>المادة</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>السؤال</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.slice(0, 10).map((row) => (
                      <tr key={row.rowIndex} style={{ borderTop: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '8px', color: 'var(--text-tertiary)' }}>{row.rowIndex}</td>
                        <td style={{ padding: '8px' }}>{row.values['المستوى']}</td>
                        <td style={{ padding: '8px' }}>{row.values['المادة']}</td>
                        <td style={{ padding: '8px', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.values['السؤال']}</td>
                        <td style={{ padding: '8px' }}>
                          {row.isValid ? '✅' : '❌'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.preview.length > 10 && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                    ...و {preview.preview.length - 10} سطر آخر
                  </p>
                )}
              </div>
            )}

            {/* Erreurs */}
            {preview.errors.length > 0 && (
              <div className="feedback feedback-wrong" style={{ flexDirection: 'column' }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>الأخطاء:</p>
                <ul style={{ fontSize: '0.875rem', margin: '4px 0 0 0', paddingRight: '20px' }}>
                  {preview.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>السطر {err.rowIndex}: {err.message}</li>
                  ))}
                  {preview.errors.length > 5 && (
                    <li style={{ color: 'var(--text-tertiary)' }}>...و {preview.errors.length - 5} خطأ آخر</li>
                  )}
                </ul>
              </div>
            )}

            {/* Bouton d'import */}
            {preview.errors.length === 0 && preview.rows.length > 0 && importState !== 'loading' && !importResult && (
              <button onClick={handleImport} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                استيراد {preview.rows.length} سؤال
              </button>
            )}

            {importState === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '20px', height: '20px', border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                جاري الاستيراد...
              </div>
            )}

            {importResult && (
              <div className={`feedback ${importResult.success ? 'feedback-correct' : 'feedback-wrong'}`} style={{ flexDirection: 'column' }}>
                {importResult.success ? (
                  <p>تم استيراد {importResult.importedCount} سؤال في {importResult.quizCount} اختبار بنجاح</p>
                ) : (
                  <div>
                    <p>فشل الاستيراد:</p>
                    <ul style={{ fontSize: '0.875rem', margin: '4px 0 0 0', paddingRight: '20px' }}>
                      {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
                {importResult.success && (
                  <button onClick={handleReset} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                    استيراد ملف آخر
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
