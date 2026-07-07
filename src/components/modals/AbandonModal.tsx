interface AbandonModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AbandonModal({ show, onClose, onConfirm }: AbandonModalProps) {
  if (!show) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} dir="rtl">
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
          }}
        >
          هل تريد الخروج من الاختبار؟
        </h3>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            margin: '0 0 16px 0',
          }}
        >
          لن يتم حفظ النتائج الحالية، ولن تظهر في الإحصائيات.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            متابعة الاختبار
          </button>
          <button className="btn btn-ghost" onClick={onConfirm}>
            تأكيد الخروج
          </button>
        </div>
      </div>
    </div>
  );
}
