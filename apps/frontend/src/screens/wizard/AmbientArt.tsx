import { Animated } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { useLoopAnimation } from '../../hooks/useLoopAnimation';
import { interpolate } from '../../utils/animation';

/** Faint background art that breathes in a corner of the wizard. */
export function AmbientArt({ source, size }: { source: ImageSourcePropType; size: number }) {
  const breath = useLoopAnimation(4200);
  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        transform: [
          { translateY: interpolate(breath, [0, 1], [0, -8]) },
          { rotate: interpolate(breath, [0, 1], ['-1deg', '1.2deg']) },
        ],
      }}
    />
  );
}
