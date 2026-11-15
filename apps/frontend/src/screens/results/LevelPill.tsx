import { StyleSheet, Text, View } from 'react-native';

import type { Criterion } from '../../api/types';
import { Icon } from '../../components/ui';
import { LEVEL_MARK, PRIORITY_ICON } from '../../constants/domain';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

interface LevelPillProps {
  criterion: Criterion;
  onDark: boolean;
  /** true for the criterion the farmer put first; it gets a stronger border. */
  isTopPriority: boolean;
}

/** How a rotation does on one criterion: icon, name and a level with a shape, never color alone. */
export function LevelPill({ criterion, onDark, isTopPriority }: LevelPillProps) {
  const { t } = useTranslation();
  const level = criterion.level ?? 'undetermined';
  const neutralTone = onDark ? colors.ivory : colors.ink;
  const tone = criterion.level === 'favorable' ? (onDark ? colors.maize : colors.leaf) : neutralTone;

  return (
    <View style={[styles.pill, { borderColor: onDark ? colors.ivoryLine : colors.line }, isTopPriority && { borderColor: onDark ? colors.maize : colors.ink, borderWidth: 2 }]}>
      <Icon name={PRIORITY_ICON[criterion.priority]} size={32} />
      <Text style={[styles.name, { color: onDark ? colors.ivorySoft : colors.inkSoft }]}>{t.priority[criterion.priority].short}</Text>
      <Text style={[styles.level, { color: tone }]} numberOfLines={1}>
        {LEVEL_MARK[level]} {t.level[level]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flex: 1, borderWidth: 1, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 4, alignItems: 'center', gap: 3 },
  name: { fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 17 },
  level: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 19 },
});
