import type { Site } from '../types';

/** Fictitious case: an approximate public point in San Miguel, never a real plot. */
export const DEMO_SITES: Site[] = [
  {
    id: 'san-miguel-demo',
    name: 'San Miguel',
    department: 'San Miguel',
    approxLat: 13.64,
    approxLon: -88.45,
    crops: ['maize', 'bean', 'sorghum'],
    isDemo: true,
  },
];
