import { useEffect, useRef } from 'react';
import type { ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { Priority, Scenario, Site } from '../../api/types';
import { AppText, Button, DemoBadge, Enter, LanguageToggle, Logo } from '../../components/ui';
import { useComparison } from '../../hooks/useComparison';
import { useTranslation } from '../../i18n';
import { WIDE_BREAKPOINT, colors, fonts, isWeb } from '../../theme';
import type { Answers } from '../../types/answers';
import { ClimateCard } from './ClimateCard';
import { ComparisonError, ComparisonLoader } from './ComparisonStatus';
import { PriorityChangeBanner } from './PriorityChangeBanner';
import { PrioritySwitch } from './PrioritySwitch';
import { ScenarioCard } from './ScenarioCard';

interface ResultsScreenProps {
  site: Site | null;
  answers: Answers;
  onPriorityChange: (priority: Priority) => void;
  onEdit: () => void;
  onRestart: () => void;
}

/** Frosted-glass effect for the bottom dock (web only; native keeps the translucent fill). */
const glass = isWeb ? ({ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' } as object) : null;

/**
 * Order of the cards. On phones the highlighted alternative goes first so it
 * is seen without scrolling; on desktop every rotation keeps its column.
 */
function orderScenarios(scenarios: Scenario[], highlightedId: string | null, wide: boolean): Scenario[] {
  const rank = (scenario: Scenario) => {
    if (wide) return scenario.role === 'current' ? 0 : 1;
    if (scenario.id === highlightedId) return 0;
    return scenario.role === 'alternative' ? 1 : 2;
  };
  return [...scenarios].sort((a, b) => rank(a) - rank(b));
}

/** Current rotation plus two alternatives, with the priority switch always at hand. */
export function ResultsScreen({ site, answers, onPriorityChange, onEdit, onRestart }: ResultsScreenProps) {
  const { language, t } = useTranslation();
  const text = t.results;
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const priority = answers.priority ?? 'water';
  const { data, loading, failed, change, reload } = useComparison(answers, priority, language);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  // Bring the explanation into view when the priority change produced one.
  useEffect(() => {
    if (change) scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [change]);

  if (!data) {
    return <View style={styles.root}>{failed ? <ComparisonError onRetry={reload} /> : <ComparisonLoader />}</View>;
  }

  const highlightedId = data.highlight?.scenarioId ?? null;
  const scenarios = orderScenarios(data.scenarios, highlightedId, wide);
  const soilIsIncomplete = answers.texture === 'unknown' || answers.drainage === 'unknown';

  return (
    <View style={styles.root}>
      <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, wide ? styles.scrollWide : styles.scrollNarrow]} showsVerticalScrollIndicator={wide}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel={t.backToStart} onPress={onRestart} hitSlop={8}>
            <Logo height={wide ? 40 : 34} />
          </Pressable>
          <LanguageToggle />
        </View>

        <Enter style={{ marginTop: wide ? 28 : 18 }}>
          {data.isDemo ? <DemoBadge style={styles.demoBadge} /> : null}
          <AppText variant="title" accessibilityRole="header" style={wide ? styles.titleWide : undefined}>
            {text.title}
          </AppText>
          <View style={styles.answers}>
            <View style={styles.answersText}>
              <AppText variant="body" style={styles.answersMain}>
                {site?.name ?? text.area} · {text.currentCrop(answers.crop ? t.crop[answers.crop].inline : '')}
              </AppText>
              <AppText variant="small">{text.soilSummary(t.texture[answers.texture].inline, t.drainage[answers.drainage].inline)}</AppText>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={text.changeAnswers} onPress={onEdit} hitSlop={8} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
              <Text style={styles.editText}>{text.change}</Text>
            </Pressable>
          </View>
          {soilIsIncomplete ? (
            <View style={styles.note}>
              <AppText variant="small" color={colors.ink}>{text.missingSoil}</AppText>
            </View>
          ) : null}
        </Enter>

        {wide ? (
          <Enter delay={80} style={styles.switchWide}>
            <AppText variant="label" color={colors.ink}>{text.priorityQuestion}</AppText>
            <PrioritySwitch value={priority} onChange={onPriorityChange} busy={loading} />
          </Enter>
        ) : null}

        <PriorityChangeBanner change={change} data={data} priority={priority} />

        <View style={[wide ? styles.cardsWide : styles.cards, loading && styles.refreshing]}>
          {scenarios.map((scenario, position) => {
            const highlighted = scenario.id === highlightedId;
            return (
              <Enter key={`${scenario.id}-${highlighted ? 'on' : 'off'}-${priority}`} delay={60 + position * 90} offsetY={22} style={wide ? styles.cardColumn : undefined}>
                <ScenarioCard scenario={scenario} sources={data.sources} priority={priority} highlighted={highlighted} />
              </Enter>
            );
          })}
        </View>

        <Enter delay={320} style={styles.climate}>
          <ClimateCard climate={data.climate} sources={data.sources} />
        </Enter>

        <View style={styles.footer}>
          {data.warnings.map((warning) => (
            <AppText key={warning} variant="small">• {warning}</AppText>
          ))}
          <AppText variant="small" style={styles.disclaimer}>{text.disclaimer(data.methodVersion)}</AppText>
          <Button label={text.startOver} variant="ghost" onPress={onRestart} style={[styles.startOver, { alignSelf: wide ? 'flex-start' : 'stretch' }]} />
        </View>
      </ScrollView>

      {/* On phones the switch stays at the bottom, within reach of the thumb. */}
      {!wide ? (
        <View style={[styles.dock, glass]}>
          <AppText variant="label" color={colors.ink} style={styles.dockLabel}>{text.priorityQuestion}</AppText>
          <PrioritySwitch value={priority} onChange={onPriorityChange} busy={loading} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivory },
  scroll: { paddingHorizontal: 16, paddingTop: 16, width: '100%' },
  // Leaves room for the bottom dock.
  scrollNarrow: { paddingBottom: 150 },
  scrollWide: { maxWidth: 1180, alignSelf: 'center', paddingHorizontal: 40, paddingTop: 32, paddingBottom: 64 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  demoBadge: { marginBottom: 10 },
  titleWide: { fontSize: 48, lineHeight: 52, letterSpacing: -1.2 },
  answers: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  answersText: { flex: 1 },
  answersMain: { fontFamily: fonts.semiBold },
  editButton: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  editText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.ink },
  pressed: { opacity: 0.6 },
  note: { marginTop: 12, borderLeftWidth: 3, borderLeftColor: colors.maize, paddingLeft: 12, paddingVertical: 2 },
  switchWide: { marginTop: 24, gap: 10, maxWidth: 560 },
  cards: { marginTop: 16, gap: 14 },
  cardsWide: { marginTop: 24, flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  cardColumn: { flex: 1 },
  refreshing: { opacity: 0.45 },
  climate: { marginTop: 16 },
  footer: { marginTop: 20, gap: 4 },
  disclaimer: { marginTop: 6 },
  startOver: { marginTop: 14 },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 14, gap: 8, backgroundColor: 'rgba(247,243,232,0.9)', borderTopWidth: 1, borderTopColor: colors.line },
  dockLabel: { textAlign: 'center' },
});
