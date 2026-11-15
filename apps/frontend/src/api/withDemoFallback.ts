import type { Language } from '../i18n/types';
import type { RotationApi } from './rotationApi';

const FALLBACK_WARNING: Record<Language, string> = {
  en: 'Could not reach the server. Showing demo data.',
  es: 'No se pudo conectar con el servidor. Se muestran datos de demostración.',
};

/**
 * Wraps an API so the demo never ends up blank: if the primary one fails or
 * times out, the demo data is returned with a visible warning on top.
 */
export function withDemoFallback(primary: RotationApi, demo: RotationApi): RotationApi {
  return {
    async listSites(language) {
      try {
        return await primary.listSites(language);
      } catch (error) {
        console.warn('[Yago] /v1/sites did not respond; using demo data.', error);
        return demo.listSites(language);
      }
    },
    async compareRotations(request, language) {
      try {
        return await primary.compareRotations(request, language);
      } catch (error) {
        console.warn('[Yago] /v1/compare did not respond; using demo data.', error);
        const fallback = await demo.compareRotations(request, language);
        return { ...fallback, warnings: [FALLBACK_WARNING[language], ...fallback.warnings] };
      }
    },
  };
}
