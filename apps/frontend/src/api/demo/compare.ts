/**
 * DEMO DATA — fictitious San Miguel case.
 *
 * What is real and what is not:
 *  - The 7 climate rows are the real NASA POWER sample (see powerSample.ts).
 *  - Crop rules are ILLUSTRATIVE. No agronomic value has been taken from a
 *    CENTA table yet, so there are no yield or water-use numbers, only
 *    qualitative comparisons.
 *  - The "almost dry day" threshold (< 1 mm) is a demo assumption.
 *
 * This module mirrors the response shape of `POST /v1/compare` so the UI does
 * not change when the real API arrives.
 */
import type { Language } from '../../i18n/types';
import type { Climate, CompareRequest, CompareResponse, Criterion, CriterionLevel, CropId, Priority, Scenario, Source } from '../types';
import { DRY_DAYS_FOR_ALERT, DRY_DAY_MM, POWER_SAMPLE } from './powerSample';
import { DEMO_SITES } from './sites';
import { DEMO_TEXT } from './text';
import type { CropFamily, DemoText } from './text';

// ---- Illustrative traits of each crop ----
const CROP_TRAITS: Record<CropId, { family: CropFamily; waterSaving: CriterionLevel }> = {
  // waterSaving: how much the crop helps to save water (favorable = needs less)
  maize: { family: 'grass', waterSaving: 'unfavorable' },
  bean: { family: 'legume', waterSaving: 'neutral' },
  sorghum: { family: 'grass', waterSaving: 'favorable' },
};

const DEFAULT_PRIORITY_ORDER: Priority[] = ['water', 'soil', 'diversification'];
/** Weight of the first, second and third priority. */
const PRIORITY_WEIGHTS = [4, 2, 1];
const LEVEL_POINTS: Record<CriterionLevel, number> = { favorable: 2, neutral: 1, unfavorable: 0 };

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

function buildSources(text: DemoText): Source[] {
  const { sources } = text;
  return [
    { id: 'nasa-power', ...sources['nasa-power'], url: POWER_SAMPLE.url, version: POWER_SAMPLE.apiVersion, kind: 'nasa' },
    { id: 'centa-basic-grains', ...sources['centa-basic-grains'], url: 'https://www.centa.gob.sv/servicios/programa-granos-basicos/', version: null, kind: 'local-reference' },
    { id: 'demo-rules', ...sources['demo-rules'], url: null, version: text.methodVersion, kind: 'demo-assumption' },
    { id: 'user-answers', ...sources['user-answers'], url: null, version: null, kind: 'user-input' },
  ];
}

function buildClimate(text: DemoText): Climate {
  const { days, fillValue } = POWER_SAMPLE;
  const valid = days.filter((day) => day.precipMm !== fillValue && day.tMaxC !== fillValue);
  const totalRain = valid.reduce((sum, day) => sum + day.precipMm, 0);
  const dryDays = valid.filter((day) => day.precipMm < DRY_DAY_MM).length;
  const meanMaxTemp = valid.reduce((sum, day) => sum + day.tMaxC, 0) / valid.length;

  return {
    status: 'partial',
    period: { start: days[0].date, end: days[days.length - 1].date },
    coverage: { validDays: valid.length, expectedDays: days.length },
    metrics: [
      { id: 'precipTotal', value: roundToTenth(totalRain), unit: 'mm', reason: text.metric.rain, sourceId: 'nasa-power' },
      { id: 'dryDays', value: dryDays, unit: text.days, reason: text.metric.dryDays(DRY_DAY_MM), sourceId: 'nasa-power' },
      { id: 'tMaxMean', value: roundToTenth(meanMaxTemp), unit: '°C', reason: text.metric.maxTemp, sourceId: 'nasa-power' },
    ],
    sourceId: 'nasa-power',
    spatialScale: null,
    cacheAgeHours: null,
    alert: dryDays >= DRY_DAYS_FOR_ALERT ? { priority: 'water', text: text.waterAlert(dryDays, valid.length) } : null,
    note: text.climateNote,
  };
}

function waterCriterion(next: CropId, request: CompareRequest, climate: Climate, text: DemoText): Criterion {
  const dryDays = climate.metrics.find((metric) => metric.id === 'dryDays')?.value ?? null;
  if (climate.status === 'unavailable' || dryDays === null) {
    return { priority: 'water', status: 'undetermined', level: null, value: null, unit: null, reason: text.waterUnavailable, evidence: ['nasa-power'] };
  }
  const level = CROP_TRAITS[next].waterSaving;
  // The NASA sample is what triggers the alert and the explanation.
  let reason = text.water(text.crop[next])[level] + text.waterSample(dryDays, climate.coverage.validDays);
  if (request.soil.texture === 'sandy') reason += text.waterSandySoil;
  return { priority: 'water', status: 'evaluable', level, value: null, unit: null, reason, evidence: ['nasa-power', 'demo-rules', 'user-answers'] };
}

