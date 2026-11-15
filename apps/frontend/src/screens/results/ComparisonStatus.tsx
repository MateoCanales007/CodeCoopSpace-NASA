import { Animated, Image, StyleSheet, View } from 'react-native';

import { AppText, Button } from '../../components/ui';
import { useLoopAnimation } from '../../hooks/useLoopAnimation';
import { useTranslation } from '../../i18n';
import { colors, fonts, images } from '../../theme';
import { interpolate } from '../../utils/animation';

/** Full-screen loader shown before the first comparison arrives. */
export function ComparisonLoader() {
  const { t } = useTranslation();
  const pulse = useLoopAnimation(900);
  return (
    <View style={styles.centered} accessibilityRole="progressbar" accessibilityLabel={t.results.comparing}>
      <Animated.View style={{ opacity: interpolate(pulse, [0, 1], [0.45, 1]), transform: [{ scale: interpolate(pulse, [0, 1], [0.96, 1.04]) }] }}>
        <Image source={images.symbol} style={styles.symbol} resizeMode="contain" />
      </Animated.View>
      <AppText variant="lead" color={colors.ink} style={styles.loaderText}>{t.results.comparing}</AppText>
    </View>
  );
}

/** Shown when the comparison could not be loaded at all. */
export function ComparisonError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={[styles.centered, styles.error]}>
      <AppText variant="title" style={styles.centerText}>{t.results.errorTitle}</AppText>
      <AppText variant="lead" style={styles.centerText}>{t.results.errorText}</AppText>
      <Button label={t.results.retry} onPress={onRetry} style={styles.retry} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  symbol: { width: 150, height: 143 },
  loaderText: { fontFamily: fonts.bold },
  error: { padding: 24 },
  centerText: { textAlign: 'center' },
  retry: { alignSelf: 'stretch' },
});
