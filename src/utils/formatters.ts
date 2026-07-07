/**
 * Formateurs pour l'affichage des données en arabe.
 */

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} ثانية`;
  if (secs === 0) return `${mins} دقيقة`;
  return `${mins} دقيقة و ${secs} ثانية`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatShortDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}ث`;
  return formatDuration(seconds);
}
