/**
 * Utilitaires pour la gestion RTL.
 * Les icônes directionnelles doivent être miroitées en RTL.
 */

// Liste des icônes qui doivent être miroitées en RTL
const DIRECTIONAL_ICONS = new Set([
  'arrow-left', 'arrow-right',
  'chevron-left', 'chevron-right',
  'arrow-back', 'arrow-forward',
  'caret-left', 'caret-right',
  'angle-left', 'angle-right',
]);

export function isDirectionalIcon(iconName: string): boolean {
  return DIRECTIONAL_ICONS.has(iconName);
}

export function getDirectionalIcon(iconName: string, isRtl: boolean): string {
  if (!DIRECTIONAL_ICONS.has(iconName)) return iconName;
  // Miroiter: left <-> right, back <-> forward
  const mirror: Record<string, string> = {
    'arrow-left': 'arrow-right',
    'arrow-right': 'arrow-left',
    'chevron-left': 'chevron-right',
    'chevron-right': 'chevron-left',
    'arrow-back': 'arrow-forward',
    'arrow-forward': 'arrow-back',
    'caret-left': 'caret-right',
    'caret-right': 'caret-left',
    'angle-left': 'angle-right',
    'angle-right': 'angle-left',
  };
  return isRtl ? (mirror[iconName] || iconName) : iconName;
}
