/**
 * Mélange des propositions (Fisher-Yates).
 * Retourne un nouveau tableau, ne mute pas l'original.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface ShuffledChoice {
  text: string;
  originalIndex: number;
}

export function shuffleChoices(choices: [string, string, string, string]): ShuffledChoice[] {
  const mapped: ShuffledChoice[] = choices.map((text, i) => ({ text, originalIndex: i }));
  return shuffleArray(mapped);
}
