import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-neutral-800 mb-2">الصفحة غير موجودة</h1>
      <p className="text-neutral-500 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
      <Link
        to={ROUTES.HOME}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors no-underline"
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