function soilCriterion(current: CropId, next: CropId, request: CompareRequest, text: DemoText): Criterion {
  const currentFamily = CROP_TRAITS[current].family;
  const nextFamily = CROP_TRAITS[next].family;
  let level: CriterionLevel;
  let reason: string;
  if (current === next) {
    level = 'unfavorable';
    reason = text.soilSameCrop(text.crop[next]);
  } else if (nextFamily === 'legume') {
    level = 'favorable';
    reason = text.soilLegume;
    if (request.soil.drainage === 'poor') {
      level = 'neutral';
      reason += text.soilLegumeWaterlogged;
    }
  } else if (currentFamily === 'legume') {
    level = 'favorable';
    reason = text.soilAfterLegume(text.crop[next]);
  } else {
    level = 'neutral';
    reason = text.soilRelatives(text.crop[next], text.crop[current]);
  }
  return { priority: 'soil', status: 'evaluable', level, value: null, unit: null, reason, evidence: ['demo-rules', 'centa-basic-grains', 'user-answers'] };
}

function diversificationCriterion(current: CropId, next: CropId, text: DemoText): Criterion {
  const currentFamily = CROP_TRAITS[current].family;
  const nextFamily = CROP_TRAITS[next].family;
  let level: CriterionLevel;
  let reason: string;
  if (current === next) {
    level = 'unfavorable';
    reason = text.diversitySameCrop;
  } else if (nextFamily !== currentFamily) {
    level = 'favorable';
    reason = text.diversityOtherFamily(text.family[currentFamily], text.family[nextFamily]);
  } else {
    level = 'neutral';
    reason = text.diversitySameFamily;
  }
  return { priority: 'diversification', status: 'evaluable', level, value: null, unit: null, reason, evidence: ['demo-rules'] };
}

function describeScenario(current: CropId, next: CropId, request: CompareRequest, text: DemoText): Pick<Scenario, 'summary' | 'limitation' | 'missingData'> {
  const currentFamily = CROP_TRAITS[current].family;
  let summary: string;
  let limitation: string;
  if (current === next) {
    summary = text.sameCrop.summary;
    limitation = text.sameCrop.limitation(text.crop[next]);
  } else if (next === 'bean') {
    summary = text.bean.summary;
    limitation = text.bean.limitation;
  } else if (next === 'sorghum') {
    summary = text.sorghum.summary;
    limitation = currentFamily === 'grass' ? text.sorghum.limitationAfterGrass : text.sorghum.limitationOther;
  } else {
    summary = currentFamily === 'legume' ? text.maize.summaryAfterLegume : text.maize.summaryOther;
    limitation = text.maize.limitation;
  }

  let missingData: string | null = null;
  if (next === 'bean' && request.soil.drainage === 'unknown') missingData = text.missingDrainage;
  else if (next === 'maize' && request.soil.texture === 'unknown') missingData = text.missingTexture;
  return { summary, limitation, missingData };
}

/** Weighted sum by priority order. Undetermined criteria neither add nor subtract. */
function scoreScenario(criteria: Criterion[], priorities: Priority[]): number {
  return priorities.reduce((sum, priority, index) => {
    const criterion = criteria.find((item) => item.priority === priority);
    if (!criterion || criterion.level === null) return sum;
    return sum + PRIORITY_WEIGHTS[index] * LEVEL_POINTS[criterion.level];
  }, 0);
}

/** Drops unknown or repeated priorities and appends the ones that are missing. */
function normalizePriorities(priorities: Priority[]): Priority[] {
  const seen = priorities.filter((priority, index) => DEFAULT_PRIORITY_ORDER.includes(priority) && priorities.indexOf(priority) === index);
  return [...seen, ...DEFAULT_PRIORITY_ORDER.filter((priority) => !seen.includes(priority))];
}

export function buildDemoComparison(request: CompareRequest, language: Language): CompareResponse {
  const text = DEMO_TEXT[language];
  const site = DEMO_SITES.find((item) => item.id === request.siteId);
  if (!site) throw new Error(`Unsupported site: ${request.siteId}`);
  if (!site.crops.includes(request.currentCrop)) throw new Error(`Unsupported crop: ${request.currentCrop}`);

  const current = request.currentCrop;
  const priorities = normalizePriorities(request.priorities);
  const climate = buildClimate(text);
  // The current rotation first, then one alternative per other supported crop.
  const nextCrops: CropId[] = [current, ...site.crops.filter((crop) => crop !== current)];

  const scenarios: Scenario[] = nextCrops.map((next) => {
    const criteria = [waterCriterion(next, request, climate, text), soilCriterion(current, next, request, text), diversificationCriterion(current, next, text)];
    return {
      id: `${current}-${next}`,
      role: next === current ? 'current' : 'alternative',
      sequence: [current, next],
      ...describeScenario(current, next, request, text),
      criteria,
      sourceIds: Array.from(new Set(criteria.flatMap((criterion) => criterion.evidence))),
    };
  });

  const best =
    scenarios
      .filter((scenario) => scenario.role === 'alternative')
      .map((scenario) => ({ scenario, total: scoreScenario(scenario.criteria, priorities) }))
      .sort((a, b) => b.total - a.total)[0]?.scenario ?? null;
  const topPriority = priorities[0];
  const topLevel = best?.criteria.find((criterion) => criterion.priority === topPriority)?.level ?? null;

  const warnings = [text.warningDemo, text.warningOneWeek];
  if (request.soil.texture === 'unknown' || request.soil.drainage === 'unknown') warnings.push(text.warningSoil);

  return {
    isDemo: true,
    climate,
    scenarios,
    sources: buildSources(text),
    warnings,
    methodVersion: text.methodVersion,
    highlight: best && topLevel ? { scenarioId: best.id, priority: topPriority, reason: text.highlightReason[topPriority][topLevel] } : null,
  };
}
