/// <reference types="node" />
/**
 * Saves real answers of a running backend as JSON examples in docs/examples,
 * so the documentation never drifts from what the server returns.
 *
 *   npm run examples:api                         → http://127.0.0.1:8000
 *   npm run examples:api -- http://10.0.0.5:8000 → another host
 *
 * Every answer is validated with the same code the app uses before it is written.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeCompareResponse, normalizeSites } from '../src/api/normalize';
import type { CompareRequest } from '../src/api/types';

const baseUrl = (process.argv[2] ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'examples');

const request: CompareRequest = {
  siteId: 'san-miguel',
  currentCrop: 'sorghum',
  soil: { texture: 'unknown', drainage: 'good' },
  priorities: ['diversification', 'water', 'soil'],
};

async function call(path: string, language: 'en' | 'es', body?: unknown): Promise<unknown> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': language },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${path} → HTTP ${response.status}`);
  return response.json();
}

const write = (name: string, value: unknown) => {
  writeFileSync(join(outputDir, name), `${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote docs/examples/${name}`);
};

async function main() {
  mkdirSync(outputDir, { recursive: true });

  const sites = await call('/v1/sites', 'en');
  normalizeSites(sites, '/v1/sites');
  write('sites.response.json', sites);
  write('compare.request.json', request);

  for (const [language, name] of [['en', 'compare.response.json'], ['es', 'compare.response.es.json']] as const) {
    const response = await call('/v1/compare', language, request);
    normalizeCompareResponse(response, '/v1/compare');
    write(name, response);
  }
}

main().catch((error) => {
  console.error(`Could not write the examples from ${baseUrl}: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
