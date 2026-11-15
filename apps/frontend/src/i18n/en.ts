import type { ComplementaryClimateReason, CropId, ExplanationFallbackReason, Priority, SoilDrainage, SoilTexture, SourceKind } from '../api/types';
import type { LevelKey } from '../constants/domain';
import type { SceneKey } from './types';

interface Option { name: string; hint: string; inline: string }
interface PriorityText { name: string; short: string; hint: string; goal: string }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parseDate = (iso: string) => iso.split('-').map(Number);

/** English is the default language and the source of truth for the `Translations` shape. */
export const en = {
  documentTitle: 'Yago · What to plant next?',
  demoData: 'Demo mode',
  backToStart: 'Back to start',
  language: 'Language',

  crop: {
    maize: { name: 'Maize', hint: 'Corn, the milpa crop', inline: 'maize' },
    bean: { name: 'Beans', hint: 'Red or black beans', inline: 'beans' },
    sorghum: { name: 'Sorghum', hint: 'Known locally as maicillo', inline: 'sorghum' },
  } as Record<CropId, Option>,
  priority: {
    water: { name: 'Save water', short: 'Water', hint: 'Holds up if the rain fails', goal: 'save water' },
    soil: { name: 'Protect the soil', short: 'Soil', hint: 'Keeps the land from wearing out', goal: 'protect the soil' },
    diversification: { name: 'Diversify', short: 'Mix', hint: 'Not relying on a single crop', goal: 'diversify' },
  } as Record<Priority, PriorityText>,
  texture: {
    sandy: { name: 'Sandy', hint: 'Loose, water drains fast', inline: 'sandy' },
    loam: { name: 'Loam', hint: 'Neither loose nor sticky', inline: 'loam' },
    clay: { name: 'Clay', hint: 'Sticky, turns to mud', inline: 'clay' },
    unknown: { name: 'Not sure', hint: 'That’s fine, we go on without it', inline: 'not known' },
  } as Record<SoilTexture, Option>,
  drainage: {
    good: { name: 'Drains fast', hint: 'No puddles left', inline: 'drains fast' },
    poor: { name: 'Waterlogs', hint: 'Water stays for days', inline: 'waterlogs' },
    unknown: { name: 'Not sure', hint: 'That’s fine, we go on without it', inline: 'not known' },
  } as Record<SoilDrainage, Option>,
  level: {
    favorable: 'Helps',
    neutral: 'Fair',
    unfavorable: 'Against',
    undetermined: 'No data',
  } as Record<LevelKey, string>,
  sourceKind: {
    nasa: 'NASA data',
    'local-reference': 'Local reference',
    'technical-reference': 'Technical reference',
    'user-input': 'Your answer',
    'demo-assumption': 'Method assumption',
  } as Record<SourceKind, string>,

  /** "2024-05-01" + "2024-05-07" → "May 1–7, 2024" */
  formatPeriod: (start: string, end: string): string => {
    const [startYear, startMonth, startDay] = parseDate(start);
    const [endYear, endMonth, endDay] = parseDate(end);
    if (startYear === endYear && startMonth === endMonth) return `${MONTHS[startMonth - 1]} ${startDay}–${endDay}, ${startYear}`;
    return `${MONTHS[startMonth - 1]} ${startDay}, ${startYear} – ${MONTHS[endMonth - 1]} ${endDay}, ${endYear}`;
  },
  /** "2026-11-14" → "November 14, 2026" */
  formatDay: (iso: string): string => {
    const [year, month, day] = parseDate(iso);
    return `${MONTHS[month - 1]} ${day}, ${year}`;
  },

  welcome: {
    title: 'What to plant next?',
    lead: 'Compare what you grow today with two alternatives, based on water, soil and what matters most to you.',
    cta: 'Compare crops',
    note: 'Opens right away. No accounts, no passwords.',
    previousScene: 'Previous scene',
    nextScene: 'Next scene',
    showScene: (name: string) => `Show ${name}`,
    scenes: {
      jaguarundi: { name: 'Jaguarundi', line: 'Yago is named after it' },
      cornfield: { name: 'Milpa', line: 'Maize, the grain of the home' },
      hen: { name: 'Hen', line: 'Roaming the yard' },
      coffee: { name: 'Coffee', line: 'Grown under shade' },
      cow: { name: 'Cow', line: 'The family’s cattle' },
      chili: { name: 'Chile', line: 'For the table and the market' },
    } as Record<SceneKey, { name: string; line: string }>,
  },

  wizard: {
    steps: [
      { title: 'Where do you farm?', help: 'Choose the area closest to your land.' },
      { title: 'What is planted now?', help: 'The crop of this season.' },
      { title: 'What is your soil like?', help: 'If you don’t know, leave “Not sure”.' },
      { title: 'What matters most to you?', help: 'You can change it later to see what happens.' },
    ],
    stepOf: (step: number, total: number) => `Step ${step} of ${total}`,
    climateReference: (city: string) => 'Reference city: ' + city,
    siteScaleNote: 'The area is only used to look up past weather from NASA, which covers about 50 km at a time. Nearby areas can show the same figures.',
    sitesLoading: 'Loading the areas…',
    sitesEmpty: 'The server did not return any area.',
    sitesError: 'Could not reach the server to load the areas. Check your connection and try again.',
    textureQuestion: 'When you hold it in your hand, it is…',
    drainageQuestion: 'When it rains hard, the water…',
    previousStep: 'Previous step',
    chooseOption: 'Choose an option',
    next: 'Next',
    seeComparison: 'See comparison',
  },

  results: {
    title: 'Your comparison',
    weatherTab: 'Weather',
    otherOptions: 'See the other options and their sources',
    weatherNow: 'Temperature now',
    forecastTitle: 'Forecast for the next 24 hours',
    weatherLoading: 'Looking up weather in your area…',
    weatherUnavailable: 'Weather for your area is unavailable right now.',
    refreshWeather: 'Update weather',
    forecastRain: 'Forecast rain in the six hours up to this time',
    weatherSource: 'Data from Meteomatics. El Salvador time.',
    weatherPartial: 'Some weather data is missing.',
    weatherHistory: 'See how much it rained in past years',
    area: 'Area',
    currentCrop: (crop: string) => `${crop} today`,
    soilSummary: (texture: string, drainage: string) => `Soil: ${texture} · Water: ${drainage}`,
    change: 'Change',
    changeAnswers: 'Change my answers',
    missingSoil: 'One detail about your soil is missing. The comparison may change once you know it: tap “Change” to add it.',
    priorityQuestion: 'What matters most to you?',
    tagBestFit: (goal: string) => `Best fit to ${goal}`,
    tagCurrent: 'What you do today',
    tagOther: 'Another option',
    rotation: (sequence: string) => `Rotation: ${sequence}`,
    watchOut: 'Watch out',
    showDetails: 'See why and the sources',
    hideDetails: 'Hide details',
    hideDetailsLabel: 'Hide why and the sources',
    whereFrom: 'Where this comes from',
    openSource: 'Open the source ↗',
    openSourceLabel: (name: string) => `Open source: ${name}`,
    climateTitle: 'Past weather for the area',
    climateSampleTitle: 'Saved weather sample',
    outOf: (value: number, total: number) => `${value} of ${total}`,
    yearsCoverage: (valid: number, expected: number) => `${valid} of ${expected} years with complete data.`,
    noData: 'No data',
    rainIn: (days: number) => `of rain in ${days} days`,
    dryDaysOf: (dry: number, days: number) => `${dry} of ${days}`,
    dryDaysCaption: 'days with almost no rain',
    maxTempCaption: 'average daily high',
    waterAlert: 'Water alert',
    source: 'Source',
    coverage: (valid: number, expected: number) => `${valid} of ${expected} days with data.`,
    openNasaQuery: 'Open the NASA query ↗',
    openNasaQueryLabel: 'Open the NASA POWER query',
    complementaryChip: 'Meteomatics',
    complementaryTitle: 'Recent weather, second source',
    complementaryLoading: 'Asking Meteomatics…',
    minTempCaption: 'average daily low',
    retrieved: (date: string) => `Retrieved ${date}.`,
    complementaryNote:
      'Modelled weather for the last few days from another provider, shown as context. It does not change the comparison, which uses the NASA history above. Its days run on UTC time.',
    complementaryStale: 'The provider did not answer just now. This is a saved copy.',
    complementaryIndependent: 'The comparison does not depend on it: it uses the NASA history above.',
    complementaryReason: {
      not_configured: 'Meteomatics is not set up on the server yet.',
      auth_failed: 'Meteomatics rejected the server’s access, or the trial has ended.',
      timeout: 'Meteomatics took too long to answer.',
      upstream_error: 'Meteomatics returned an error.',
      invalid_response: 'Meteomatics answered in a format we could not read.',
      unreachable: 'Could not reach the server to ask Meteomatics.',
    } as Record<ComplementaryClimateReason, string>,
    explanationTitle: 'In short',
    explanationAiChip: 'AI wording',
    explanationRulesChip: 'Automatic summary',
    explanationLabels: { consider: 'What to consider', influence: 'What weighed most', caution: 'Watch out', verify: 'Before sowing' },
    explanationByAi: (model: string) => `Worded by an AI model (Groq · ${model}) from the result the rules calculated. The crops, figures, ratings and sources do not come from the AI.`,
    explanationByRules: 'Short summary written by the rules, without AI.',
    explanationFallback: {
      not_configured: 'The AI wording is not set up on the server.',
      timeout: 'The AI took too long to answer.',
      rate_limited: 'The AI reached its usage limit for now.',
      provider_error: 'The AI service failed.',
      invalid_output: 'The AI answer did not pass the checks and was discarded.',
    } as Record<ExplanationFallbackReason, string>,
    comparing: 'Comparing crops…',
    errorTitle: 'Could not compare',
    errorText: 'Could not reach the server. Check your connection and try again.',
    retry: 'Try again',
    disclaimer: (method: string) => `Yago is for exploring and for talking with an extension agent in your area. It does not predict harvests or replace a field visit. Method: ${method}.`,
    startOver: 'Start over',
    highlightMoved: (sequence: string) => `Now ${sequence} stands out`,
    highlightMovedText: (previousGoal: string, previousSequence: string, goal: string, reason: string) =>
      `Before, to ${previousGoal}, ${previousSequence} stood out. To ${goal}, ${reason}. The weather and your answers are the same: only how much each thing counts has changed.`,
    highlightKept: (sequence: string) => `${sequence} still stands out`,
    highlightKeptText: (goal: string, reason: string) => `Also to ${goal}: ${reason}. The weather and your answers are the same.`,
  },
};

export type Translations = typeof en;
