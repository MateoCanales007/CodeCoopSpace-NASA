/**
 * Real NASA POWER Daily API v2.10.3 sample (MERRA-2 / POWER), approximate point
 * 13.64, -88.45. Copied from data/samples/power-san-miguel-2024-05.json because
 * Metro does not bundle files outside apps/frontend.
 *
 * It is a one-week connection sample, not a season reference.
 */
export const POWER_SAMPLE = {
  product: 'NASA POWER Daily API',
  apiVersion: 'v2.10.3',
  url: 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN,PRECTOTCORR&community=AG&longitude=-88.45&latitude=13.64&start=20240501&end=20240507&format=JSON',
  fillValue: -999,
  days: [
    { date: '2024-05-01', tMaxC: 33.9, precipMm: 3.34 },
    { date: '2024-05-02', tMaxC: 32.54, precipMm: 8.76 },
    { date: '2024-05-03', tMaxC: 33.99, precipMm: 0.54 },
    { date: '2024-05-04', tMaxC: 32.33, precipMm: 2.5 },
    { date: '2024-05-05', tMaxC: 32.49, precipMm: 2.99 },
    { date: '2024-05-06', tMaxC: 32.73, precipMm: 0.02 },
    { date: '2024-05-07', tMaxC: 33.78, precipMm: 0.04 },
  ],
};

/** Demo assumptions, not reference values. */
export const DRY_DAY_MM = 1;
export const DRY_DAYS_FOR_ALERT = 2;
