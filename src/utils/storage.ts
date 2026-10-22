/**
 * Safe localStorage utility with quota-exceeded protection and automatic cleanup.
 */

export const safeStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.warn(`[LUDEX STORAGE] Error reading key "${key}":`, err);
    return null;
  }
};

export const safeStorageSet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[LUDEX STORAGE] Failed to set "${key}". Attempting cleanup:`, err);
    
    // If quota exceeded, clean up non-essential keys
    try {
      // Remove bloated legacy keys
      localStorage.removeItem('ludex_games');
      localStorage.removeItem('ludex_notifications');
      
      // Retry once after cleanup
      localStorage.setItem(key, value);
      return true;
    } catch (retryErr) {
      console.warn(`[LUDEX STORAGE] Storage still full after cleanup for key "${key}":`, retryErr);
      return false;
    }
  }
};

export const safeStorageRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[LUDEX STORAGE] Error removing key "${key}":`, err);
  }
};

/**
 * Specifically handles game listings storage safely without hitting the 5MB quota.
 * Only user-created or modified games need to be kept in localStorage,
 * as DEMO_SEED_GAMES are already bundled in the code and backend server.
 */
export const safeSaveGames = (games: any[], demoIds: Set<string>): void => {
  try {
    // Only store custom user listings (not the 70+ default seed games)
    const customGames = games.filter(g => g && g.id && !demoIds.has(g.id));
    
    // Clean up bloated legacy 'ludex_games' key to release quota
    if (localStorage.getItem('ludex_games')) {
      localStorage.removeItem('ludex_games');
    }
    
    localStorage.setItem('ludex_custom_games', JSON.stringify(customGames));
  } catch (err) {
    console.warn('[LUDEX STORAGE] Could not save custom games:', err);
  }
};
