import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { LANGUAGES, useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

/** Two-segment language switch: English by default, Spanish one tap away. */
export function LanguageToggle({ style }: { style?: StyleProp<ViewStyle> }) {
  const { language, setLanguage, t } = useTranslation();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={t.language} style={[styles.container, style]}>
      {LANGUAGES.map((option) => {
        const selected = option.id === language;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            accessibilityLabel={option.label}
            hitSlop={{ top: 6, bottom: 6 }}
            onPress={() => !selected && setLanguage(option.id)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{option.short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', borderRadius: 22, borderWidth: 2, borderColor: colors.ink, backgroundColor: 'rgba(247,243,232,0.8)', padding: 2, alignSelf: 'flex-start' },
  segment: { minWidth: 42, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  segmentSelected: { backgroundColor: colors.ink },
  text: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 18, color: colors.ink, letterSpacing: 0.4 },
  textSelected: { color: colors.ivory },
});
