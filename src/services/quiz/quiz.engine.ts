import type { Question } from '../../types/question';
import type { QuizSession, SessionAnswer } from '../../types/session';
import type { Quiz } from '../../types/quiz';
import { generateId } from '../../utils/ids';
import { nowISO } from '../../utils/dates';
import { shuffleChoices, type ShuffledChoice } from './quiz.shuffle';
import { calculateSessionResult, determineCorrectness } from './quiz.scoring';

export interface QuizEngineState {
  session: QuizSession;
  currentQuestionIndex: number;
  questions: Question[];
  answers: SessionAnswer[];
  shuffledChoices: ShuffledChoice[][]; // une par question
  isFinished: boolean;
}

export function createQuizEngine(
  quiz: Quiz,
  questions: Question[],
  profileId: string
): QuizEngineState {
  const now = nowISO();
  const session: QuizSession = {
    id: generateId(),
    profileId,
    quizId: quiz.id,
    level: quiz.level,
    subject: quiz.subject,
    startedAt: now,
    totalQuestions: questions.length,
    correctCount: 0,
    wrongCount: 0,
    score: 0,
    totalDuration: 0,
    averageTimePerQuestion: 0,
  };

  // Pré-mélanger les propositions pour chaque question
  const shuffledChoices = questions.map(q => shuffleChoices(q.choices));

  return {
    session,
    currentQuestionIndex: 0,
    questions,
    answers: [],
    shuffledChoices,
    isFinished: false,
  };
}

export function answerQuestion(
  state: QuizEngineState,
  selectedAnswer: string | undefined,
  timeSpent: number
): QuizEngineState {
  const { currentQuestionIndex, session, questions, answers, shuffledChoices } = state;
  const question = questions[currentQuestionIndex];
  if (!question) return state;

  const isCorrect = determineCorrectness(selectedAnswer, question.correctAnswer);

  const answer: SessionAnswer = {
    id: generateId(),
    sessionId: session.id,
    questionId: question.id,
    selectedAnswer,
    isCorrect,
    answeredAt: nowISO(),
    timeSpent,
  };  

  const newAnswers = [...answers, answer];
  const newCorrectCount = session.correctCount + (isCorrect ? 1 : 0);
  const newWrongCount = session.wrongCount + (isCorrect ? 0 : 1);
  const newTotalDuration = session.totalDuration + timeSpent;
  const newIndex = currentQuestionIndex + 1;
  const isFinished = newIndex >= questions.length;

  const result = calculateSessionResult(newCorrectCount, newWrongCount, newTotalDuration);

  return {
    ...state,
    currentQuestionIndex: newIndex,
    answers: newAnswers,
    session: {
      ...session,
      correctCount: result.correctCount,
      wrongCount: result.wrongCount,
      score: result.score,
      totalDuration: result.totalDuration,
      averageTimePerQuestion: result.averageTimePerQuestion,
      finishedAt: isFinished ? nowISO() : undefined,
    },
    isFinished,
  };
}

export function getCurrentQuestion(state: QuizEngineState): Question | null {
  if (state.isFinished || state.currentQuestionIndex >= state.questions.length) {
    return null;
  }
  return state.questions[state.currentQuestionIndex];
}

export function getCurrentShuffledChoices(state: QuizEngineState): ShuffledChoice[] | null {
  if (state.isFinished || state.currentQuestionIndex >= state.shuffledChoices.length) {
    return null;
  }
  return state.shuffledChoices[state.currentQuestionIndex];
}
