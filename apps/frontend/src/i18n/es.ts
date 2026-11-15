import type { Translations } from './en';

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const parseDate = (iso: string) => iso.split('-').map(Number);

/** Spanish translation, written in plain Salvadoran Spanish and the formal "usted". */
export const es: Translations = {
  documentTitle: 'Yago · ¿Qué sembrar después?',
  demoData: 'Datos de demostración',
  backToStart: 'Volver al inicio',
  language: 'Idioma',

  crop: {
    maize: { name: 'Maíz', hint: 'Milpa de maíz', inline: 'maíz' },
    bean: { name: 'Frijol', hint: 'Frijol rojo o negro', inline: 'frijol' },
    sorghum: { name: 'Maicillo', hint: 'También le dicen sorgo', inline: 'maicillo' },
  },
  priority: {
    water: { name: 'Cuidar el agua', short: 'Agua', hint: 'Que aguante si la lluvia falla', goal: 'cuidar el agua' },
    soil: { name: 'Proteger el suelo', short: 'Suelo', hint: 'Que la tierra no se canse', goal: 'proteger el suelo' },
    diversification: { name: 'Diversificar', short: 'Variar', hint: 'No depender de un solo cultivo', goal: 'diversificar' },
  },
  texture: {
    sandy: { name: 'Arenosa', hint: 'Suelta, el agua se va rápido', inline: 'arenosa' },
    loam: { name: 'Franca', hint: 'Ni muy suelta ni muy pegajosa', inline: 'franca' },
    clay: { name: 'Arcillosa', hint: 'Pegajosa, se hace barro', inline: 'arcillosa' },
    unknown: { name: 'No sé', hint: 'Está bien, seguimos sin ese dato', inline: 'no sé' },
  },
  drainage: {
    good: { name: 'Se va rápido', hint: 'No quedan charcos', inline: 'se va rápido' },
    poor: { name: 'Se encharca', hint: 'El agua se queda varios días', inline: 'se encharca' },
    unknown: { name: 'No sé', hint: 'Está bien, seguimos sin ese dato', inline: 'no sé' },
  },
  level: {
    favorable: 'Ayuda',
    neutral: 'Regular',
    unfavorable: 'En contra',
    undetermined: 'Falta dato',
  },
  sourceKind: {
    nasa: 'Dato NASA',
    'local-reference': 'Referencia local',
    'user-input': 'Su respuesta',
    'demo-assumption': 'Supuesto de demo',
  },

  /** "2024-05-01" + "2024-05-07" → "1 al 7 de mayo de 2024" */
  formatPeriod: (start, end) => {
    const [startYear, startMonth, startDay] = parseDate(start);
    const [endYear, endMonth, endDay] = parseDate(end);
    if (startYear === endYear && startMonth === endMonth) return `${startDay} al ${endDay} de ${MONTHS[startMonth - 1]} de ${startYear}`;
    return `${startDay} de ${MONTHS[startMonth - 1]} de ${startYear} al ${endDay} de ${MONTHS[endMonth - 1]} de ${endYear}`;
  },

  welcome: {
    title: '¿Qué sembrar después?',
    lead: 'Compare lo que siembra hoy con dos alternativas, según el agua, el suelo y lo que a usted le importa.',
    cta: 'Comparar cultivos',
    note: 'Abre directo. Sin cuentas ni contraseñas.',
    previousScene: 'Escena anterior',
    nextScene: 'Escena siguiente',
    showScene: (name) => `Ver ${name}`,
    scenes: {
      jaguarundi: { name: 'Jaguarundi', line: 'De él viene el nombre Yago' },
      cornfield: { name: 'Milpa', line: 'El maíz, el grano de la casa' },
      hen: { name: 'Gallina', line: 'La que anda en el patio' },
      coffee: { name: 'Cafetal', line: 'Café bajo sombra' },
      cow: { name: 'Vaca', line: 'El ganado de la familia' },
      chili: { name: 'Chile', line: 'Para la mesa y para vender' },
    },
  },

  wizard: {
    steps: [
      { title: '¿Dónde siembra?', help: 'Elija la zona más cercana a su terreno.' },
      { title: '¿Qué tiene sembrado ahora?', help: 'El cultivo de este ciclo.' },
      { title: '¿Cómo es su tierra?', help: 'Si no está seguro, deje “No sé”.' },
      { title: '¿Qué le importa más?', help: 'Después lo puede cambiar para ver qué pasa.' },
    ],
    stepOf: (step, total) => `Paso ${step} de ${total}`,
    demoSiteHint: 'Zona de ejemplo · oriente del país',
    singleSiteNote: 'Por ahora solo hay una zona de ejemplo. Más zonas llegarán cuando el equipo conecte los datos.',
    textureQuestion: 'Al agarrarla con la mano es…',
    drainageQuestion: 'Cuando llueve fuerte, el agua…',
    previousStep: 'Paso anterior',
    chooseOption: 'Elija una opción',
    next: 'Seguir',
    seeComparison: 'Ver comparación',
  },

  results: {
    title: 'Su comparación',
    area: 'Zona',
    currentCrop: (crop) => `hoy tiene ${crop}`,
    soilSummary: (texture, drainage) => `Tierra: ${texture} · Agua: ${drainage}`,
    change: 'Cambiar',
    changeAnswers: 'Cambiar mis respuestas',
    missingSoil: 'Falta un dato de su tierra. La comparación puede cambiar cuando lo sepa: toque “Cambiar” para agregarlo.',
    priorityQuestion: '¿Qué le importa más?',
    tagBestFit: (goal) => `Destaca para ${goal}`,
    tagCurrent: 'Lo que hace hoy',
    tagOther: 'Otra alternativa',
    rotation: (sequence) => `Rotación: ${sequence}`,
    watchOut: 'Ojo',
    showDetails: 'Ver por qué y de dónde sale',
    hideDetails: 'Ocultar detalle',
    hideDetailsLabel: 'Ocultar por qué y de dónde sale',
    whereFrom: 'De dónde sale',
    openSource: 'Abrir la fuente ↗',
    openSourceLabel: (name) => `Abrir fuente: ${name}`,
    climateTitle: 'Clima histórico de la zona',
    noData: 'Sin dato',
    rainIn: (days) => `de lluvia en ${days} días`,
    dryDaysOf: (dry, days) => `${dry} de ${days}`,
    dryDaysCaption: 'días casi sin lluvia',
    maxTempCaption: 'máxima promedio',
    waterAlert: 'Alerta de agua',
    source: 'Fuente',
    coverage: (valid, expected) => `${valid} de ${expected} días con dato.`,
    openNasaQuery: 'Abrir la consulta a NASA ↗',
    openNasaQueryLabel: 'Abrir la consulta a NASA POWER',
    comparing: 'Comparando cultivos…',
    errorTitle: 'No se pudo comparar',
    errorText: 'Revise su conexión e intente otra vez.',
    retry: 'Intentar otra vez',
    disclaimer: (method) => `Yago sirve para explorar y conversar con un técnico de su zona. No predice cosechas ni reemplaza una visita al terreno. Método: ${method}.`,
    startOver: 'Empezar de nuevo',
    highlightMoved: (sequence) => `Ahora destaca ${sequence}`,
    highlightMovedText: (previousGoal, previousSequence, goal, reason) =>
      `Antes, para ${previousGoal}, destacaba ${previousSequence}. Para ${goal}, ${reason}. El clima y sus respuestas son los mismos: solo cambió cuánto pesa cada cosa.`,
    highlightKept: (sequence) => `Sigue destacando ${sequence}`,
    highlightKeptText: (goal, reason) => `También para ${goal}: ${reason}. El clima y sus respuestas son los mismos.`,
  },
};
