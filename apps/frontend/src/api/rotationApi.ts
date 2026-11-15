import type { Language } from '../i18n/types';
import type { CompareRequest, CompareResponse, ComplementaryClimate, ComplementaryClimateQuery, CurrentWeather, Site } from './types';

/**
 * The only thing screens and hooks know about the backend.
 * Implementation: `createHttpRotationApi` (the team's FastAPI server). A test double
 * or another transport can implement it without touching any screen.
 */
export interface RotationApi {
  /** Supported sites — `GET /v1/sites`. */
  listSites(language: Language): Promise<Site[]>;
  /** Rotation comparison — `POST /v1/compare`. */
  compareRotations(request: CompareRequest, language: Language): Promise<CompareResponse>;
  getCurrentWeather(siteId: string, language: Language): Promise<CurrentWeather>;
  /** Complementary weather from Meteomatics: `GET /v1/climate/meteomatics`. Never feeds the comparison. */
  getComplementaryClimate(query: ComplementaryClimateQuery, language: Language): Promise<ComplementaryClimate>;
}
