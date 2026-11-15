import type { ImageSourcePropType } from 'react-native';

export interface SandMorphProps {
  /** Sharp image of every scene, in scene order. */
  sources: ImageSourcePropType[];
  /** Index of the visible scene; a change starts the transition. */
  index: number;
  /** Side of the square stage, in px. */
  size: number;
  enabled: boolean;
  duration: number;
  /** Called once every image has been sampled and the effect can be used. */
  onReady: () => void;
}
