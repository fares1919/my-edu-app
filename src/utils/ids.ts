/**
 * Génère un identifiant unique local avec repli robuste.
 * Utilise crypto.randomUUID() si disponible (https, modern browsers),
 * sinon fallback sur Math.random() + timestamp.
 */
export function generateId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fallback silencieux
  }
  // Fallback: timestamp + random
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const extra = Math.random().toString(36).substring(2, 6);
  return `${timestamp}-${random}${extra}`;
}
