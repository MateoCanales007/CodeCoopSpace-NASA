import { Image, View } from 'react-native';

import { colors, icons } from '../../theme';
import type { IconName } from '../../theme';

interface IconProps {
  name: IconName;
  size?: number;
  /** Draw only the glyph, without the light circle behind it. */
  bare?: boolean;
}

/** Sandy brand icon, on a light circle by default so it keeps contrast on dark cards. */
export function Icon({ name, size = 44, bare = false }: IconProps) {
  const glyphSize = bare ? size : size * 0.7;
  const glyph = <Image source={icons[name]} style={{ width: glyphSize, height: glyphSize }} resizeMode="contain" />;
  if (bare) return glyph;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' }}>
      {glyph}
    </View>
  );
}
