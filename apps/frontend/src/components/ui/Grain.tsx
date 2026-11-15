import { Image, StyleSheet, View } from 'react-native';

import { images } from '../../theme';

interface GrainProps {
  /** Light grain, for dark surfaces. */
  light?: boolean;
  opacity?: number;
}

/** Sand-grain texture over its parent. It never receives touches. */
export function Grain({ light = false, opacity = 0.22 }: GrainProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity }]}>
      <Image source={light ? images.grainLight : images.grain} resizeMode="repeat" style={styles.fill} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
});
