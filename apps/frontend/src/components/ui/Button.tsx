import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { USE_NATIVE_DRIVER, colors, fonts } from '../../theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  /** Shows a round arrow badge after the label. */
  showArrow?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Large button, easy to hit with the thumb (60 px tall). */
export function Button({ label, onPress, variant = 'primary', disabled = false, showArrow = false, style }: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const springTo = (toValue: number) => Animated.spring(scale, { toValue, speed: 40, bounciness: 6, useNativeDriver: USE_NATIVE_DRIVER }).start();
  const primary = variant === 'primary';

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => springTo(0.97)}
        onPressOut={() => springTo(1)}
        style={[styles.base, primary ? styles.primary : styles.ghost, disabled && styles.disabled]}
      >
        <Text style={[styles.label, { color: primary ? colors.ivory : colors.ink }]} numberOfLines={1}>
          {label}
        </Text>
        {showArrow ? (
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>→</Text>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 60, borderRadius: 30, paddingHorizontal: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  primary: { backgroundColor: colors.ink },
  ghost: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.ink },
  disabled: { opacity: 0.38 },
  label: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 24 },
  arrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.maize, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  arrowText: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 22, color: colors.ink },
});
