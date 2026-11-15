import type { CropId, Priority, SoilDrainage, SoilTexture, SourceKind } from '../api/types';
import type { LevelKey } from '../constants/domain';
import type { SceneKey } from './types';

interface Option { name: string; hint: string; inline: string }
interface PriorityText { name: string; short: string; hint: string; goal: string }

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const parseDate = (iso: string) => iso.split('-').map(Number);

/** English is the default language and the source of truth for the `Translations` shape. */
export const en = {
  documentTitle: 'Yago · What to plant next?',
  demoData: 'Demo data',
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
    'user-input': 'Your answer',
    'demo-assumption': 'Demo assumption',
  } as Record<SourceKind, string>,

  /** "2024-05-01" + "2024-05-07" → "May 1–7, 2024" */
  formatPeriod: (start: string, end: string): string => {
    const [startYear, startMonth, startDay] = parseDate(start);
    const [endYear, endMonth, endDay] = parseDate(end);
    if (startYear === endYear && startMonth === endMonth) return `${MONTHS[startMonth - 1]} ${startDay}–${endDay}, ${startYear}`;
    return `${MONTHS[startMonth - 1]} ${startDay}, ${startYear} – ${MONTHS[endMonth - 1]} ${endDay}, ${endYear}`;
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
    demoSiteHint: 'Example area · eastern El Salvador',
    singleSiteNote: 'For now there is only one example area. More will come when the team connects the data.',
    textureQuestion: 'When you hold it in your hand, it is…',
    drainageQuestion: 'When it rains hard, the water…',
    previousStep: 'Previous step',
    chooseOption: 'Choose an option',
    next: 'Next',
    seeComparison: 'See comparison',
  },

  results: {
    title: 'Your comparison',
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
    comparing: 'Comparing crops…',
    errorTitle: 'Could not compare',
    errorText: 'Check your connection and try again.',
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
