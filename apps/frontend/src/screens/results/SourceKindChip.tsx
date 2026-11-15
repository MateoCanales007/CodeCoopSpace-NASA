import { StyleSheet, Text, View } from 'react-native';

import type { SourceKind } from '../../api/types';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

interface SourceKindChipProps {
  kind: SourceKind;
  /** true on dark (highlighted) cards. */
  onDark?: boolean;
}

/** Small label that says where a piece of data comes from. NASA data is the only filled one. */
export function SourceKindChip({ kind, onDark = false }: SourceKindChipProps) {
  const { t } = useTranslation();
  const isNasa = kind === 'nasa';
  return (
    <View style={[styles.chip, isNasa ? styles.nasa : { borderWidth: 1, borderColor: onDark ? colors.ivoryLine : colors.line }]}>
      <Text style={[styles.text, { color: isNasa || !onDark ? colors.ink : colors.ivory }]}>{t.sourceKind[kind]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  nasa: { backgroundColor: colors.maize },
  text: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16 },
});
