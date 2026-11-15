import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Climate, ClimateMetric, Source } from '../../api/types';
import { AppText, Icon } from '../../components/ui';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';
import type { IconName } from '../../theme';
import { SourceKindChip } from './SourceKindChip';

interface ClimateCardProps {
  climate: Climate;
  /** Every source of the response; the card looks up the climate one. */
  sources: Source[];
}

/**
 * Historical climate behind the comparison: product, version, period, units
 * and coverage are always stated, and it is labelled as past weather for a
 * wide area, never a forecast for a plot.
 */
export function ClimateCard({ climate, sources }: ClimateCardProps) {
  const { t } = useTranslation();
  const text = t.results;
  const source = sources.find((item) => item.id === climate.sourceId);
  const sourceUrl = source?.url;
  const days = climate.coverage.validDays;
  const metric = (id: ClimateMetric['id']) => climate.metrics.find((item) => item.id === id)?.value ?? null;
  const rain = metric('precipTotal');
  const dryDays = metric('dryDays');
  const maxTemp = metric('tMaxMean');

  const figures: { icon: IconName; value: string; caption: string }[] = [
    { icon: 'rain', value: rain !== null ? `${rain} mm` : text.noData, caption: text.rainIn(days) },
    { icon: 'dry', value: dryDays !== null ? text.dryDaysOf(dryDays, days) : text.noData, caption: text.dryDaysCaption },
    { icon: 'sun', value: maxTemp !== null ? `${maxTemp} °C` : text.noData, caption: text.maxTempCaption },
  ];
  const period = climate.period.start && climate.period.end ? ` · ${t.formatPeriod(climate.period.start, climate.period.end)}` : '';

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <SourceKindChip kind={source?.kind ?? 'nasa'} />
        <AppText variant="label">{text.climateTitle}</AppText>
      </View>

      <View style={styles.figures}>
        {figures.map((figure) => (
          <View key={figure.icon} style={styles.figure}>
            <Icon name={figure.icon} size={46} />
            <Text style={styles.figureValue}>{figure.value}</Text>
            <Text style={styles.figureCaption}>{figure.caption}</Text>
          </View>
        ))}
      </View>

      {climate.alert ? (
        <View style={styles.alert}>
          <Text style={styles.alertTitle}>{text.waterAlert}</Text>
          <Text style={styles.alertText}>{climate.alert.text}</Text>
        </View>
      ) : null}

      <AppText variant="small">
        {source?.name ?? text.source}
        {source?.version ? ` ${source.version}` : ''}
        {period} · {text.coverage(climate.coverage.validDays, climate.coverage.expectedDays)}
      </AppText>
      {climate.note ? <AppText variant="small">{climate.note}</AppText> : null}

      {sourceUrl ? (
        <Pressable accessibilityRole="link" accessibilityLabel={text.openNasaQueryLabel} onPress={() => Linking.openURL(sourceUrl)} hitSlop={8} style={styles.link}>
          <Text style={styles.linkText}>{text.openNasaQuery}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.sand, borderRadius: 26, padding: 18, gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  figures: { flexDirection: 'row', gap: 8 },
  figure: { flex: 1, gap: 4 },
  figureValue: { fontFamily: fonts.display, fontSize: 23, lineHeight: 27, color: colors.ink, letterSpacing: -0.4, marginTop: 4 },
  figureCaption: { fontFamily: fonts.body, fontSize: 14, lineHeight: 18, color: colors.inkSoft },
  alert: { backgroundColor: colors.ink, borderRadius: 18, padding: 14, gap: 2, borderLeftWidth: 6, borderLeftColor: colors.maize },
  alertTitle: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.maize },
  alertText: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 23, color: colors.ivory },
  link: { alignSelf: 'flex-start', paddingVertical: 6 },
  linkText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.ink, textDecorationLine: 'underline' },
});
