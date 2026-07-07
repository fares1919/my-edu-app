import { useState } from 'react';
import { generateCsvTemplate } from '../../services/csv/generateTemplate';

const COPY_TIMEOUT = 2000; // 2s

/**
 * Button that copies the CSV template to clipboard.
 * Shows "✓ نُسخ !" feedback for 2 seconds after copying.
 */
export function CopyCsvTemplateBtn() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const csvContent = generateCsvTemplate();
      await navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    } catch {
      // Fallback for older browsers
      const csvContent = generateCsvTemplate();
      const textarea = document.createElement('textarea');
      textarea.value = csvContent;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost btn-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        color: copied ? 'var(--success-text)' : undefined,
      }}
      title="نسخ النموذج"
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? '✓ نُسخ !' : 'نسخ النموذج'}
    </button>
  );
}
