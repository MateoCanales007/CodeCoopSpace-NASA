import { Animated, Easing } from 'react-native';

import { USE_NATIVE_DRIVER } from '../../theme';
import { interpolate } from '../../utils/animation';

export type SceneKind = 'feline' | 'bird' | 'cattle' | 'plant';

/** The three values every scene animates; each kind gives them its own meaning. */
export interface MotionValues {
  breath: Animated.Value;
  sway: Animated.Value;
  gust: Animated.Value;
}

type Transform = Animated.WithAnimatedValue<object>;

/**
 * Natural motion of one kind of scene. To add a new kind (say, a fish), add an
 * entry to `SCENE_MOTION`; SceneLayer does not need to change.
 */
export interface SceneMotion {
  /** Half period of the breathing loop, in ms. */
  breathHalfMs: number;
  /** Looping animations that run while the scene is on screen. */
  createLoops(values: MotionValues): Animated.CompositeAnimation[];
  /** Transforms applied to the sharp image. */
  sharpTransform(values: MotionValues): Transform[];
  /** Transforms applied to the blurred depth layer. */
  mistTransform(values: MotionValues): Transform[];
}

const smooth = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, { toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: USE_NATIVE_DRIVER });
const snap = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, { toValue, duration, easing: Easing.out(Easing.quad), useNativeDriver: USE_NATIVE_DRIVER });
const loop = (...steps: Animated.CompositeAnimation[]) => Animated.loop(Animated.sequence(steps));
const breathe = (breath: Animated.Value, amount: number): Transform => ({ scale: interpolate(breath, [0, 1], [1, 1 + amount]) });
const noMist = () => [];

export const SCENE_MOTION: Record<SceneKind, SceneMotion> = {
  // The jaguarundi stalks: it leans forward slightly and comes back.
  feline: {
    breathHalfMs: 2300,
    createLoops: ({ sway }) => [loop(smooth(sway, 1, 3800), Animated.delay(900), smooth(sway, -1, 5200), smooth(sway, 0, 3000))],
    sharpTransform: ({ breath, sway }) => [
      { translateX: interpolate(sway, [-1, 1], [7, -9]) },
      { rotate: interpolate(sway, [-1, 1], ['0.8deg', '-0.9deg']) },
      { translateY: interpolate(breath, [0, 1], [0, -3]) },
      breathe(breath, 0.018),
    ],
    mistTransform: noMist,
  },

  // The hen moves its head in quick jerks and then holds still.
  bird: {
    breathHalfMs: 1300,
    createLoops: ({ gust }) => [
      loop(
        Animated.delay(1100), snap(gust, -1, 130), Animated.delay(950), snap(gust, 0.7, 120), Animated.delay(1500),
        snap(gust, -0.3, 110), Animated.delay(600), snap(gust, 0, 150), Animated.delay(1300),
      ),
    ],
    sharpTransform: ({ breath, gust }) => [
      { translateX: interpolate(gust, [-1, 1], [-5, 5]) },
      { rotate: interpolate(gust, [-1, 1], ['-2.6deg', '2.6deg']) },
      breathe(breath, 0.012),
    ],
    mistTransform: noMist,
  },

  // The cow tilts its head slowly and chews.
  cattle: {
    breathHalfMs: 2300,
    createLoops: ({ sway, gust }) => [
      loop(smooth(sway, 1, 3400), smooth(sway, -1, 6800), smooth(sway, 0, 3400)),
      loop(smooth(gust, 1, 330), smooth(gust, 0, 330), smooth(gust, 1, 330), smooth(gust, 0, 330), smooth(gust, 1, 330), smooth(gust, 0, 330), Animated.delay(2600)),
    ],
    sharpTransform: ({ breath, sway, gust }) => [
      { rotate: interpolate(sway, [-1, 1], ['-1.3deg', '1.3deg']) },
      { translateY: interpolate(gust, [0, 1], [0, 2.2]) },
      breathe(breath, 0.014),
    ],
    mistTransform: noMist,
  },

  // Plants sway in the wind: two swings of different rhythm added together.
  plant: {
    breathHalfMs: 2300,
    createLoops: ({ sway, gust }) => [
      loop(smooth(sway, 1, 2600), smooth(sway, -1, 5200), smooth(sway, 0, 2600)),
      loop(smooth(gust, 1, 900), smooth(gust, -0.6, 1500), smooth(gust, 0.3, 1100), smooth(gust, 0, 1300), Animated.delay(1400)),
    ],
    sharpTransform: ({ breath, sway, gust }) => {
      const wind = Animated.add(Animated.multiply(sway, 1.5), Animated.multiply(gust, 0.8));
      return [
        { rotate: interpolate(wind, [-3, 3], ['-3deg', '3deg']) },
        { skewX: interpolate(wind, [-3, 3], ['2deg', '-2deg']) },
        breathe(breath, 0.012),
      ];
    },
    mistTransform: ({ sway }) => [{ rotate: interpolate(sway, [-1, 1], ['1.2deg', '-1.2deg']) }],
  },
};
