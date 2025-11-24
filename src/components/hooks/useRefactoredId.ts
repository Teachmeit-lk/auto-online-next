"use client";

export function useRefactoredId(
  prefix: string,
  firestoreId: string | undefined
) {
  if (!firestoreId) return "";

  const shortId = firestoreId.slice(0, 5).toUpperCase();

  return `${prefix}-${shortId}`;
}
