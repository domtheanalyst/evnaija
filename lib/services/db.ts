/**
 * Tiny localStorage-backed store used by the mock services.
 *
 * Everything the app "writes" (bookings, orders, emergency requests, session)
 * lives here so state survives a page reload. When a real API is wired in,
 * only the service bodies change — this module can be deleted.
 */

const PREFIX = "evnaija:";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readCollection<T>(key: string, fallback: T[] = []): T[] {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function writeCollection<T>(key: string, value: T[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota exceeded or private mode — mock data is non-critical */
  }
}

export function readValue<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeValue<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeValue(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  bookings: "bookings",
  orders: "orders",
  emergency: "emergency",
  session: "session",
  users: "users",
  cart: "cart",
  location: "location",
} as const;