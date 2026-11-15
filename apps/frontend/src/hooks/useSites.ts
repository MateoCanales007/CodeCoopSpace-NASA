import { useEffect, useState } from 'react';

import { rotationApi } from '../api';
import type { Site } from '../api/types';
import type { Language } from '../i18n';

/** Loads the supported sites once per language. The app opens directly: no accounts, no session. */
export function useSites(language: Language): Site[] {
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    let active = true;
    rotationApi
      .listSites(language)
      .then((list) => active && setSites(list))
      .catch((error) => console.warn('[Yago] Could not load sites.', error));
    return () => {
      active = false;
    };
  }, [language]);

  return sites;
}
