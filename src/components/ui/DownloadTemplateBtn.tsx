import { generateCsvTemplate } from '../../services/csv/generateTemplate';

/**
 * Button that generates and downloads a CSV template with sample data.
 * Uses UTF-8 BOM for Excel compatibility with Arabic text.
 */
export function DownloadTemplateBtn() {
  const handleDownload = () => {
    const csvContent = generateCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'نموذج_استيراد_اسئلة.csv';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <button
      onClick={handleDownload}
      className="btn btn-ghost btn-sm"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
      }}
      title="تحميل نموذج CSV"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      تحميل نموذج CSV
    </button>
  );
}
