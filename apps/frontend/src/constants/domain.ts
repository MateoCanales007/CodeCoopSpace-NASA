import type { CriterionLevel, CropId, Priority, SoilDrainage, SoilTexture } from '../api/types';
import type { IconName } from '../theme';

/** Display order of every option the farmer can pick. Labels live in src/i18n. */
export const CROPS: CropId[] = ['maize', 'bean', 'sorghum'];
export const PRIORITIES: Priority[] = ['water', 'soil', 'diversification'];
export const SOIL_TEXTURES: SoilTexture[] = ['sandy', 'loam', 'clay', 'unknown'];
export const SOIL_DRAINAGES: SoilDrainage[] = ['good', 'poor', 'unknown'];

export const CROP_ICON: Record<CropId, IconName> = { maize: 'maize', bean: 'bean', sorghum: 'sorghum' };
export const PRIORITY_ICON: Record<Priority, IconName> = { water: 'water', soil: 'soil', diversification: 'diversify' };

export type LevelKey = CriterionLevel | 'undetermined';

/** A shape next to each level so it never depends on color alone. */
export const LEVEL_MARK: Record<LevelKey, string> = {
  favorable: '▲',
  neutral: '●',
  unfavorable: '▼',
  undetermined: '?',
};
