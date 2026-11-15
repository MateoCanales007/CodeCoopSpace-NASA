import type { CropId, Priority, SoilDrainage, SoilTexture } from '../api/types';

/** What the farmer has answered so far. Soil defaults to "unknown" so nobody is forced to guess. */
export interface Answers {
  siteId: string | null;
  crop: CropId | null;
  texture: SoilTexture;
  drainage: SoilDrainage;
  priority: Priority | null;
}

export const EMPTY_ANSWERS: Answers = {
  siteId: null,
  crop: null,
  texture: 'unknown',
  drainage: 'unknown',
  priority: null,
};
