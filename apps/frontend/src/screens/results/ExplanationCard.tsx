import { StyleSheet, Text, View } from 'react-native';

import type { Explanation } from '../../api/types';
import { AppText } from '../../components/ui';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

interface ExplanationCardProps {
  explanation: Explanation;
}

const PARTS = ['consider', 'influence', 'caution', 'verify'] as const;

/**
 * Plain-language explanation of the calculated comparison: what is worth
 * considering, what weighed most, the main caution and what to confirm before
 * sowing. It always says whether an AI model or the rules wrote the wording.
 */
export function ExplanationCard({ explanation }: ExplanationCardProps) {
  const { t } = useTranslation();
  const text = t.results;
  const byAi = explanation.source === 'groq';

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <AppText variant="label" color={colors.ink}>{text.explanationTitle}</AppText>
        <View style={[styles.chip, byAi && styles.chipAi]}>
          <Text style={styles.chipText}>{byAi ? text.explanationAiChip : text.explanationRulesChip}</Text>
        </View>
      </View>

      {PARTS.map((part) => (
        <View key={part} style={styles.part}>
          <Text style={styles.partLabel}>{text.explanationLabels[part]}</Text>
          <Text style={part === 'consider' ? styles.lead : styles.body}>{explanation[part]}</Text>
        </View>
      ))}

      <AppText variant="small">
        {byAi
          ? text.explanationByAi(explanation.model ?? 'Groq')
          : `${text.explanationByRules}${explanation.fallbackReason ? ` ${text.explanationFallback[explanation.fallbackReason]}` : ''}`}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: 26, padding: 18, gap: 14, borderWidth: 1, borderColor: colors.line, borderLeftWidth: 6, borderLeftColor: colors.maize },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  chipAi: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, color: colors.inkSoft },
  part: { gap: 2 },
  partLabel: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.inkSoft },
  lead: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 26, color: colors.ink },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.ink },
});
