/// <reference types="node" />
/**
 * Regenerates the JSON examples in docs/examples from the demo data, so the
 * documentation never drifts from what the app actually renders.
 *
 *   npm run examples:api
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildDemoComparison } from '../src/api/demo/compare';
import { DEMO_SITES } from '../src/api/demo/sites';
import { normalizeCompareResponse, normalizeSites } from '../src/api/normalize';
import type { CompareRequest } from '../src/api/types';

const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'examples');

const request: CompareRequest = {
  siteId: 'san-miguel-demo',
  currentCrop: 'maize',
  soil: { texture: 'unknown', drainage: 'unknown' },
  priorities: ['water', 'soil', 'diversification'],
};

const write = (name: string, value: unknown) => {
  writeFileSync(join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote docs/examples/${name}`);
};

mkdirSync(outputDir, { recursive: true });

const response = buildDemoComparison(request, 'en');
// The examples must pass the same validation the app applies to the real API.
normalizeSites(DEMO_SITES, '/v1/sites');
normalizeCompareResponse(response, '/v1/compare');

write('sites.response.json', DEMO_SITES);
write('compare.request.json', request);
write('compare.response.json', response);
write('compare.response.es.json', buildDemoComparison(request, 'es'));

// Smallest response the UI accepts: only what docs/CONTRATO.md lists, no proposed extensions.
const minimal = {
  climate: { status: response.climate.status, period: response.climate.period, coverage: response.climate.coverage, metrics: response.climate.metrics, sourceId: response.climate.sourceId, spatialScale: null, cacheAgeHours: null },
  scenarios: response.scenarios.map(({ id, sequence, criteria }) => ({ id, sequence, criteria })),
  sources: response.sources,
  warnings: response.warnings,
  methodVersion: response.methodVersion,
};
normalizeCompareResponse(minimal, '/v1/compare');
write('compare.response.minimal.json', minimal);
