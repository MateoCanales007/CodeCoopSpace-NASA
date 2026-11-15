import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { Figtree_500Medium } from '@expo-google-fonts/figtree/500Medium';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { Figtree_700Bold } from '@expo-google-fonts/figtree/700Bold';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Platform, StatusBar, StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';

import { Grain } from './src/components/ui';
import { ReducedMotionProvider } from './src/context/ReducedMotionContext';
import { LanguageProvider } from './src/i18n';
import { colors, isWeb } from './src/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  const [currentTab, setCurrentTab] = useState<'clima' | 'comparacion'>('clima');
  const [comparisonFilter, setComparisonFilter] = useState<'agua' | 'suelo' | 'variar'>('agua');
  const [expandedDetail, setExpandedDetail] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') document.body.style.backgroundColor = colors.ivory;
  }, []);

  if (!fontsLoaded && !fontError) return <View style={styles.root} />;

  return (
    <LanguageProvider>
      <ReducedMotionProvider>
        <View style={styles.root}>
          <StatusBar barStyle="dark-content" />
          
          {/* DASHBOARD PRINCIPAL YAGO */}
          <View style={styles.mainContainer}>
            {/* ENCABEZADO */}
            <View style={styles.header}>
              <View>
                <Text style={styles.logoText}>🌱 yago</Text>
                <Text style={styles.subtitle}>JAGUARUNDÍ • San Miguel, El Salvador</Text>
              </View>

              {isDesktop && (
                <View style={styles.desktopNav}>
                  <TouchableOpacity 
                    style={[styles.desktopTabBtn, currentTab === 'clima' && styles.activeDesktopTab]}
                    onPress={() => setCurrentTab('clima')}
                  >
                    <Text style={[styles.desktopTabText, currentTab === 'clima' && styles.activeDesktopTabText]}>🌤️ El Clima</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.desktopTabBtn, currentTab === 'comparacion' && styles.activeDesktopTab]}
                    onPress={() => setCurrentTab('comparacion')}
                  >
                    <Text style={[styles.desktopTabText, currentTab === 'comparacion' && styles.activeDesktopTabText]}>📊 Su Comparación</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* CONTENIDO */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {currentTab === 'clima' ? (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Clima histórico de la zona</Text>
                    <View style={styles.badgeDemo}>
                      <Text style={styles.badgeDemoText}>⚡ NASA POWER API</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionDesc}>Monitoreo meteorológico en tiempo real optimizado para tu cultivo actual de frijol.</Text>

                  <View style={styles.weatherHeroCard}>
                    <View style={styles.weatherTopRow}>
                      <View>
                        <Text style={styles.locationTag}>📍 Zona: San Miguel (Suelo arenoso)</Text>
                        <Text style={styles.tempDisplay}>28°C</Text>
                        <Text style={styles.conditionText}>Parcialmente Nublado • Humedad moderada</Text>
                      </View>
                      <View style={styles.weatherIconBadge}>
                        <Text style={styles.weatherIconEmoji}>⛅</Text>
                      </View>
                    </View>

                    <View style={styles.weatherMetricsGrid}>
                      <View style={styles.weatherMetricBox}>
                        <Text style={styles.metricLabel}>Lluvia (7 días)</Text>
                        <Text style={styles.metricVal}>18.2 mm</Text>
                        <Text style={styles.metricSub}>Acumulado reciente</Text>
                      </View>
                      <View style={styles.weatherMetricBox}>
                        <Text style={styles.metricLabel}>Días con lluvia</Text>
                        <Text style={styles.metricVal}>3 de 7</Text>
                        <Text style={styles.metricSub}>Distribución regular</Text>
                      </View>
                      <View style={styles.weatherMetricBox}>
                        <Text style={styles.metricLabel}>Temp. Promedio</Text>
                        <Text style={styles.metricVal}>33.1°C</Text>
                        <Text style={styles.metricSub}>Condición cálida</Text>
                      </View>
                    </View>

                    <View style={styles.alertBox}>
                      <Text style={styles.alertTitle}>ALERTA DE AGUA & RIEGO</Text>
                      <Text style={styles.alertBody}>
                        En esta muestra casi no se vio 3 días de lluvias. Por eso, al pasar, cuida más el agua cada que pide cultivo.
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Su comparación</Text>
                    <View style={styles.badgeDemo}>
                      <Text style={styles.badgeDemoText}>⚡ Datos de demostración</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionDesc}>San Miguel: Hoy tiene frijol. Tierra: arenosa. Agua: se encharca.</Text>

                  <View style={styles.filterRow}>
                    <TouchableOpacity 
                      style={[styles.filterPill, comparisonFilter === 'agua' && styles.activePill]}
                      onPress={() => setComparisonFilter('agua')}
                    >
                      <Text style={[styles.filterPillText, comparisonFilter === 'agua' && styles.activePillText]}>💧 Agua</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.filterPill, comparisonFilter === 'suelo' && styles.activePill]}
                      onPress={() => setComparisonFilter('suelo')}
                    >
                      <Text style={[styles.filterPillText, comparisonFilter === 'suelo' && styles.activePillText]}>🌱 Suelo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.filterPill, comparisonFilter === 'variar' && styles.activePill]}
                      onPress={() => setComparisonFilter('variar')}
                    >
                      <Text style={[styles.filterPillText, comparisonFilter === 'variar' && styles.activePillText]}>➕ Variar</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardsGrid}>
                    <View style={styles.cardItem}>
                      <Text style={styles.cardTypeLabel}>Lo que hace hoy</Text>
                      <Text style={styles.cardTitle}>Frijol ➔ Frijol</Text>
                      <Text style={styles.cardDesc}>Es lo que usted ya conoce: no cambia su forma de trabajar ni lo que compra.</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.warningTag}>OJO: Repetir frijol cansa el suelo y no reparte el riesgo.</Text>
                        <Text style={styles.sourceTag}>Data NASA</Text>
                      </View>
                    </View>

                    <View style={styles.cardItem}>
                      <Text style={styles.cardTypeLabel}>Otra alternativa</Text>
                      <Text style={styles.cardTitle}>Frijol ➔ Maíz</Text>
                      <Text style={styles.cardDesc}>El maíz aprovecha lo que el frijol dejó en el suelo, mejorando el rendimiento.</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.warningTag}>OJO: Pide bastante agua; si la lluvia se corta, es el que más lo resiente.</Text>
                        <Text style={styles.sourceTag}>Data NASA</Text>
                      </View>
                    </View>

                    <View style={[styles.cardItem, styles.featuredCardItem]}>
                      <Text style={styles.featuredTypeLabel}>Destaca para diversificar</Text>
                      <Text style={styles.featuredTitle}>Frijol ➔ Maicillo</Text>
                      <Text style={styles.featuredDesc}>El maicillo aguanta mejor cuando la lluvia falla y deja rastrojo que cubre el suelo.</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.featuredWarningTag}>OJO: Deja menos beneficio al suelo que una leguminosa.</Text>
                        <Text style={styles.featuredSourceTag}>Data NASA</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={styles.detailBtn}
                    onPress={() => setExpandedDetail(!expandedDetail)}
                  >
                    <Text style={styles.detailBtnText}>
                      {expandedDetail ? 'Ocultar detalle ▲' : 'Ver por qué y de dónde sale ▼'}
                    </Text>
                  </TouchableOpacity>

                  {expandedDetail && (
                    <View style={styles.expandedBox}>
                      <Text style={styles.expandedHeader}>Referencia local y fuentes meteorológicas</Text>
                      <Text style={styles.expandedText}>
                        • Referencia local tomada de gremios básicos en El Salvador.{'\n'}
                        • NASA POWER Daily (MERRA-2) v10.3 para datos térmicos y de precipitación.{'\n'}
                        • Modelo heurístico Yago v0.3 (reglas agronómicas orientadas a pequeños productores).
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* MENÚ INFERIOR MÓVIL */}
            {!isDesktop && (
              <View style={styles.mobileNavBar}>
                <TouchableOpacity 
                  style={[styles.mobileNavTab, currentTab === 'clima' && styles.activeMobileTab]}
                  onPress={() => setCurrentTab('clima')}
                >
                  <Text style={styles.mobileNavIcon}>🌤️</Text>
                  <Text style={[styles.mobileNavText, currentTab === 'clima' && styles.activeMobileText]}>El Clima</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.mobileNavTab, currentTab === 'comparacion' && styles.activeMobileTab]}
                  onPress={() => setCurrentTab('comparacion')}
                >
                  <Text style={styles.mobileNavIcon}>📊</Text>
                  <Text style={[styles.mobileNavText, currentTab === 'comparacion' && styles.activeMobileText]}>Su Comparación</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Grain opacity={0.1} />
        </View>
      </ReducedMotionProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivory, paddingTop: Platform.OS === 'web' ? 0 : (StatusBar.currentHeight ?? 44) },
  mainContainer: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#e5e0d3', backgroundColor: colors.ivory },
  logoText: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  subtitle: { fontSize: 10, color: '#666', letterSpacing: 1.2, textTransform: 'uppercase' },
  desktopNav: { flexDirection: 'row', gap: 12 },
  desktopTabBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#d1cbb8', backgroundColor: 'transparent' },
  activeDesktopTab: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  desktopTabText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  activeDesktopTabText: { color: '#ffffff' },
  scrollContent: { padding: 24, paddingBottom: 110 },
  sectionContainer: { maxWidth: 1000, alignSelf: 'center', width: '100%' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  badgeDemo: { backgroundColor: '#fef3c7', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#fcd34d' },
  badgeDemoText: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  sectionDesc: { fontSize: 15, color: '#555', marginBottom: 24 },
  weatherHeroCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 28, borderWidth: 1, borderColor: '#e5e0d3', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  weatherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  locationTag: { fontSize: 13, color: '#666', fontWeight: '600', marginBottom: 6 },
  tempDisplay: { fontSize: 60, fontWeight: '900', color: '#1a1a1a' },
  conditionText: { fontSize: 16, color: '#444', marginTop: 4 },
  weatherIconBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fef9e7', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#f3e8d2' },
  weatherIconEmoji: { fontSize: 28 },
  weatherMetricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 24 },
  weatherMetricBox: { flex: 1, minWidth: '30%', backgroundColor: '#f9f6ed', padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#ede7d9' },
  metricLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  metricVal: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  metricSub: { fontSize: 11, color: '#888', marginTop: 2 },
  alertBox: { backgroundColor: '#fffbeb', padding: 18, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#d97706', borderWidth: 1, borderColor: '#fef3c7' },
  alertTitle: { fontSize: 11, fontWeight: '800', color: '#d97706', letterSpacing: 0.5, marginBottom: 4 },
  alertBody: { fontSize: 14, color: '#333', lineHeight: 20 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  filterPill: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#d1cbb8' },
  activePill: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  filterPillText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  activePillText: { color: '#ffffff' },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  cardItem: { flex: 1, minWidth: 280, backgroundColor: '#ffffff', borderRadius: 18, padding: 22, borderWidth: 1, borderColor: '#e5e0d3' },
  featuredCardItem: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  cardTypeLabel: { fontSize: 11, fontWeight: '700', color: '#666', textTransform: 'uppercase', marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 10 },
  cardDesc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 20 },
  featuredTypeLabel: { fontSize: 11, fontWeight: '700', color: '#fde047', textTransform: 'uppercase', marginBottom: 8 },
  featuredTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 10 },
  featuredDesc: { fontSize: 14, color: '#d1d5db', lineHeight: 20, marginBottom: 20 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 14, marginTop: 'auto' },
  warningTag: { fontSize: 12, color: '#713f12', backgroundColor: '#fef3c7', padding: 10, borderRadius: 8, marginBottom: 10, overflow: 'hidden', lineHeight: 16 },
  featuredWarningTag: { fontSize: 12, color: '#fef08a', backgroundColor: '#332701', padding: 10, borderRadius: 8, marginBottom: 10, overflow: 'hidden', lineHeight: 16 },
  sourceTag: { fontSize: 11, fontWeight: '700', color: '#666' },
  featuredSourceTag: { fontSize: 11, fontWeight: '700', color: '#fde047' },
  detailBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20, backgroundColor: '#e5e0d3', marginBottom: 20 },
  detailBtnText: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  expandedBox: { backgroundColor: '#ffffff', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#e5e0d3', marginBottom: 20 },
  expandedHeader: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  expandedText: { fontSize: 12, color: '#555', lineHeight: 18 },
  mobileNavBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 65, backgroundColor: '#ffffff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e5e0d3', elevation: 10 },
  mobileNavTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeMobileTab: { borderTopWidth: 3, borderTopColor: '#1a1a1a' },
  mobileNavIcon: { fontSize: 18 },
  mobileNavText: { fontSize: 11, color: '#666', marginTop: 2, fontWeight: '600' },
  activeMobileText: { color: '#1a1a1a', fontWeight: '800' },
});