/**
 * Calcul du score et des statistiques de session.
 */

export interface SessionResult {
  correctCount: number;
  wrongCount: number;
  totalQuestions: number;
  score: number; // 0-100
  totalDuration: number;
  averageTimePerQuestion: number;
}

export function calculateSessionResult(
  correctCount: number,
  wrongCount: number,
  totalDuration: number
): SessionResult {
  const totalQuestions = correctCount + wrongCount;
  return {
    correctCount,
    wrongCount,
    totalQuestions,
    score: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
    totalDuration,
    averageTimePerQuestion: totalQuestions > 0 ? Math.round(totalDuration / totalQuestions) : 0,
  };
}

export function determineCorrectness(
  selectedAnswer: string | undefined,
  correctAnswer: string
): boolean {
  if (!selectedAnswer) return false;
  return selectedAnswer.trim() === correctAnswer.trim();
}
