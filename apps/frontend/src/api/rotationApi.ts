import type { Language } from '../i18n/types';
import type { CompareRequest, CompareResponse, Site } from './types';

/**
 * The only thing screens and hooks know about the backend.
 * Implementations: `createHttpRotationApi` (real API) and `createDemoRotationApi`
 * (bundled demo data). Add a new one without touching any screen.
 */
export interface RotationApi {
  /** Supported sites — `GET /v1/sites`. */
  listSites(language: Language): Promise<Site[]>;
  /** Rotation comparison — `POST /v1/compare`. */
  compareRotations(request: CompareRequest, language: Language): Promise<CompareResponse>;
}
