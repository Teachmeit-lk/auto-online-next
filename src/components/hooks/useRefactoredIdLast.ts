"use client";

export function useRefactoredIdLast(prefix: string, firestoreId?: string) {
  if (!firestoreId) return "";

  const lastSix = firestoreId.slice(-6).toUpperCase();

  return `${prefix}-${lastSix}`;
}
