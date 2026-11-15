import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { rotationApi } from '../../api';
import type { CurrentWeather, Site } from '../../api/types';
import { AppText, Button } from '../../components/ui';
import { useTranslation } from '../../i18n';
import { colors } from '../../theme';

export function CurrentWeatherCard({ site }: { site: Site }) {
  const { language, t } = useTranslation();
  const text = t.results;
  const [data, setData] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    rotationApi.getCurrentWeather(site.id, language)
      .then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [site.id, language, revision]);

  const locale = language === 'es' ? 'es-SV' : 'en-US';
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'America/El_Salvador',
  });
  const formatTime = (value: string) => timeFormatter.format(new Date(value));
  const formatNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  return (
    <View style={styles.card}>
      <AppText variant="lead" accessibilityRole="header">{site.name}</AppText>
      {loading ? <AppText variant="body" accessibilityLiveRegion="polite">{text.weatherLoading}</AppText> :
        !data || data.status === 'unavailable' ? <AppText variant="body" accessibilityLiveRegion="polite">{text.weatherUnavailable}</AppText> : (
          <>
            {data.current?.temperatureC != null ? (
              <View>
                <AppText variant="body">{text.weatherNow} · {formatTime(data.current.validAt)}</AppText>
                <AppText variant="title">{Math.round(data.current.temperatureC)} °C</AppText>
              </View>
            ) : null}
            {data.forecast.length ? (
              <View style={styles.forecast}>
                <AppText variant="lead" accessibilityRole="header">{text.forecastTitle}</AppText>
                <AppText variant="small">{text.forecastRain}</AppText>
                {data.forecast.map((point) => (
                  <AppText key={point.validAt} variant="body">
                    {formatTime(point.validAt)}{point.temperatureC == null ? '' : ' · ' + Math.round(point.temperatureC) + ' °C'}
                    {point.rainMm == null ? '' : ' · ' + formatNumber.format(point.rainMm) + ' mm'}
                  </AppText>
                ))}
              </View>
            ) : null}
            {data.status === 'partial' ? <AppText variant="small">{text.weatherPartial}</AppText> : null}
            <AppText variant="small">{text.weatherSource}</AppText>
          </>
        )}
      <Button label={text.refreshWeather} variant="ghost" onPress={() => setRevision((value) => value + 1)} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, padding: 18, gap: 14, backgroundColor: colors.paper, borderRadius: 20, borderWidth: 1, borderColor: colors.line },
  forecast: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line },
});
