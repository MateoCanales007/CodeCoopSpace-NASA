import type { Language } from '../../i18n/types';
import type { CriterionLevel, CropId, Priority } from '../types';

export type CropFamily = 'grass' | 'legume';
export type DemoSourceId = 'nasa-power' | 'centa-basic-grains' | 'demo-rules' | 'user-answers';
type ByLevel = Record<CriterionLevel, string>;

/** Every sentence the demo comparison can produce, per language. */
export interface DemoText {
  methodVersion: string;
  crop: Record<CropId, string>;
  family: Record<CropFamily, string>;
  sources: Record<DemoSourceId, { name: string; note: string }>;
  days: string;
  metric: { rain: string; dryDays: (thresholdMm: number) => string; maxTemp: string };
  waterAlert: (dryDays: number, days: number) => string;
  climateNote: string;
  waterUnavailable: string;
  water: (crop: string) => ByLevel;
  waterSample: (dryDays: number, days: number) => string;
  waterSandySoil: string;
  soilSameCrop: (crop: string) => string;
  soilLegume: string;
  soilLegumeWaterlogged: string;
  soilAfterLegume: (crop: string) => string;
  soilRelatives: (crop: string, currentCrop: string) => string;
  diversitySameCrop: string;
  diversityOtherFamily: (from: string, to: string) => string;
  diversitySameFamily: string;
  sameCrop: { summary: string; limitation: (crop: string) => string };
  bean: { summary: string; limitation: string };
  sorghum: { summary: string; limitationAfterGrass: string; limitationOther: string };
  maize: { summaryAfterLegume: string; summaryOther: string; limitation: string };
  missingDrainage: string;
  missingTexture: string;
  highlightReason: Record<Priority, ByLevel>;
  warningDemo: string;
  warningOneWeek: string;
  warningSoil: string;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const en: DemoText = {
  methodVersion: 'demo-0.1 (illustrative rules)',
  crop: { maize: 'maize', bean: 'beans', sorghum: 'sorghum' },
  family: { grass: 'grass crop', legume: 'legume' },
  sources: {
    'nasa-power': {
      name: 'NASA POWER Daily (MERRA-2)',
      note: 'Rainfall (PRECTOTCORR, mm/day) and maximum temperature (T2M_MAX, °C) for May 1–7, 2024 at an approximate point in San Miguel. It is a one-week sample used to test the connection.',
    },
    'centa-basic-grains': {
      name: 'CENTA · Basic Grains Program',
      note: 'Local reference for maize, beans and sorghum. No value has been taken from its guides yet: page, variety and area still have to be verified.',
    },
    'demo-rules': {
      name: 'Yago illustrative rules',
      note: 'General comparisons between crops (family, water need, waterlogging) used only to show how the app will work.',
    },
    'user-answers': {
      name: 'What you answered',
      note: 'The area, current crop, soil and priority you chose in the previous steps.',
    },
  },
  days: 'days',
  metric: {
    rain: 'Sum of daily rainfall over the days with data.',
    dryDays: (thresholdMm) => `Days with less than ${thresholdMm} mm of rain (demo threshold).`,
    maxTemp: 'Average of the daily maximum temperature.',
  },
  waterAlert: (dryDays, days) => `In this sample there was almost no rain on ${dryDays} of ${days} days. That is why, when comparing, how much water each crop needs counts more.`,
  climateNote: 'This is past weather for a single week, not a forecast or a season summary. It describes a wide area, not your plot.',
  waterUnavailable: 'No rainfall data is available, so water cannot be compared.',
  water: (crop) => ({
    favorable: `${capitalize(crop)} can cope better with days without rain.`,
    neutral: `${capitalize(crop)} will need less water than maize, but the rain has to be steady.`,
    unfavorable: `${capitalize(crop)} will need a lot of water, especially at flowering.`,
  }),
  waterSample: (dryDays, days) => ` In the NASA sample there was almost no rain on ${dryDays} of ${days} days.`,
  waterSandySoil: ' Your sandy soil holds little water, so this counts more.',
  soilSameCrop: (crop) => `Planting ${crop} again takes the same things from the soil and lets the same pests carry on.`,
  soilLegume: 'Beans are a legume: they help put nitrogen back into the soil.',
  soilLegumeWaterlogged: ' But you said your soil waterlogs, and beans suffer in standing water.',
  soilAfterLegume: (crop) => `${capitalize(crop)} can use what the beans left in the soil, and its stubble covers the ground.`,
  soilRelatives: (crop, currentCrop) => `It is a change of crop, but ${crop} and ${currentCrop} are relatives: the soil gets less rest.`,
  diversitySameCrop: 'It is the same crop: if it does badly, there is no other one to fall back on.',
  diversityOtherFamily: (from, to) => `It moves from a ${from} to a ${to}: two crops from different families spread the risk.`,
  diversitySameFamily: 'It is a different crop, but from the same family.',
  sameCrop: {
    summary: 'It is what you already know: no change in how you work or in what you buy.',
    limitation: (crop) => `Repeating ${crop} wears out the soil and does not spread the risk.`,
  },
  bean: {
    summary: 'Beans are from another family: they help the soil and break the pest cycle of the previous crop.',
    limitation: 'They need steady rain and cannot stand waterlogged soil.',
  },
  sorghum: {
    summary: 'Sorghum copes better when the rain fails and leaves stubble that covers the soil.',
    limitationAfterGrass: 'It is a relative of maize: the soil gets less rest than with beans.',
    limitationOther: 'It gives the soil less benefit than a legume.',
  },
  maize: {
    summaryAfterLegume: 'Maize makes use of what the beans left in the soil.',
    summaryOther: 'Maize is the grain of the home and has a place to be sold.',
    limitation: 'It needs a lot of water: if the rain stops, it is the one that suffers most.',
  },
  missingDrainage: 'We do not know whether your soil waterlogs. With that detail, this option could move up or down.',
  missingTexture: 'We do not know what your soil is like: sandy soil holds less water and maize suffers more.',
  highlightReason: {
    water: {
      favorable: 'of the two alternatives, it copes best with a lack of rain',
      neutral: 'it needs less water than carrying on with the same crop',
      unfavorable: 'no alternative saves water, but this one helps more with the rest',
    },
    soil: {
      favorable: 'it does the most to help the soil recover',
      neutral: 'from what we know about your soil, it wears it out the least',
      unfavorable: 'no alternative helps the soil much, but this one helps more with the rest',
    },
    diversification: {
      favorable: 'it switches to a crop from another family and spreads the risk better',
      neutral: 'it changes the crop, though it stays in the same family',
      unfavorable: 'no alternative changes much of what you grow',
    },
  },
  warningDemo: 'Demo data: a fictitious San Miguel case with illustrative rules.',
  warningOneWeek: 'The weather is a one-week sample (May 1–7, 2024), not a season reference.',
  warningSoil: 'Information about your soil is missing. The comparison may change once you have it.',
};

const es: DemoText = {
  methodVersion: 'demo-0.1 (reglas ilustrativas)',
  crop: { maize: 'maíz', bean: 'frijol', sorghum: 'maicillo' },
  family: { grass: 'gramínea', legume: 'leguminosa' },
  sources: {
    'nasa-power': {
      name: 'NASA POWER Daily (MERRA-2)',
      note: 'Lluvia (PRECTOTCORR, mm/día) y temperatura máxima (T2M_MAX, °C) del 1 al 7 de mayo de 2024 en un punto aproximado de San Miguel. Es una muestra de una semana para probar la conexión.',
    },
    'centa-basic-grains': {
      name: 'CENTA · Programa de Granos Básicos',
      note: 'Referencia local para maíz, frijol y maicillo. Todavía no se ha tomado ningún valor de sus guías: falta verificar página, variedad y zona.',
    },
    'demo-rules': {
      name: 'Reglas ilustrativas de Yago',
      note: 'Comparaciones generales entre cultivos (familia, necesidad de agua, encharcamiento) usadas solo para mostrar cómo funcionará la app.',
    },
    'user-answers': {
      name: 'Lo que usted respondió',
      note: 'Zona, cultivo actual, suelo y prioridad que eligió en los pasos anteriores.',
    },
  },
  days: 'días',
  metric: {
    rain: 'Suma de la lluvia diaria de los días con dato.',
    dryDays: (thresholdMm) => `Días con menos de ${thresholdMm} mm de lluvia (umbral de demostración).`,
    maxTemp: 'Promedio de la temperatura máxima diaria.',
  },
  waterAlert: (dryDays, days) => `En esta muestra casi no llovió ${dryDays} de ${days} días. Por eso, al comparar, pesa más cuánta agua pide cada cultivo.`,
  climateNote: 'Es clima histórico de una sola semana, no un pronóstico ni un resumen de la temporada. El dato describe una zona amplia, no su parcela.',
  waterUnavailable: 'No hay dato de lluvia disponible, así que no se puede comparar el agua.',
  water: (crop) => ({
    favorable: `El ${crop} aguanta mejor los días sin lluvia.`,
    neutral: `El ${crop} pide menos agua que el maíz, pero necesita lluvia pareja.`,
    unfavorable: `El ${crop} pide bastante agua, sobre todo cuando florece.`,
  }),
  waterSample: (dryDays, days) => ` En la muestra de NASA casi no llovió ${dryDays} de ${days} días.`,
  waterSandySoil: ' Su tierra arenosa guarda poca agua, y eso pesa más.',
  soilSameCrop: (crop) => `Sembrar ${crop} otra vez saca del suelo lo mismo y deja que sigan las mismas plagas.`,
  soilLegume: 'El frijol es leguminosa: ayuda a devolverle nitrógeno al suelo.',
  soilLegumeWaterlogged: ' Pero usted dijo que su tierra se encharca, y el frijol sufre con el agua estancada.',
  soilAfterLegume: (crop) => `El ${crop} aprovecha lo que el frijol dejó en el suelo y su rastrojo lo cubre.`,
  soilRelatives: (crop, currentCrop) => `Cambia de cultivo, pero el ${crop} y el ${currentCrop} son parientes: el suelo descansa menos.`,
  diversitySameCrop: 'Es el mismo cultivo: si le va mal, no hay otro que responda.',
  diversityOtherFamily: (from, to) => `Pasa de ${from} a ${to}: dos cultivos de familias distintas reparten el riesgo.`,
  diversitySameFamily: 'Es otro cultivo, pero de la misma familia.',
  sameCrop: {
    summary: 'Es lo que usted ya conoce: no cambia su forma de trabajar ni lo que compra.',
    limitation: (crop) => `Repetir ${crop} cansa el suelo y no reparte el riesgo.`,
  },
  bean: {
    summary: 'El frijol es de otra familia: ayuda al suelo y corta el ciclo de las plagas del cultivo anterior.',
    limitation: 'Necesita lluvia pareja y no aguanta el suelo encharcado.',
  },
  sorghum: {
    summary: 'El maicillo aguanta mejor cuando la lluvia falla y deja rastrojo que cubre el suelo.',
    limitationAfterGrass: 'Es pariente del maíz: el suelo descansa menos que con frijol.',
    limitationOther: 'Deja menos beneficio al suelo que una leguminosa.',
  },
  maize: {
    summaryAfterLegume: 'El maíz aprovecha lo que el frijol dejó en el suelo.',
    summaryOther: 'El maíz es el grano de la casa y tiene dónde venderse.',
    limitation: 'Pide bastante agua: si la lluvia se corta, es el que más lo resiente.',
  },
  missingDrainage: 'Falta saber si su tierra se encharca. Con ese dato, esta opción puede subir o bajar.',
  missingTexture: 'Falta saber cómo es su tierra: si es arenosa guarda menos agua y el maíz lo resiente más.',
  highlightReason: {
    water: {
      favorable: 'de las dos alternativas, es la que mejor aguanta la falta de lluvia',
      neutral: 'pide menos agua que seguir con lo mismo',
      unfavorable: 'ninguna alternativa ahorra agua, pero esta ayuda más en lo demás',
    },
    soil: {
      favorable: 'es la que más ayuda a que el suelo se recupere',
      neutral: 'con lo que sabemos de su suelo, es la que menos lo cansa',
      unfavorable: 'ninguna alternativa ayuda mucho al suelo, pero esta ayuda más en lo demás',
    },
    diversification: {
      favorable: 'cambia a un cultivo de otra familia y reparte mejor el riesgo',
      neutral: 'cambia de cultivo, aunque sigue en la misma familia',
      unfavorable: 'ninguna alternativa cambia mucho lo que siembra',
    },
  },
  warningDemo: 'Datos de demostración: caso ficticio de San Miguel con reglas ilustrativas.',
  warningOneWeek: 'El clima es una muestra de una semana (1–7 de mayo de 2024), no una referencia de temporada.',
  warningSoil: 'Falta información de su suelo. La comparación puede cambiar cuando la tenga.',
};

export const DEMO_TEXT: Record<Language, DemoText> = { en, es };
