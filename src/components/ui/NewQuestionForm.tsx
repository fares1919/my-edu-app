import { useState } from 'react';
import { generateId } from '../../utils/ids';
import { nowISO } from '../../utils/dates';
import { questionRepo } from '../../services/db/repositories/questions.repo';
import { quizRepo } from '../../services/db/repositories/quizzes.repo';
import type { Question } from '../../types/question';
import type { Quiz } from '../../types/quiz';

const QUESTION_DURATIONS = [15, 20, 30, 45, 60, 90, 120];

interface NewQuestionFormProps {
  show: boolean;
  onClose: () => void;
  onAdded: (question: Question) => void;
  selectedQuiz: Quiz | null;
  nextOrder: number;
}

interface NewQuestionState {
  text: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correctAnswer: string;
  explanation: string;
  duration: number;
}

const INITIAL_STATE: NewQuestionState = {
  text: '',
  choice1: '', choice2: '', choice3: '', choice4: '',
  correctAnswer: '',
  explanation: '',
  duration: 30,
};

type ChoiceKey = 'choice1' | 'choice2' | 'choice3' | 'choice4';

export function NewQuestionForm({ show, onClose, onAdded, selectedQuiz, nextOrder }: NewQuestionFormProps) {
  const [newQuestion, setNewQuestion] = useState<NewQuestionState>(INITIAL_STATE);

  if (!show) return null;

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
        order: nextOrder,
      };
      await questionRepo.create(q);
      const updatedQuiz = { ...selectedQuiz, questionCount: nextOrder, updatedAt: nowISO() };
      await quizRepo.update(updatedQuiz);
      setNewQuestion(INITIAL_STATE);
      onAdded(q);
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
        <button className="btn btn-ghost btn-sm" onClick={onClose}>إلغاء</button>
      </div>
    </div>
  );
}
