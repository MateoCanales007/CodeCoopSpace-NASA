import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Priority } from '../../api/types';
import { Icon } from '../../components/ui';
import { PRIORITIES, PRIORITY_ICON } from '../../constants/domain';
import { useTranslation } from '../../i18n';
import { colors, fonts } from '../../theme';

interface PrioritySwitchProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  /** true while the comparison is being refreshed. */
  busy: boolean;
}

/** Three large buttons to change what matters most without leaving the results. */
export function PrioritySwitch({ value, onChange, busy }: PrioritySwitchProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t.results.priorityQuestion}>
      {PRIORITIES.map((priority) => {
        const selected = priority === value;
        return (
          <Pressable
            key={priority}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected, busy }}
            accessibilityLabel={t.priority[priority].name}
            onPress={() => !selected && onChange(priority)}
            style={({ pressed }) => [styles.button, selected && styles.buttonSelected, pressed && styles.pressed]}
          >
            <Icon name={PRIORITY_ICON[priority]} size={34} />
            <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={1}>
              {t.priority[priority].short}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, minHeight: 58, borderRadius: 29, borderWidth: 2, borderColor: colors.ink, backgroundColor: colors.paper, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 6 },
  buttonSelected: { backgroundColor: colors.ink },
  pressed: { opacity: 0.7 },
  text: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: colors.ink },
  textSelected: { color: colors.ivory },
});
