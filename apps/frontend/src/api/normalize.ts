/**
 * Boundary between the backend JSON and the UI.
 *
 * Required fields (the ones in docs/CONTRATO.md) are checked, and a missing
 * one fails with a message that names it, so a contract mismatch is obvious
 * in the console. Fields this frontend proposes on top of the contract are
 * optional: when the backend does not send them yet, a safe default is used
 * and the UI simply hides that piece.
 */
import { ApiError } from './ApiError';
import type { Climate, CompareResponse, Criterion, Priority, Scenario, Site, Source } from './types';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value);

function fail(path: string, problem: string): never {
  throw new ApiError(`Response of ${path} does not match the contract: ${problem}`, 0, path);
}

function requireArray(parent: Json, key: string, path: string): unknown[] {
  const value = parent[key];
  if (!Array.isArray(value)) fail(path, `"${key}" must be an array`);
  return value;
}

function requireString(parent: Json, key: string, path: string, where: string): string {
  const value = parent[key];
  if (typeof value !== 'string') fail(path, `"${where}.${key}" must be a string`);
  return value;
}

const optionalString = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);

export function normalizeSites(payload: unknown, path: string): Site[] {
  if (!Array.isArray(payload)) fail(path, 'expected an array of sites');
  return payload.map((item, index) => {
    if (!isObject(item)) fail(path, `sites[${index}] must be an object`);
    return {
      id: requireString(item, 'id', path, `sites[${index}]`),
      name: requireString(item, 'name', path, `sites[${index}]`),
      department: optionalString(item.department) ?? '',
      approxLat: Number(item.approxLat),
      approxLon: Number(item.approxLon),
      // Optional catalog: without it the wizard offers every crop.
      crops: Array.isArray(item.crops) ? (item.crops as Site['crops']) : ['maize', 'bean', 'sorghum'],
      isDemo: item.isDemo === true,
    };
  });
}

function normalizeCriterion(item: unknown, path: string, where: string): Criterion {
  if (!isObject(item)) fail(path, `${where} must be an object`);
  const level = item.level === 'favorable' || item.level === 'neutral' || item.level === 'unfavorable' ? item.level : null;
  return {
    priority: requireString(item, 'priority', path, where) as Criterion['priority'],
    status: item.status === 'undetermined' || level === null ? 'undetermined' : 'evaluable',
    level,
    value: typeof item.value === 'number' ? item.value : null,
    unit: optionalString(item.unit),
    reason: optionalString(item.reason) ?? '',
    evidence: Array.isArray(item.evidence) ? (item.evidence as string[]) : [],
  };
}

function normalizeScenario(item: unknown, path: string, index: number): Scenario {
  const where = `scenarios[${index}]`;
  if (!isObject(item)) fail(path, `${where} must be an object`);
  const sequence = requireArray(item, 'sequence', path) as Scenario['sequence'];
  const criteria = requireArray(item, 'criteria', path).map((criterion, criterionIndex) => normalizeCriterion(criterion, path, `${where}.criteria[${criterionIndex}]`));
  // Proposed extension: without `role`, repeating the same crop is the current rotation.
  const repeatsCrop = sequence.length > 1 && sequence.every((crop) => crop === sequence[0]);
  return {
    id: requireString(item, 'id', path, where),
    role: item.role === 'current' || item.role === 'alternative' ? item.role : repeatsCrop ? 'current' : 'alternative',
    sequence,
    summary: optionalString(item.summary) ?? '',
    limitation: optionalString(item.limitation) ?? '',
    missingData: optionalString(item.missingData),
    criteria,
    sourceIds: Array.isArray(item.sourceIds) ? (item.sourceIds as string[]) : Array.from(new Set(criteria.flatMap((criterion) => criterion.evidence))),
  };
}

function normalizeClimate(value: unknown, path: string): Climate {
  if (!isObject(value)) fail(path, '"climate" must be an object');
  const period = isObject(value.period) ? value.period : {};
  const coverage = isObject(value.coverage) ? value.coverage : {};
  const alert = isObject(value.alert) && typeof value.alert.text === 'string' ? { priority: value.alert.priority as Priority, text: value.alert.text } : null;
  return {
    status: value.status === 'available' || value.status === 'partial' ? value.status : 'unavailable',
    period: { start: optionalString(period.start) ?? '', end: optionalString(period.end) ?? '' },
    coverage: { validDays: Number(coverage.validDays ?? 0), expectedDays: Number(coverage.expectedDays ?? 0) },
    metrics: Array.isArray(value.metrics) ? (value.metrics as Climate['metrics']) : [],
    sourceId: optionalString(value.sourceId) ?? '',
    spatialScale: optionalString(value.spatialScale),
    cacheAgeHours: typeof value.cacheAgeHours === 'number' ? value.cacheAgeHours : null,
    alert,
    note: optionalString(value.note) ?? '',
  };
}

export function normalizeCompareResponse(payload: unknown, path: string): CompareResponse {
  if (!isObject(payload)) fail(path, 'expected an object');
  const scenarios = requireArray(payload, 'scenarios', path).map((scenario, index) => normalizeScenario(scenario, path, index));
  const highlight = isObject(payload.highlight) && typeof payload.highlight.scenarioId === 'string' ? payload.highlight : null;
  return {
    isDemo: payload.isDemo === true,
    climate: normalizeClimate(payload.climate, path),
    scenarios,
    sources: requireArray(payload, 'sources', path) as Source[],
    warnings: Array.isArray(payload.warnings) ? (payload.warnings as string[]) : [],
    methodVersion: optionalString(payload.methodVersion) ?? '',
    // Proposed extension: without `highlight` no card is emphasised.
    highlight: highlight
      ? { scenarioId: highlight.scenarioId as string, priority: highlight.priority as Priority, reason: optionalString(highlight.reason) ?? '' }
      : null,
  };
}
