import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { FloatingHalos, SAND_TRANSITION_MS, SCENES, SceneStage } from '../../components/scene';
import { AppText, Button, Enter, ThinkingDots } from '../../components/ui';
import { useReducedMotion } from '../../context/ReducedMotionContext';
import { usePointer } from '../../hooks/usePointer';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

/** Each scene stays this long, sand transition included, while the comparison loads. */
const LOADER_SCENE_MS = SAND_TRANSITION_MS + 900;
const LOADER_STEP_MS = 2400;

/**
 * Full-screen loader shown before the first comparison arrives. It is the same
 * stage as the welcome screen: the animals and plants turn into sand and into
 * the next one, while a line says what Yago is doing.
 */
export function ComparisonLoader() {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const pointer = usePointer(!reduced);
  const [scene, setScene] = useState(0);
  const [step, setStep] = useState(0);
  const steps = t.results.loadingSteps;

  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(() => setScene((current) => (current + 1) % SCENES.length), LOADER_SCENE_MS);
    return () => clearInterval(timer);
  }, [reduced]);

  useEffect(() => {
    const timer = setInterval(() => setStep((current) => Math.min(current + 1, steps.length - 1)), LOADER_STEP_MS);
    return () => clearInterval(timer);
  }, [steps.length]);

  const size = Math.min(width * 0.96, height * 0.58, 560);

  return (
    <View style={styles.loader} accessibilityRole="progressbar" accessibilityLabel={t.results.comparing}>
      <FloatingHalos pointer={pointer} width={width} height={height} size={size * 0.9} />
      <View style={{ width: size, height: size }}>
        <SceneStage index={scene} size={size} reduced={reduced} pointer={pointer} />
      </View>
      <View style={styles.caption}>
        <View style={styles.thinking}>
          <AppText variant="lead" color={colors.ink} style={styles.loaderText}>{t.results.comparing}</AppText>
          <ThinkingDots />
        </View>
        <Enter key={step} offsetY={10} duration={380}>
          <AppText variant="body" style={styles.step} accessibilityLiveRegion="polite">{steps[step]}</AppText>
        </Enter>
      </View>
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
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden', paddingHorizontal: 20 },
  caption: { alignItems: 'center', gap: 6, minHeight: 72 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loaderText: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  step: { textAlign: 'center', color: colors.inkSoft, maxWidth: 360 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  error: { padding: 24 },
  centerText: { textAlign: 'center' },
  retry: { alignSelf: 'stretch' },
});
