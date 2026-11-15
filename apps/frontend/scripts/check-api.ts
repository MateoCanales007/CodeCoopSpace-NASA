/// <reference types="node" />
/**
 * Checks a running backend against what this frontend expects.
 *
 *   npm run check:api                         → http://127.0.0.1:8000
 *   npm run check:api -- http://10.0.0.5:8000 → another host
 *
 * It calls the endpoints of docs/CONTRATO.md, runs every response through the
 * same validation the app uses (src/api/normalize.ts) and lists which optional
 * fields are still missing. Exit code 1 means a required check failed.
 */
import { normalizeCompareResponse, normalizeSites } from '../src/api/normalize';
import type { CompareRequest } from '../src/api/types';

const baseUrl = (process.argv[2] ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const headers = { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': 'en' };

const SAMPLE_REQUEST: CompareRequest = {
  siteId: 'san-miguel-demo',
  currentCrop: 'maize',
  soil: { texture: 'unknown', drainage: 'unknown' },
  priorities: ['water', 'soil', 'diversification'],
};

/** Fields this frontend proposes on top of the agreed contract. The app works without them. */
const OPTIONAL_RESPONSE_FIELDS = ['isDemo', 'highlight'];
const OPTIONAL_SCENARIO_FIELDS = ['role', 'summary', 'limitation', 'missingData', 'sourceIds'];
const OPTIONAL_CLIMATE_FIELDS = ['alert', 'note'];

let failures = 0;
const pass = (message: string) => console.log(`  ok    ${message}`);
const warn = (message: string) => console.log(`  note  ${message}`);
const fail = (message: string) => {
  failures++;
  console.log(`  FAIL  ${message}`);
};

async function call(path: string, init?: RequestInit): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
  return { status: response.status, body: await response.json().catch(() => null) };
}

const missing = (value: unknown, fields: string[]) => fields.filter((field) => typeof value !== 'object' || value === null || !(field in value));

async function checkHealth() {
  const { status } = await call('/health');
  if (status === 200) pass('GET /health → 200');
  else fail(`GET /health → ${status} (expected 200)`);
}

async function checkSites(): Promise<string | null> {
  const path = '/v1/sites';
  const { status, body } = await call(path);
  if (status !== 200) {
    fail(`GET ${path} → ${status} (expected 200)`);
    return null;
  }
  try {
    const sites = normalizeSites(body, path);
    pass(`GET ${path} → ${sites.length} site(s): ${sites.map((site) => site.id).join(', ')}`);
    if (!sites.some((site) => site.id === SAMPLE_REQUEST.siteId)) warn(`"${SAMPLE_REQUEST.siteId}" is not listed; the comparison check uses "${sites[0]?.id}"`);
    return sites.find((site) => site.id === SAMPLE_REQUEST.siteId)?.id ?? sites[0]?.id ?? null;
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function checkCompare(siteId: string) {
  const path = '/v1/compare';
  const { status, body } = await call(path, { method: 'POST', body: JSON.stringify({ ...SAMPLE_REQUEST, siteId }) });
  if (status !== 200) {
    fail(`POST ${path} → ${status} (expected 200): ${JSON.stringify(body)}`);
    return;
  }
  try {
    const result = normalizeCompareResponse(body, path);
    pass(`POST ${path} → ${result.scenarios.length} scenario(s), climate "${result.climate.status}", ${result.sources.length} source(s)`);
    if (result.scenarios.filter((scenario) => scenario.role === 'alternative').length < 2) warn('the UI is designed for the current rotation plus two alternatives');
    if (!result.sources.some((source) => source.kind === 'nasa')) warn('no source with kind "nasa": the NASA chip and link will not show');

    const raw = body as { scenarios: unknown[]; climate: unknown };
    const absent = [
      ...missing(body, OPTIONAL_RESPONSE_FIELDS),
      ...missing(raw.scenarios[0], OPTIONAL_SCENARIO_FIELDS).map((field) => `scenarios[].${field}`),
      ...missing(raw.climate, OPTIONAL_CLIMATE_FIELDS).map((field) => `climate.${field}`),
    ];
    if (absent.length > 0) warn(`optional fields not sent yet (the UI hides those parts): ${absent.join(', ')}`);
    else pass('every optional field is present');
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
}

async function checkValidation(siteId: string) {
  const path = '/v1/compare';
  const duplicated = await call(path, { method: 'POST', body: JSON.stringify({ ...SAMPLE_REQUEST, siteId, priorities: ['water', 'water'] }) });
  if (duplicated.status === 422) pass('duplicated priorities → 422');
  else fail(`duplicated priorities → ${duplicated.status} (expected 422)`);

  const unknownSite = await call(path, { method: 'POST', body: JSON.stringify({ ...SAMPLE_REQUEST, siteId: 'does-not-exist' }) });
  if (unknownSite.status === 422) pass('unsupported site → 422');
  else fail(`unsupported site → ${unknownSite.status} (expected 422)`);
}

async function main() {
  console.log(`Checking ${baseUrl}`);
  try {
    await checkHealth();
    const siteId = await checkSites();
    if (siteId) {
      await checkCompare(siteId);
      await checkValidation(siteId);
    }
  } catch (error) {
    fail(`could not reach the server: ${error instanceof Error ? error.message : String(error)}`);
  }
  console.log(failures === 0 ? 'All required checks passed.' : `${failures} required check(s) failed.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main();
