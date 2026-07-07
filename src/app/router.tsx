import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { HomePage } from '../pages/HomePage';
import { ProfilesPage } from '../pages/ProfilesPage';
import { ExamsPage } from '../pages/ExamsPage';
import { QuizPage } from '../pages/QuizPage';
import { ResultPage } from '../pages/ResultPage';
import { ReviewPage } from '../pages/ReviewPage';
import { StatsPage } from '../pages/StatsPage';
import { MedalsPage } from '../pages/MedalsPage';
import { QuizManagePage } from '../pages/QuizManagePage';
import { ImportPage } from '../pages/ImportPage';
import { ExportPage } from '../pages/ExportPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.PROFILES} element={<ProfilesPage />} />
      <Route path={ROUTES.PROFILE_NEW} element={<ProfilesPage />} />
      <Route path="/profiles/:id/edit" element={<ProfilesPage />} />
      <Route path={ROUTES.EXAMS} element={<ExamsPage />} />
      <Route path="/exams/:level" element={<ExamsPage />} />
      <Route path="/exams/:level/:subject" element={<ExamsPage />} />
      <Route path={ROUTES.QUIZ(':quizId')} element={<QuizPage />} />
      <Route path={ROUTES.RESULT(':sessionId')} element={<ResultPage />} />
      <Route path={ROUTES.REVIEW(':sessionId')} element={<ReviewPage />} />
      <Route path={ROUTES.STATS} element={<StatsPage />} />
      <Route path="/quiz-manage" element={<QuizManagePage />} />
      <Route path={ROUTES.MEDALS} element={<MedalsPage />} />
      <Route path={ROUTES.IMPORT} element={<ImportPage />} />
      <Route path={ROUTES.EXPORT} element={<ExportPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
