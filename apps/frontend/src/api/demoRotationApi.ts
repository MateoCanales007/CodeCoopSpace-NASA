import { buildDemoComparison } from './demo/compare';
import { DEMO_SITES } from './demo/sites';
import type { RotationApi } from './rotationApi';

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Answers from the bundled demo data so the whole flow works with the backend off.
 * The small delays keep loading states visible and honest.
 */
export function createDemoRotationApi({ sitesDelayMs = 250, compareDelayMs = 450 } = {}): RotationApi {
  return {
    async listSites() {
      await wait(sitesDelayMs);
      return DEMO_SITES;
    },
    async compareRotations(request, language) {
      await wait(compareDelayMs);
      return buildDemoComparison(request, language);
    },
  };
}
