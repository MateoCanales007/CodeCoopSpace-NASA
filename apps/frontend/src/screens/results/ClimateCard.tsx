import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Climate, ClimateMetric, ClimateMetricId, Source } from '../../api/types';
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

const METRIC_ICON: Record<ClimateMetricId, IconName> = {
  seasonRainMean: 'rain',
  precipTotal: 'rain',
  drySpellYears: 'dry',
  dryDays: 'dry',
  tMaxMean: 'sun',
};

/**
 * Historical weather behind the comparison, as the server computed it from
 * NASA POWER. Product, version, period, scale and coverage are always stated,
 * and it is labelled as past weather for a wide area, never a forecast.
 */
export function ClimateCard({ climate, sources }: ClimateCardProps) {
  const { t } = useTranslation();
  const text = t.results;
  const source = sources.find((item) => item.id === climate.sourceId);
  const sourceUrl = source?.url;
  const isSample = climate.kind === 'saved-sample';

  const formatValue = (metric: ClimateMetric) => {
    if (metric.value === null) return text.noData;
    if (metric.total !== null) return text.outOf(metric.value, metric.total);
    return `${metric.value} ${metric.unit}`;
  };
  const coverage = isSample ? text.coverage(climate.coverage.validDays, climate.coverage.expectedDays) : text.yearsCoverage(climate.validYears, climate.expectedYears);

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <SourceKindChip kind={source?.kind ?? 'nasa'} />
        <AppText variant="label">{isSample ? text.climateSampleTitle : text.climateTitle}</AppText>
      </View>

      <View style={styles.figures}>
        {climate.metrics.map((metric) => (
          <View key={metric.id} style={styles.figure}>
            <Icon name={METRIC_ICON[metric.id] ?? 'rain'} size={44} />
            <View style={styles.figureText}>
              <Text style={styles.figureValue}>{formatValue(metric)}</Text>
              <Text style={styles.figureCaption}>{metric.value === null && metric.reason ? metric.reason : metric.label}</Text>
            </View>
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
        {climate.periodLabel ? ` · ${climate.periodLabel}` : ''} · {coverage}
        {climate.spatialScale ? ` ${climate.spatialScale}.` : ''}
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
  figures: { gap: 12 },
  figure: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  figureText: { flex: 1 },
  figureValue: { fontFamily: fonts.display, fontSize: 23, lineHeight: 27, color: colors.ink, letterSpacing: -0.4 },
  figureCaption: { fontFamily: fonts.body, fontSize: 15, lineHeight: 20, color: colors.inkSoft },
  alert: { backgroundColor: colors.ink, borderRadius: 18, padding: 14, gap: 2, borderLeftWidth: 6, borderLeftColor: colors.maize },
  alertTitle: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.maize },
  alertText: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 23, color: colors.ivory },
  link: { alignSelf: 'flex-start', paddingVertical: 6 },
  linkText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.ink, textDecorationLine: 'underline' },
});
