export function refactoredIdLast(prefix: string, rawId?: string | null) {
  if (!rawId) return "N/A";

  const cleaned = String(rawId).replace(/[^a-zA-Z0-9]/g, "");

  const last = cleaned.slice(-6).toUpperCase();

  return `${prefix}-${last}`;
}
