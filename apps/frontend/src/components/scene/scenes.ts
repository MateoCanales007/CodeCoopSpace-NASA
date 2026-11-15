import type { ImageSourcePropType } from 'react-native';

import type { SceneKey } from '../../i18n';
import type { SceneKind } from './sceneMotion';

export interface SceneDefinition {
  /** Names and captions for each scene live in src/i18n. */
  key: SceneKey;
  /** Sharp ink cutout with transparent background. */
  sharp: ImageSourcePropType;
  /** Pre-blurred copy of the same art, used as the depth layer. */
  mist: ImageSourcePropType;
  halo: 'maize' | 'leaf';
  /** Where the color halo sits, as a fraction of the frame. */
  haloAt: { x: number; y: number };
  /** Picks the natural motion (see sceneMotion.ts). */
  kind: SceneKind;
  /** Pivot of the motion: the animal's neck or the base of the stem. */
  origin: string;
  /** Eye of the animal as a fraction of the frame, for blinking. */
  eye?: { x: number; y: number; width: number; rotation: number };
}

/** Welcome scenes in display order. To add one: drop the art in assets/art and add an entry here and in i18n. */
export const SCENES: SceneDefinition[] = [
  {
    key: 'jaguarundi',
    sharp: require('../../../assets/art/jaguarundi.webp'),
    mist: require('../../../assets/art/jaguarundi-mist.webp'),
    halo: 'maize',
    haloAt: { x: 0.2, y: 0.52 },
    kind: 'feline',
    origin: '85% 60%',
    eye: { x: 0.409, y: 0.522, width: 0.092, rotation: -25 },
  },
  {
    key: 'cornfield',
    sharp: require('../../../assets/art/cornfield.webp'),
    mist: require('../../../assets/art/cornfield-mist.webp'),
    halo: 'leaf',
    haloAt: { x: 0.18, y: 0.3 },
    kind: 'plant',
    origin: '95% 45%',
  },
  {
    key: 'hen',
    sharp: require('../../../assets/art/hen.webp'),
    mist: require('../../../assets/art/hen-mist.webp'),
    halo: 'maize',
    haloAt: { x: 0.16, y: 0.3 },
    kind: 'bird',
    origin: '60% 85%',
    eye: { x: 0.396, y: 0.283, width: 0.086, rotation: 0 },
  },
  {
    key: 'coffee',
    sharp: require('../../../assets/art/coffee.webp'),
    mist: require('../../../assets/art/coffee-mist.webp'),
    halo: 'leaf',
    haloAt: { x: 0.3, y: 0.26 },
    kind: 'plant',
    origin: '100% 32%',
  },
  {
    key: 'cow',
    sharp: require('../../../assets/art/cow.webp'),
    mist: require('../../../assets/art/cow-mist.webp'),
    halo: 'maize',
    haloAt: { x: 0.14, y: 0.6 },
    kind: 'cattle',
    origin: '70% 85%',
    eye: { x: 0.505, y: 0.374, width: 0.095, rotation: 0 },
  },
  {
    key: 'chili',
    sharp: require('../../../assets/art/chili.webp'),
    mist: require('../../../assets/art/chili-mist.webp'),
    halo: 'maize',
    haloAt: { x: 0.2, y: 0.7 },
    kind: 'plant',
    origin: '100% 12%',
  },
];
