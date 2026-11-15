import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

/** Always-visible label that tells the farmer the data on screen is a demo. */
export function DemoBadge({ style }: { style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, style]}>
      <View style={styles.dot} />
      <Text style={styles.text}>{t.demoData}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.maize, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink },
  text: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, color: colors.ink },
});
