import { Animated, Easing } from 'react-native';

import { USE_NATIVE_DRIVER } from '../theme';

type Animatable = Animated.Value | Animated.AnimatedInterpolation<number>;

/** Shorthand for `value.interpolate` that also accepts derived (added/multiplied) values. */
export function interpolate(value: Animatable, inputRange: number[], outputRange: number[] | string[]) {
  return (value as Animated.Value).interpolate({ inputRange, outputRange: outputRange as number[] });
}

/** Endless back-and-forth between `from` and `to` on a sine curve. */
export function loopBetween(value: Animated.Value, from: number, to: number, halfMs: number, useNativeDriver: boolean = USE_NATIVE_DRIVER) {
  const leg = (toValue: number) => Animated.timing(value, { toValue, duration: halfMs, easing: Easing.inOut(Easing.sin), useNativeDriver });
  return Animated.loop(Animated.sequence([leg(to), leg(from)]));
}
