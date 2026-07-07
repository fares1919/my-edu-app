import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfilesStore } from '../stores/profiles.store';
import { quizRepo } from '../services/db/repositories/quizzes.repo';
import { questionRepo } from '../services/db/repositories/questions.repo';
import { getDb } from '../services/db/db';
import { LEVELS, LEVEL_LABELS } from '../constants/levels';
import { ALL_SUBJECTS, SUBJECT_LABELS } from '../constants/subjects';
import { generateId } from '../utils/ids';
import { nowISO } from '../utils/dates';
import type { Quiz } from '../types/quiz';
import type { Question } from '../types/question';
import type { Level, Subject } from '../types/subject';

const QUESTION_DURATIONS = [15, 20, 30, 45, 60, 90, 120];

export function QuizManagePage() {
  const navigate = useNavigate();
  const activeProfile = useProfilesStore((s) => s.activeProfile);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [showNewQuizForm, setShowNewQuizForm] = useState(false);
  const [showNewQuestion, setShowNewQuestion] = useState(false);

  // Filters
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');

  // New quiz form
  const [newQuiz, setNewQuiz] = useState({ title: '', level: '4_متوسط' as Level, subject: 'الرياضيات' as Subject });
  // New question form
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    choice1: '', choice2: '', choice3: '', choice4: '',
    correctAnswer: '',
    explanation: '',
    duration: 30,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteQConfirm, setDeleteQConfirm] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const all = await quizRepo.getAll();
      setQuizzes(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuizzes(); }, []);

  const filteredQuizzes = quizzes.filter(q => {
    if (filterLevel && q.level !== filterLevel) return false;
    if (filterSubject && q.subject !== filterSubject) return false;
    return true;
  });

  const handleCreateQuiz = async () => {
    if (!newQuiz.title.trim()) return;
    try {
      const quiz: Quiz = {
        id: generateId(),
        title: newQuiz.title.trim(),
        level: newQuiz.level,
        subject: newQuiz.subject,
        questionCount: 0,
        defaultDuration: 30,
        status: 'active',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      await quizRepo.create(quiz);
      setShowNewQuizForm(false);
      setNewQuiz({ title: '', level: '4_متوسط' as Level, subject: 'الرياضيات' as Subject });
      await loadQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    try {
      const db = await getDb();
      const qs = await questionRepo.getAll().then(all => all.filter(q => q.quizId === id));
      const tx = db.transaction(['questions', 'quizzes'], 'readwrite');
      for (const q of qs) {
        await tx.objectStore('questions').delete(q.id);
      }
      await tx.objectStore('quizzes').delete(id);
      await tx.done;
      setDeleteConfirm(null);
      if (selectedQuiz?.id === id) { setSelectedQuiz(null); setQuestions([]); }
      await loadQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuestionsLoading(true);
    setShowNewQuestion(false);
    try {
      const qs = await questionRepo.getAll().then(all => all.filter(q => q.quizId === quiz.id));
      setQuestions(qs.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error(err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    const { text, choice1, choice2, choice3, choice4, correctAnswer, explanation, duration } = newQuestion;
    if (!text.trim() || !choice1.trim() || !choice2.trim() || !choice3.trim() || !choice4.trim() || !correctAnswer.trim()) return;
    if (!selectedQuiz) return;

    try {
      const q: Question = {
        id: generateId(),
        quizId: selectedQuiz.id,
        level: selectedQuiz.level,
        subject: selectedQuiz.subject,
        text: text.trim(),
        choices: [choice1.trim(), choice2.trim(), choice3.trim(), choice4.trim()] as [string, string, string, string],
        correctAnswer: correctAnswer.trim(),
        explanation: explanation.trim() || undefined,
        duration: duration as any,
        order: questions.length + 1,
      };
      await questionRepo.create(q);
      const updatedQuiz = { ...selectedQuiz, questionCount: questions.length + 1, updatedAt: nowISO() };
      await quizRepo.update(updatedQuiz);
      setSelectedQuiz(updatedQuiz);
      setNewQuestion({ text: '', choice1: '', choice2: '', choice3: '', choice4: '', correctAnswer: '', explanation: '', duration: 30 });
      setQuestions(prev => [...prev, q]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await questionRepo.remove(questionId);
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      setQuestions(updatedQuestions);
      if (selectedQuiz) {
        const updatedQuiz = { ...selectedQuiz, questionCount: updatedQuestions.length, updatedAt: nowISO() };
        await quizRepo.update(updatedQuiz);
        setSelectedQuiz(updatedQuiz);
      }
      setDeleteQConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedExample = async () => {
    if (!activeProfile) { setSeedMessage("Veuillez d'abord créer un profil !"); return; }
    try {
      await seedExampleQuiz();
      await loadQuizzes();
      setSeedMessage("✅ Quiz d'exemple ajouté pour la 4ème année moyenne en Mathématiques !");
    } catch (err) {
      setSeedMessage("❌ Erreur lors de l'ajout");
      console.error(err);
    }
    setTimeout(() => setSeedMessage(null), 5000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }} dir="rtl">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          إدارة الأسئلة
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNewQuizForm(true)}>
            + اختبار جديد
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleSeedExample}>
            إضافة مثال (4 متوسط)
          </button>
        </div>
      </div>

      {/* Seed message */}
      {seedMessage && (
        <div className="feedback feedback-correct" style={{ animation: 'fadeIn 0.3s ease' }}>
          {seedMessage}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: '180px' }}
        >
          <option value="">كل المستويات</option>
          {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
        </select>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="input"
          style={{ width: 'auto', minWidth: '180px' }}
        >
          <option value="">كل المواد</option>
          {ALL_SUBJECTS.map(s => <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>)}
        </select>
      </div>

      {/* New quiz form */}
      {showNewQuizForm && (
        <div className="card" style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>اختبار جديد</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>العنوان</label>
              <input
                value={newQuiz.title}
                onChange={e => setNewQuiz({ ...newQuiz, title: e.target.value })}
                className="input"
                placeholder="مثلاً: اختبار الفصل الأول في الرياضيات"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>المستوى</label>
                <select
                  value={newQuiz.level}
                  onChange={e => setNewQuiz({ ...newQuiz, level: e.target.value as Level })}
                  className="input"
                >
                  {LEVELS.map(l => <option key={l} value={l}>{LEVEL_LABELS[l]}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>المادة</label>
                <select
                  value={newQuiz.subject}
                  onChange={e => setNewQuiz({ ...newQuiz, subject: e.target.value as Subject })}
                  className="input"
                >
                  {ALL_SUBJECTS.map(s => <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleCreateQuiz}>إنشاء</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowNewQuizForm(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Left: Quiz list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
            الاختبارات ({filteredQuizzes.length})
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: 0 }}>لا توجد اختبارات</p>
            </div>
          ) : (
            filteredQuizzes.map(quiz => (
              <div
                key={quiz.id}
                className="card"
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: selectedQuiz?.id === quiz.id
                    ? '2px solid var(--accent-primary)'
                    : '1px solid var(--border-default)',
                }}
                onClick={() => handleSelectQuiz(quiz)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {quiz.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                      {LEVEL_LABELS[quiz.level]} — {SUBJECT_LABELS[quiz.subject]} — {quiz.questionCount} سؤال
                    </p>
                  </div>
                  <button
                  className="btn-icon"
                  onClick={e => { e.stopPropagation(); setDeleteConfirm(quiz.id); }}
                  title="حذف"
                >
                  🗑️
                  </button>
                </div>
                {deleteConfirm === quiz.id && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                      حذف هذا الاختبار وكل أسئلته؟
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-xs"
                        onClick={e => { e.stopPropagation(); handleDeleteQuiz(quiz.id); }}>
                        تأكيد
                      </button>
                      <button className="btn btn-ghost btn-xs"
                        onClick={e => { e.stopPropagation(); setDeleteConfirm(null); }}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right: Questions panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedQuiz ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  أسئلة: {selectedQuiz.title}
                </h2>
                <button className="btn btn-primary btn-sm" onClick={() => setShowNewQuestion(!showNewQuestion)}>
                  + إضافة سؤال
                </button>
              </div>

              {showNewQuestion && (
                <div className="card" style={{ background: 'var(--surface-card)', animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    سؤال جديد
                  </h4>
                  <div>
                    <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      نص السؤال
                    </label>
                    <textarea
                      value={newQuestion.text}
                      onChange={e => setNewQuestion({ ...newQuestion, text: e.target.value })}
                      className="input"
                      style={{ resize: 'vertical', minHeight: '60px' }}
                      rows={2}
                      placeholder="اكتب السؤال هنا..."
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {(['choice1', 'choice2', 'choice3', 'choice4'] as const).map((key, i) => (
                      <div key={key}>
                        <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                          اختيار {i + 1}
                        </label>
                        <input
                          value={newQuestion[key]}
                          onChange={e => setNewQuestion({ ...newQuestion, [key]: e.target.value })}
                          className="input"
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                        الإجابة الصحيحة
                      </label>
                      <input
                        value={newQuestion.correctAnswer}
                        onChange={e => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                        className="input"
                        placeholder="يجب أن تطابق أحد الاختيارات"
                      />
                    </div>
                    <div style={{ width: '100px' }}>
                      <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                        المدة (ث)
                      </label>
                      <select
                        value={newQuestion.duration}
                        onChange={e => setNewQuestion({ ...newQuestion, duration: Number(e.target.value) })}
                        className="input"
                      >
                        {QUESTION_DURATIONS.map(d => <option key={d} value={d}>{d}s</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                      شرح (اختياري)
                    </label>
                    <input
                      value={newQuestion.explanation}
                      onChange={e => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={handleAddQuestion}>إضافة</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowNewQuestion(false)}>إلغاء</button>
                  </div>
                </div>
              )}

              {questionsLoading ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }}></div>
                </div>
              ) : questions.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '30px 20px' }}>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', margin: 0 }}>لا توجد أسئلة بعد</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <div key={q.id} className="card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                          <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px' }}>{i + 1}.</span>
                          {q.text}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                          {q.choices.map((c, ci) => (
                            <span
                              key={ci}
                              className="badge"
                              style={{
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                backgroundColor: c === q.correctAnswer
                                  ? 'var(--success-bg)'
                                  : 'var(--surface-card)',
                                color: c === q.correctAnswer
                                  ? 'var(--success-text)'
                                  : 'var(--text-secondary)',
                                border: c === q.correctAnswer
                                  ? '1px solid var(--success-border)'
                                  : '1px solid var(--border-default)',
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        {q.explanation && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {q.duration || 30}s
                        </span>
                        <button
                          className="btn-icon"
                          onClick={() => setDeleteQConfirm(q.id)}
                          title="حذف السؤال"
                          style={{ fontSize: '0.85rem', minHeight: '28px', minWidth: '28px' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {deleteQConfirm === q.id && (
                      <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border-light)' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 6px 0' }}>
                          حذف هذا السؤال؟
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-primary btn-xs"
                            onClick={() => handleDeleteQuestion(q.id)}>
                            تأكيد
                          </button>
                          <button className="btn btn-ghost btn-xs"
                            onClick={() => setDeleteQConfirm(null)}>
                            إلغاء
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="card" style={{
              textAlign: 'center',
              padding: '40px 20px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '0.95rem' }}>
                اختر اختباراً لعرض أسئلته
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Seed ───────────────────────────────────────────────────
async function seedExampleQuiz() {
  const db = await getDb();
  const existing = await db.getAllFromIndex('quizzes', 'by_level_subject', ['4_متوسط', 'الرياضيات']);
  if (existing.some(q => q.title.includes('مثال'))) return;

  const quizId = generateId();
  const now = nowISO();

  const quiz: Quiz = {
    id: quizId,
    title: 'مثال: تمارين الرياضيات للسنة الرابعة متوسط',
    level: '4_متوسط',
    subject: 'الرياضيات',
    questionCount: 5,
    defaultDuration: 30,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  const questions: Question[] = [
    {
      id: generateId(), quizId, level: '4_متوسط', subject: 'الرياضيات',
      text: 'ما هو حل المعادلة 2x + 5 = 13 ?',
      choices: ['4', '5', '6', '9'],
      correctAnswer: '4',
      explanation: '2x + 5 = 13 => 2x = 8 => x = 4',
      order: 1,
    },
    {
      id: generateId(), quizId, level: '4_متوسط', subject: 'الرياضيات',
      text: 'ما هو مجموع زوايا المثلث؟',
      choices: ['90°', '180°', '270°', '360°'],
      correctAnswer: '180°',
      explanation: 'مجموع زوايا أي مثلث هو 180 درجة',
      order: 2,
    },
    {
      id: generateId(), quizId, level: '4_متوسط', subject: 'الرياضيات',
      text: 'ما هو ناتج 25% من 200؟',
      choices: ['25', '50', '75', '100'],
      correctAnswer: '50',
      explanation: '25% تعني 25/100 = 0.25، و 0.25 × 200 = 50',
      order: 3,
    },
    {
      id: generateId(), quizId, level: '4_متوسط', subject: 'الرياضيات',
      text: 'إذا كان قطر دائرة يساوي 10 cm، فما هو نصف قطرها؟',
      choices: ['5 cm', '10 cm', '20 cm', '15 cm'],
      correctAnswer: '5 cm',
      explanation: 'نصف القطر = القطر ÷ 2 = 10 ÷ 2 = 5 cm',
      order: 4,
    },
    {
      id: generateId(), quizId, level: '4_متوسط', subject: 'الرياضيات',
      text: 'ما هو العدد الأولي من بين الأعداد التالية؟',
      choices: ['15', '21', '23', '27'],
      correctAnswer: '23',
      explanation: 'العدد الأولي هو الذي يقبل القسمة على نفسه وعلى 1 فقط',
      order: 5,
    },
  ];

  const tx = db.transaction(['quizzes', 'questions'], 'readwrite');
  await tx.objectStore('quizzes').add(quiz);
  for (const q of questions) {
    await tx.objectStore('questions').add(q);
  }
  await tx.done;
}
