import { Pressable, StyleSheet, View } from 'react-native';

import { SCENES } from '../../components/scene';
import { AppText, RoundButton } from '../../components/ui';
import { useTranslation } from '../../i18n';
import { colors } from '../../theme';

interface SceneControlProps {
  index: number;
  onNext: () => void;
  onPrevious: () => void;
  onSelect: (index: number) => void;
}

/** Visible control to change the welcome scene: caption, dots and two arrows. */
export function SceneControl({ index, onNext, onPrevious, onSelect }: SceneControlProps) {
  const { t } = useTranslation();
  const { scenes } = t.welcome;
  const current = scenes[SCENES[index].key];

  return (
    <View style={styles.container}>
      <View style={styles.caption}>
        <AppText variant="label" color={colors.ink}>{current.name}</AppText>
        <AppText variant="small" numberOfLines={1}>{current.line}</AppText>
        <View style={styles.dots} accessibilityRole="tablist">
          {SCENES.map((scene, sceneIndex) => (
            <Pressable
              key={scene.key}
              accessibilityRole="button"
              accessibilityLabel={t.welcome.showScene(scenes[scene.key].name)}
              hitSlop={10}
              onPress={() => onSelect(sceneIndex)}
              style={[styles.dot, sceneIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      </View>
      <RoundButton symbol="←" label={t.welcome.previousScene} onPress={onPrevious} />
      <RoundButton symbol="→" label={t.welcome.nextScene} onPress={onNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  caption: { flex: 1 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 9, alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: 'rgba(23,26,22,0.26)' },
  dotActive: { width: 26, backgroundColor: colors.ink },
});
