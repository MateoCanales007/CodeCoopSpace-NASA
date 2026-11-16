import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

import type { Explanation } from '../../api/types';
import { AppText, Enter, ThinkingDots } from '../../components/ui';
import { useReducedMotion } from '../../context/ReducedMotionContext';
import { useLoopAnimation } from '../../hooks/useLoopAnimation';
import { useTranslation } from '../../i18n';
import { USE_NATIVE_DRIVER, colors, fonts, images } from '../../theme';
import { interpolate } from '../../utils/animation';

interface ExplanationCardProps {
  explanation: Explanation;
  /** true while a new comparison is on its way (for example, after changing the priority). */
  thinking: boolean;
  /** What Yago is going through, one line at a time, built from the data of this query. */
  thoughts: string[];
}

const PARTS = ['consider', 'influence', 'caution', 'verify'] as const;
/** Short pause before the text starts, so the change reads as "thinking, then writing". */
const THINK_MS = 1100;
const WORD_MS = 38;
/** Each thought stays this long on screen. */
const THOUGHT_MS = 1700;

/** Writes `text` word by word, like an answer being typed. Shows it whole with reduced motion. */
function useTypewriter(text: string, start: boolean): string {
  const reduced = useReducedMotion();
  const words = text.split(' ');
  const [count, setCount] = useState(reduced ? words.length : 0);

  useEffect(() => {
    if (reduced) {
      setCount(words.length);
      return;
    }
    setCount(0);
    if (!start) return;
    const timer = setInterval(() => {
      setCount((current) => {
        if (current >= words.length) {
          clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, WORD_MS);
    return () => clearInterval(timer);
  }, [text, start, reduced]);

  return words.slice(0, count).join(' ');
}

/** Small Yago mark that breathes while the answer is being prepared. */
function ThinkingMark({ active }: { active: boolean }) {
  const pulse = useLoopAnimation(700);
  return (
    <Animated.View style={{ transform: [{ scale: active ? interpolate(pulse, [0, 1], [0.9, 1.12]) : 1 }], opacity: active ? interpolate(pulse, [0, 1], [0.6, 1]) : 1 }}>
      <Image source={images.symbol} style={styles.mark} resizeMode="contain" />
    </Animated.View>
  );
}

/** Grey bars that shimmer in place of the text that is still coming. */
function SkeletonLines() {
  const shimmer = useLoopAnimation(650);
  return (
    <View style={styles.skeleton}>
      {[0.92, 0.78, 0.86, 0.5].map((width, line) => (
        <Animated.View key={line} style={[styles.skeletonLine, { width: `${width * 100}%`, opacity: interpolate(shimmer, [0, 1], line % 2 ? [0.55, 0.25] : [0.25, 0.55]) }]} />
      ))}
    </View>
  );
}

/**
 * Plain-language explanation of the calculated comparison: what is worth
 * considering, what weighed most, the main caution and what to confirm before
 * sowing. It "thinks" for a moment, then writes the answer, and always says
 * whether an AI model or the rules wrote the wording.
 */
export function ExplanationCard({ explanation, thinking, thoughts }: ExplanationCardProps) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const text = t.results;
  const byAi = explanation.source === 'groq';
  // Every new answer starts with a short "thinking" moment before it is written.
  const [readyFor, setReadyFor] = useState<string | null>(reduced ? explanation.consider : null);
  const warmingUp = readyFor !== explanation.consider;
  const glow = useRef(new Animated.Value(0)).current;
  const showThinking = thinking || warmingUp;
  const lead = useTypewriter(explanation.consider, !showThinking);

  useEffect(() => {
    if (reduced) {
      setReadyFor(explanation.consider);
      return;
    }
    const timer = setTimeout(() => setReadyFor(explanation.consider), THINK_MS);
    return () => clearTimeout(timer);
  }, [explanation.consider, reduced]);

  // While thinking, the thoughts go by one after the other; the last one stays.
  const [thought, setThought] = useState(0);
  useEffect(() => {
    if (!showThinking) return;
    setThought(0);
    const timer = setInterval(() => setThought((current) => Math.min(current + 1, thoughts.length - 1)), THOUGHT_MS);
    return () => clearInterval(timer);
  }, [showThinking, thoughts.length]);

  // The yellow edge lights up while thinking.
  useEffect(() => {
    Animated.timing(glow, { toValue: showThinking ? 1 : 0, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER }).start();
  }, [showThinking, glow]);

  return (
    <View style={styles.card}>
      <Animated.View pointerEvents="none" style={[styles.edgeGlow, { opacity: glow }]} />
      <View style={styles.heading}>
        <View style={styles.headingTitle}>
          <ThinkingMark active={showThinking} />
          <AppText variant="label" color={colors.ink}>{text.explanationTitle}</AppText>
        </View>
        <View style={[styles.chip, byAi && styles.chipAi]}>
          {byAi ? <View style={styles.chipDot} /> : null}
          <Text style={[styles.chipText, byAi && { color: colors.ivory }]}>{byAi ? text.explanationAiChip : text.explanationRulesChip}</Text>
        </View>
      </View>

      {showThinking ? (
        <View style={styles.thinkingRow} accessibilityLiveRegion="polite">
          <Enter key={thought} offsetY={8} duration={360} style={styles.thoughtBox}>
            <Text style={styles.thinkingText}>{thoughts[thought] ?? text.thinking}</Text>
          </Enter>
          <ThinkingDots color={colors.inkSoft} size={6} />
        </View>
      ) : null}

      {showThinking && warmingUp && !thinking ? (
        <SkeletonLines />
      ) : (
        <View style={[styles.parts, thinking && styles.stale]}>
          {PARTS.map((part, position) => (
            <Enter key={`${part}-${explanation[part]}`} delay={part === 'consider' ? 0 : 260 + position * 170} offsetY={12} duration={460}>
              <View style={styles.part}>
                <Text style={styles.partLabel}>{text.explanationLabels[part]}</Text>
                {part === 'consider' ? (
                  <Text style={styles.lead} accessibilityLabel={explanation.consider}>
                    {thinking ? explanation.consider : lead}
                    {!thinking && lead.length < explanation.consider.length ? <Text style={styles.caret}>▍</Text> : null}
                  </Text>
                ) : (
                  <Text style={styles.body}>{explanation[part]}</Text>
                )}
              </View>
            </Enter>
          ))}
          <AppText variant="small">
            {byAi
              ? text.explanationByAi(explanation.model ?? 'Groq')
              : `${text.explanationByRules}${explanation.fallbackReason ? ` ${text.explanationFallback[explanation.fallbackReason]}` : ''}`}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: 26, padding: 18, gap: 14, borderWidth: 1, borderColor: colors.line, borderLeftWidth: 6, borderLeftColor: colors.maize, overflow: 'hidden' },
  edgeGlow: { position: 'absolute', left: -6, top: 0, bottom: 0, width: 26, backgroundColor: 'rgba(243,183,43,0.35)' },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  headingTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mark: { width: 30, height: 29 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: colors.line },
  chipAi: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.maize },
  chipText: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, color: colors.inkSoft },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  thoughtBox: { flexShrink: 1 },
  thinkingText: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22, color: colors.ink },
  skeleton: { gap: 12, paddingVertical: 4 },
  skeletonLine: { height: 14, borderRadius: 7, backgroundColor: colors.sand },
  parts: { gap: 14 },
  stale: { opacity: 0.4 },
  part: { gap: 2 },
  partLabel: { fontFamily: fonts.bold, fontSize: 13, lineHeight: 17, letterSpacing: 0.9, textTransform: 'uppercase', color: colors.inkSoft },
  lead: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 30, color: colors.ink },
  caret: { color: colors.maize },
  body: { fontFamily: fonts.body, fontSize: 18, lineHeight: 26, color: colors.ink },
});
