import { useCallback, useEffect, useState } from 'react';

import { rotationApi } from '../api';
import type { Site } from '../api/types';
import type { Language } from '../i18n';

export interface SitesState {
  sites: Site[];
  loading: boolean;
  /** true when the server could not be reached; `reload` tries again. */
  failed: boolean;
  reload: () => void;
}

/** Loads the supported areas from the server. The app opens directly: no accounts, no session. */
export function useSites(language: Language): SitesState {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFailed(false);
    rotationApi
      .listSites(language)
      .then((list) => active && setSites(list))
      .catch((error) => {
        console.warn('[Yago] Could not load the areas.', error);
        if (active) setFailed(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [language, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { sites, loading, failed, reload };
}
