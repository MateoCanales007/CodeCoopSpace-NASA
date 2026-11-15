import { useCallback, useEffect, useRef, useState } from 'react';

import { rotationApi } from '../api';
import type { CompareResponse, Priority } from '../api/types';
import { PRIORITIES } from '../constants/domain';
import type { Language } from '../i18n';
import type { Answers } from '../types/answers';

/** What happened to the highlighted rotation when the farmer moved the priority. */
export interface PriorityChange {
  currentScenarioId: string;
  /** null when the same rotation still stands out. */
  previousScenarioId: string | null;
  previousPriority: Priority;
}

interface ComparisonState {
  data: CompareResponse | null;
  /** true while a request is in flight (first load or refresh). */
  loading: boolean;
  failed: boolean;
  change: PriorityChange | null;
  reload: () => void;
}

/**
 * Requests the comparison for the current answers and re-requests it when the
 * priority, the soil answers or the language change. Out-of-date responses are
 * dropped, and the previous result stays on screen while refreshing.
 */
export function useComparison(answers: Answers, priority: Priority, language: Language): ComparisonState {
  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [change, setChange] = useState<PriorityChange | null>(null);
  const previous = useRef<{ data: CompareResponse; priority: Priority } | null>(null);
  const latestRequest = useRef(0);
  const { siteId, crop, texture, drainage } = answers;

  const reload = useCallback(async () => {
    if (!siteId || !crop) return;
    const requestId = ++latestRequest.current;
    setLoading(true);
    setFailed(false);
    try {
      const response = await rotationApi.compareRotations(
        {
          siteId,
          currentCrop: crop,
          soil: { texture, drainage },
          priorities: [priority, ...PRIORITIES.filter((item) => item !== priority)],
        },
        language,
      );
      if (requestId !== latestRequest.current) return;

      const before = previous.current;
      if (before && before.priority !== priority && response.highlight) {
        const currentId = response.highlight.scenarioId;
        const previousId = before.data.highlight?.scenarioId ?? null;
        setChange({
          currentScenarioId: currentId,
          previousScenarioId: previousId && previousId !== currentId ? previousId : null,
          previousPriority: before.priority,
        });
      }
      previous.current = { data: response, priority };
      setData(response);
    } catch (error) {
      console.warn('[Yago] Comparison failed.', error);
      if (requestId === latestRequest.current) setFailed(true);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [siteId, crop, texture, drainage, priority, language]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, failed, change, reload };
}
