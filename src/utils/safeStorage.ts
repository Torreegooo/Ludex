/**
 * Safe LocalStorage Utility
 * Protects the app from QuotaExceededError, SecurityError (in restrictive iframes/sandboxes),
 * and JSON parsing exceptions.
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.warn(`[SafeStorage] Error reading "${key}":`, err);
      return null;
    }
  },

  getJSON: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (err) {
      console.warn(`[SafeStorage] Error parsing JSON for "${key}":`, err);
      return fallback;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: any) {
      console.warn(`[SafeStorage] QuotaExceeded or error setting "${key}":`, err);

      // Handle QuotaExceededError gracefully
      if (key === 'ludex_games') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            // Strip large base64 data URLs from offline cache to fit well within quota
            const compact = parsed.map((g: any) => ({
              ...g,
              images: Array.isArray(g.images)
                ? g.images
                    .map((img: string) =>
                      typeof img === 'string' && img.startsWith('data:image/') && img.length > 500
                        ? ''
                        : img
                    )
                    .filter(Boolean)
                : []
            }));
            localStorage.setItem(key, JSON.stringify(compact));
            return true;
          }
        } catch {
          // If still failing, remove the heavy cache key so other essential keys (auth, preferences) can work
          try {
            localStorage.removeItem('ludex_games');
          } catch {}
        }
      } else if (key === 'ludex_messages') {
        try {
          // Strip heavy image payloads from message offline cache
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object') {
            const stripped: Record<string, any[]> = {};
            for (const [convId, msgList] of Object.entries(parsed)) {
              if (Array.isArray(msgList)) {
                stripped[convId] = msgList.map((m: any) => ({
                  ...m,
                  imageUrl: typeof m.imageUrl === 'string' && m.imageUrl.startsWith('data:image/') ? undefined : m.imageUrl
                }));
              }
            }
            localStorage.setItem(key, JSON.stringify(stripped));
            return true;
          }
        } catch {
          try {
            localStorage.removeItem('ludex_messages');
          } catch {}
        }
      }

      return false;
    }
  },

  setJSON: (key: string, value: any): boolean => {
    try {
      return safeStorage.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[SafeStorage] Error removing "${key}":`, err);
    }
  },

  clearNonEssentialCaches: (): void => {
    try {
      localStorage.removeItem('ludex_games');
      localStorage.removeItem('ludex_messages');
    } catch {}
  }
};
