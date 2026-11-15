export type Language = 'en' | 'es';

export const DEFAULT_LANGUAGE: Language = 'es';

export const LANGUAGES: { id: Language; short: string; label: string }[] = [
  { id: 'en', short: 'EN', label: 'English' },
  { id: 'es', short: 'ES', label: 'Español' },
];

/** Welcome scenes; each one has a name and a caption in every language. */
export type SceneKey = 'jaguarundi' | 'cornfield' | 'hen' | 'coffee' | 'cow' | 'chili';
