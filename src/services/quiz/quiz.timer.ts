/**
 * Gestion du minuteur par question.
 */

export interface TimerState {
  remaining: number;  // secondes restantes
  isRunning: boolean;
  isExpired: boolean;
}

export function createTimer(durationSeconds: number): TimerState {
  return {
    remaining: durationSeconds,
    isRunning: false,
    isExpired: false,
  };
}

export function tickTimer(state: TimerState): TimerState {
  if (!state.isRunning || state.isExpired) return state;
  const newRemaining = state.remaining - 1;
  if (newRemaining <= 0) {
    return { remaining: 0, isRunning: false, isExpired: true };
  }
  return { ...state, remaining: newRemaining };
}

export function getEffectiveDuration(
  questionDuration: number | undefined,
  quizDefaultDuration: number
): number {
  return questionDuration ?? quizDefaultDuration;
}
