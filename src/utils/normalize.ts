/**
 * Normalisation des valeurs textuelles.
 */

export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeArabicText(value: string): string {
  return normalizeText(value)
    .replace(/[ىي]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي');
}

export function trimAll(values: string[]): string[] {
  return values.map(v => v.trim());
}
