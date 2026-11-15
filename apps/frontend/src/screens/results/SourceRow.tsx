import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Source } from '../../api/types';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';
import { SourceKindChip } from './SourceKindChip';

/** One data source: kind, name, version, note and a link when there is one. */
export function SourceRow({ source, onDark }: { source: Source; onDark: boolean }) {
  const { t } = useTranslation();
  const foreground = onDark ? colors.ivory : colors.ink;
  const { url } = source;

  return (
    <View style={styles.row}>
      <View style={styles.heading}>
        <SourceKindChip kind={source.kind} onDark={onDark} />
        <Text style={[styles.name, { color: foreground }]}>
          {source.name}
          {source.version ? ` · ${source.version}` : ''}
        </Text>
      </View>
      <Text style={[styles.note, { color: onDark ? colors.ivorySoft : colors.inkSoft }]}>{source.note}</Text>
      {url ? (
        <Pressable accessibilityRole="link" accessibilityLabel={t.results.openSourceLabel(source.name)} onPress={() => Linking.openURL(url)} hitSlop={8} style={styles.link}>
          <Text style={[styles.linkText, { color: foreground }]}>{t.results.openSource}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 3 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, flexShrink: 1 },
  note: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  link: { alignSelf: 'flex-start', paddingVertical: 6 },
  linkText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, textDecorationLine: 'underline' },
});
