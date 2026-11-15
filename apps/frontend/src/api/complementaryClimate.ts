import type { ComplementaryClimate, ComplementaryClimateDay, ComplementaryClimateQuery, ComplementaryClimateReason } from './types';

/** Empty result used when the server cannot be reached. It carries no figures. */
export function unavailableComplementaryClimate(reason: ComplementaryClimateReason, query: ComplementaryClimateQuery = {}): ComplementaryClimate {
  return {
    source: 'meteomatics',
    status: 'unavailable',
    reason,
    period: { start: query.start ?? '', end: query.end ?? '' },
    coverage: { validDays: 0, expectedDays: 0 },
    days: [],
    provenance: null,
    stale: false,
  };
}

const toIsoDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * The last complete days, as the server expects them (UTC, ending in the past).
 * It stops two days back so the provider has the whole day available.
 */
export function recentPeriod(days = 7, now = new Date()): { start: string; end: string } {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 2));
  const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return { start: toIsoDay(start), end: toIsoDay(end) };
}

export interface ComplementaryClimateSummary {
  /** Sum of the days that have a value, in mm. null when no day has one. */
  precipTotalMm: number | null;
  /** Mean of the daily highs, in °C. */
  tMaxMeanC: number | null;
  /** Mean of the daily lows, in °C. */
  tMinMeanC: number | null;
}

const round1 = (value: number) => Math.round(value * 10) / 10;

function aggregate(days: ComplementaryClimateDay[], field: 'tMaxC' | 'tMinC' | 'precipMm', mean: boolean): number | null {
  const values = days.map((day) => day[field]).filter((value): value is number => value !== null);
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return round1(mean ? total / values.length : total);
}

/** Plain aggregates of the daily series. Days without a value are skipped, never filled in. */
export function summarizeComplementaryClimate(days: ComplementaryClimateDay[]): ComplementaryClimateSummary {
  return {
    precipTotalMm: aggregate(days, 'precipMm', false),
    tMaxMeanC: aggregate(days, 'tMaxC', true),
    tMinMeanC: aggregate(days, 'tMinC', true),
  };
}
