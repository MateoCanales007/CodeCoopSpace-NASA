/**
 * Types of the shared contract (docs/CONTRATO.md, status: proposal).
 * Fields are camelCase, exactly like the API JSON.
 *
 * Extensions this frontend proposes and the team still has to agree on:
 *  - `soil.texture` and `soil.drainage` values other than "unknown"
 *  - `scenarios[].role`, `summary`, `limitation`, `missingData`
 *  - `highlight`: which alternative stands out for the top priority
 *  - `isDemo`: marks demo data
 *  - text language negotiated with the `Accept-Language` header (en | es)
 */

export type CropId = 'maize' | 'bean' | 'sorghum';
export type Priority = 'water' | 'soil' | 'diversification';
export type SoilTexture = 'sandy' | 'loam' | 'clay' | 'unknown';
export type SoilDrainage = 'good' | 'poor' | 'unknown';

export interface Site {
  id: string;
  name: string;
  department: string;
  /** Approximate public coordinates; never a real plot. */
  approxLat: number;
  approxLon: number;
  crops: CropId[];
  isDemo: boolean;
}

export interface CompareRequest {
  siteId: string;
  currentCrop: CropId;
  soil: { texture: SoilTexture; drainage: SoilDrainage };
  /** Order matters: the first one weighs the most. */
  priorities: Priority[];
}

export type SourceKind = 'nasa' | 'local-reference' | 'user-input' | 'demo-assumption';

export interface Source {
  id: string;
  name: string;
  url: string | null;
  version: string | null;
  kind: SourceKind;
  note: string;
}

export interface ClimateMetric {
  id: 'precipTotal' | 'dryDays' | 'tMaxMean';
  value: number | null;
  unit: string;
  /** Explicit cause when `value` is null, or a note on how it was computed. */
  reason: string | null;
  sourceId: string;
}

export interface Climate {
  status: 'available' | 'partial' | 'unavailable';
  period: { start: string; end: string };
  coverage: { validDays: number; expectedDays: number };
  metrics: ClimateMetric[];
  sourceId: string;
  /** null until the data team verifies the spatial scale. */
  spatialScale: string | null;
  cacheAgeHours: number | null;
  /** Alert the climate data raises in the comparison, if any. */
  alert: { priority: Priority; text: string } | null;
  note: string;
}

export type CriterionLevel = 'favorable' | 'neutral' | 'unfavorable';

export interface Criterion {
  priority: Priority;
  status: 'evaluable' | 'undetermined';
  /** null when the criterion cannot be determined. */
  level: CriterionLevel | null;
  value: number | null;
  unit: string | null;
  reason: string;
  evidence: string[];
}

export interface Scenario {
  id: string;
  role: 'current' | 'alternative';
  sequence: CropId[];
  summary: string;
  limitation: string;
  missingData: string | null;
  criteria: Criterion[];
  sourceIds: string[];
}

export interface Highlight {
  scenarioId: string;
  priority: Priority;
  reason: string;
}

export interface CompareResponse {
  isDemo: boolean;
  climate: Climate;
  scenarios: Scenario[];
  sources: Source[];
  warnings: string[];
  methodVersion: string;
  highlight: Highlight | null;
}
