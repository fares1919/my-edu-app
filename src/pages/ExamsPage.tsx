import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { useQuizzesStore } from '../stores/quizzes.store';
import { LEVELS, LEVEL_LABELS } from '../constants/levels';
import { SUBJECT_LABELS } from '../constants/subjects';
import type { Subject } from '../types/subject';

export function ExamsPage() {
  const navigate = useNavigate();
  const { level: paramLevel, subject: paramSubject } = useParams();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const { subjects, quizzes, loadSubjects, loadQuizzes, isLoading } = useQuizzesStore();

  const [selectedLevel, setSelectedLevel] = useState(paramLevel || activeProfile?.level || LEVELS[0]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(paramSubject || null);

  useEffect(() => {
    if (selectedLevel) loadSubjects(selectedLevel);
  }, [selectedLevel]);

  useEffect(() => {
    if (selectedLevel && selectedSubject) loadQuizzes(selectedLevel, selectedSubject);
  }, [selectedLevel, selectedSubject]);

  useEffect(() => {
    if (!activeProfile) navigate('/profiles');
  }, [activeProfile]);

  if (!activeProfile) return null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        الاختبارات
      </h1>

      {/* Sélection du niveau */}
      <div>
        <label className="label" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
          اختر المستوى
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => { setSelectedLevel(level); setSelectedSubject(null); }}
              className={selectedLevel === level ? 'btn btn-primary' : 'btn btn-ghost'}
            >
              {LEVEL_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      {/* Matières */}
      {selectedLevel && (
        <div>
          <label className="label" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
            اختر المادة
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.name)}
                className={selectedSubject === subject.name ? 'btn btn-primary' : 'btn btn-ghost'}
                style={{ minWidth: '140px' }}
              >
                {SUBJECT_LABELS[subject.name as Subject]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quiz disponibles */}
      {selectedLevel && selectedSubject && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
              الاختبارات المتاحة
            </h2>
            <button
              onClick={() => setSelectedSubject(null)}
              className="btn btn-ghost btn-sm"
            >
              تغيير المادة
            </button>
          </div>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          )}

          {!isLoading && quizzes.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 4px 0', fontSize: '0.95rem' }}>
                لا توجد اختبارات متاحة لهذه المادة
              </p>
              <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.85rem' }}>
                يمكنك استيراد اختبارات جديدة من ملف CSV
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="card"
                style={{
                  padding: '14px 18px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-default)',
                }}
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontSize: '0.95rem' }}>
                      {quiz.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                      {quiz.questionCount} سؤال | {quiz.defaultDuration} ثانية لكل سؤال
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${quiz.id}`); }}
                  >
                    بدء الاختبار
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
