import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { isWeb } from '../theme';
import { en } from './en';
import type { Translations } from './en';
import { es } from './es';
import { readStoredLanguage, storeLanguage } from './storage';
import { DEFAULT_LANGUAGE } from './types';
import type { Language } from './types';

export const translations: Record<Language, Translations> = { en, es };

interface LanguageContextValue {
  language: Language;
  /** Strings for the current language. */
  t: Translations;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  t: translations[DEFAULT_LANGUAGE],
  setLanguage: () => {},
});

/** Owns the current language: English by default, Spanish one tap away. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    storeLanguage(next);
  }, []);

  // Keep the page language and title in sync for screen readers and browser tabs.
  useEffect(() => {
    if (!isWeb || typeof document === 'undefined') return;
    document.documentElement.lang = language;
    document.title = translations[language].documentTitle;
  }, [language]);

  const value = useMemo(() => ({ language, t: translations[language], setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  return useContext(LanguageContext);
}
