import { StyleSheet, Text, View } from 'react-native';

import { summarizeComplementaryClimate } from '../../api/complementaryClimate';
import type { ComplementaryClimate } from '../../api/types';
import { AppText } from '../../components/ui';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

interface ComplementaryClimateCardProps {
  /** null while the first request is in flight. */
  climate: ComplementaryClimate | null;
  loading: boolean;
}

/**
 * Recent weather from a second provider (Meteomatics), shown under the NASA
 * card as context. It is always labelled as modelled data that does not change
 * the comparison, with its period, coverage and retrieval date.
 */
export function ComplementaryClimateCard({ climate, loading }: ComplementaryClimateCardProps) {
  const { t } = useTranslation();
  const text = t.results;

  const heading = (
    <View style={styles.heading}>
      <View style={styles.chip}>
        <Text style={styles.chipText}>{text.complementaryChip}</Text>
      </View>
      <AppText variant="label">{text.complementaryTitle}</AppText>
    </View>
  );

  if (!climate) {
    return (
      <View style={styles.card}>
        {heading}
        <AppText variant="small">{loading ? text.complementaryLoading : text.complementaryReason.unreachable}</AppText>
      </View>
    );
  }

  if (climate.status === 'unavailable') {
    return (
      <View style={styles.card}>
        {heading}
        <AppText variant="body" style={styles.unavailable}>{text.complementaryReason[climate.reason ?? 'upstream_error']}</AppText>
        <AppText variant="small">{text.complementaryIndependent}</AppText>
      </View>
    );
  }

  const summary = summarizeComplementaryClimate(climate.days);
  const days = climate.coverage.validDays;
  const figures = [
    { key: 'rain', value: summary.precipTotalMm !== null ? `${summary.precipTotalMm} mm` : text.noData, caption: text.rainIn(days) },
    { key: 'high', value: summary.tMaxMeanC !== null ? `${summary.tMaxMeanC} °C` : text.noData, caption: text.maxTempCaption },
    { key: 'low', value: summary.tMinMeanC !== null ? `${summary.tMinMeanC} °C` : text.noData, caption: text.minTempCaption },
  ];
  const retrievedAt = climate.provenance?.retrievedAt;

  return (
    <View style={[styles.card, loading && styles.refreshing]}>
      {heading}

      <View style={styles.figures}>
        {figures.map((figure) => (
          <View key={figure.key} style={styles.figure}>
            <Text style={styles.figureValue}>{figure.value}</Text>
            <Text style={styles.figureCaption}>{figure.caption}</Text>
          </View>
        ))}
      </View>

      {climate.stale ? (
        <View style={styles.stale}>
          <AppText variant="small" color={colors.ink}>{text.complementaryStale}</AppText>
        </View>
      ) : null}

      <AppText variant="small">
        {climate.provenance?.product ?? text.complementaryChip} · {t.formatPeriod(climate.period.start, climate.period.end)} · {text.coverage(climate.coverage.validDays, climate.coverage.expectedDays)}
        {retrievedAt ? ` ${text.retrieved(t.formatDay(retrievedAt.slice(0, 10)))}` : ''}
      </AppText>
      <AppText variant="small">{text.complementaryNote}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outlined instead of filled, so it reads as secondary to the NASA card.
  card: { borderRadius: 26, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.line },
  refreshing: { opacity: 0.6 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  chipText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, color: colors.ink },
  figures: { flexDirection: 'row', gap: 8 },
  figure: { flex: 1, gap: 4 },
  figureValue: { fontFamily: fonts.display, fontSize: 23, lineHeight: 27, color: colors.ink, letterSpacing: -0.4 },
  figureCaption: { fontFamily: fonts.body, fontSize: 14, lineHeight: 18, color: colors.inkSoft },
  unavailable: { fontFamily: fonts.semiBold },
  stale: { borderLeftWidth: 3, borderLeftColor: colors.maize, paddingLeft: 12, paddingVertical: 2 },
});
