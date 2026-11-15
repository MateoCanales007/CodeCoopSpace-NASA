import { useEffect, useState } from 'react';

import { rotationApi } from '../api';
import { unavailableComplementaryClimate } from '../api/complementaryClimate';
import type { ComplementaryClimate, ComplementaryClimateQuery } from '../api/types';
import type { Language } from '../i18n';

interface ComplementaryClimateState {
  data: ComplementaryClimate | null;
  loading: boolean;
}

/**
 * Loads the complementary weather (Meteomatics) for a point and a period.
 * It is independent from the comparison: a failure here never blocks the results.
 * Pass `null` while the point or the period are not known yet; nothing is requested.
 */
export function useComplementaryClimate(query: ComplementaryClimateQuery | null, language: Language): ComplementaryClimateState {
  const [data, setData] = useState<ComplementaryClimate | null>(null);
  const [loading, setLoading] = useState(true);
  const ready = query !== null;
  const { latitude, longitude, start, end } = query ?? {};

  useEffect(() => {
    if (!ready) return;
    let active = true;
    setLoading(true);
    rotationApi
      .getComplementaryClimate({ latitude, longitude, start, end }, language)
      .then((result) => active && setData(result))
      .catch((error) => {
        console.warn('[Yago] Could not load the complementary weather.', error);
        // No figures are made up: the card explains that the server did not answer.
        if (active) setData(unavailableComplementaryClimate('unreachable', { start, end }));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [ready, latitude, longitude, start, end, language]);

  return { data, loading };
}
