/**
 * Détection du séparateur CSV (point-virgule ou virgule).
 * Analyse la première ligne du fichier.
 */
export function detectSeparator(firstLine: string): string | null {
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;

  if (semicolonCount >= commaCount && semicolonCount > 0) return ';';
  if (commaCount > 0) return ',';
  return null; // non reconnu
}
