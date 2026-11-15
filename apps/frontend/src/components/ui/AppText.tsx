import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';

import { colors, fonts } from '../../theme';

type Variant = 'display' | 'title' | 'lead' | 'body' | 'small' | 'label';

interface AppTextProps {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  accessibilityRole?: 'header' | 'text' | 'link';
}

/** Text with the app's type scale. Sizes are large on purpose: easy to read outdoors. */
export function AppText({ variant = 'body', color, style, children, ...rest }: AppTextProps) {
  return (
    <Text {...rest} style={[styles[variant], color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: { fontFamily: fonts.display, fontSize: 44, lineHeight: 46, color: colors.ink, letterSpacing: -1 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, letterSpacing: -0.5 },
  lead: { fontFamily: fonts.body, fontSize: 19, lineHeight: 27, color: colors.inkSoft },
  body: { fontFamily: fonts.body, fontSize: 17, lineHeight: 25, color: colors.ink },
  small: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.inkSoft },
  label: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, color: colors.inkSoft, letterSpacing: 0.9, textTransform: 'uppercase' },
});
