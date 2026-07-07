import { useState } from 'react';
import { LEVELS, LEVEL_LABELS } from '../../constants/levels';
import { ALL_SUBJECTS, SUBJECT_LABELS } from '../../constants/subjects';
import { generateId } from '../../utils/ids';
import { nowISO } from '../../utils/dates';
import { quizRepo } from '../../services/db/repositories/quizzes.repo';
import type { Quiz } from '../../types/quiz';
import type { Level, Subject } from '../../types/subject';

interface NewQuizFormProps {
  show: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const INITIAL_STATE = { title: '', level: '4_متوسط' as Level, subject: 'الرياضيات' as Subject };

export function NewQuizForm({ show, onClose, onCreated }: NewQuizFormProps) {
  const [newQuiz, setNewQuiz] = useState(INITIAL_STATE);

  if (!show) return null;

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
      setNewQuiz(INITIAL_STATE);
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
          <button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
