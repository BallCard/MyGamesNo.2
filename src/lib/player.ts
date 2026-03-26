export const ANONYMOUS_ID_KEY = "zju-cat-merge:anonymous-id";

function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `anon-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getOrCreateAnonymousId(): string {
  const storage = getStorage();
  const existing = storage?.getItem(ANONYMOUS_ID_KEY)?.trim();
  if (existing) {
    return existing;
  }

  const nextId = randomId();
  storage?.setItem(ANONYMOUS_ID_KEY, nextId);
  return nextId;
}
