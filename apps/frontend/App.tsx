import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.content}>
        <Text style={styles.team}>CodeCoop Space</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Field Shift
        </Text>
        <Text style={styles.description}>
          Explora cómo distintas rotaciones de cultivos podrían responder a las
          condiciones de tu terreno y a tus prioridades.
        </Text>
        <Text style={styles.note}>
          Base del equipo para NASA Space Apps 2026
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#F2F6ED', padding: 28 },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', gap: 16 },
  team: { color: '#356245', fontWeight: '700', fontSize: 15 },
  title: { color: '#172D20', fontWeight: '800', fontSize: 48 },
  description: { color: '#263E30', fontSize: 20, lineHeight: 29 },
  note: { color: '#496052', fontSize: 14 },
});
