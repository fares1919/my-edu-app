export function nowISO(): string {
  return new Date().toISOString();
}

export function isInRange(date: string, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const d = new Date(date).getTime();
  if (from && d < new Date(from).getTime()) return false;
  if (to && d > new Date(to).getTime()) return false;
  return true;
}
