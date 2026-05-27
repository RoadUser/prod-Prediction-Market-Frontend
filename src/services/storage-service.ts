export default class StorageService {
  static get<T = unknown>(key: string, fallback: T | null = null): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  static set(key: string, value: unknown): void {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  static remove(key: string): void {
    try { localStorage.removeItem(key); } catch {}
  }
}
