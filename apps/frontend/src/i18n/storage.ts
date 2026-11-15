import { DEFAULT_LANGUAGE } from './types';
import type { Language } from './types';

const STORAGE_KEY = 'yago.language';

/**
 * The chosen language is remembered per browser (web only). On native, or when
 * storage is blocked, the choice simply lasts for the session.
 */
export function readStoredLanguage(): Language {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    return stored === 'en' || stored === 'es' ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function storeLanguage(language: Language): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // No storage available: nothing to persist.
  }
}
