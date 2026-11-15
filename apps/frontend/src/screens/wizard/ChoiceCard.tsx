import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '../../components/ui';
import { USE_NATIVE_DRIVER, colors, fonts } from '../../theme';
import type { IconName } from '../../theme';

interface ChoiceCardProps {
  title: string;
  hint?: string;
  icon?: IconName;
  selected: boolean;
  onPress: () => void;
  /** Half-width card for two-column grids. */
  compact?: boolean;
}

/** Large radio option: the whole card is the touch target. */
export function ChoiceCard({ title, hint, icon, selected, onPress, compact = false }: ChoiceCardProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const springTo = (toValue: number) => Animated.spring(scale, { toValue, speed: 40, bounciness: 5, useNativeDriver: USE_NATIVE_DRIVER }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, compact && styles.compactWrapper]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected, checked: selected }}
        accessibilityLabel={hint ? `${title}. ${hint}` : title}
        onPress={onPress}
        onPressIn={() => springTo(0.98)}
        onPressOut={() => springTo(1)}
        style={[styles.card, compact && styles.cardCompact, selected && styles.cardSelected]}
      >
        {icon ? <Icon name={icon} size={54} /> : null}
        <View style={styles.text}>
          <Text style={[styles.title, compact && styles.titleCompact, selected && styles.titleSelected]}>{title}</Text>
          {hint ? <Text style={[styles.hint, selected && styles.hintSelected]}>{hint}</Text> : null}
        </View>
        <View style={[styles.radio, compact && styles.radioCorner, selected && styles.radioSelected]}>
          {selected ? <Text style={styles.check}>✓</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  compactWrapper: { flexGrow: 1, flexBasis: '46%' },
  card: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 22, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.line },
  cardCompact: { minHeight: 104, alignItems: 'flex-start' },
  cardSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  text: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 25, color: colors.ink },
  // Leaves room for the radio mark pinned to the corner.
  titleCompact: { paddingRight: 30 },
  titleSelected: { color: colors.ivory },
  hint: { fontFamily: fonts.body, fontSize: 15, lineHeight: 20, color: colors.inkSoft, marginTop: 1 },
  hintSelected: { color: colors.ivorySoft },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(23,26,22,0.4)', alignItems: 'center', justifyContent: 'center' },
  radioCorner: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: 12 },
  radioSelected: { backgroundColor: colors.maize, borderColor: colors.maize },
  check: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 18, color: colors.ink },
});
