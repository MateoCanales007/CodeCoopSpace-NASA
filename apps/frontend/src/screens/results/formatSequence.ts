import type { Scenario } from '../../api/types';
import type { Translations } from '../../i18n';

/** "Maize → Beans" */
export function formatSequence(scenario: Scenario, t: Translations): string {
  return scenario.sequence.map((crop) => t.crop[crop].name).join(' → ');
}
