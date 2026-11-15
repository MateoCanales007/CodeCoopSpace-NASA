import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { useReducedMotion } from '../context/ReducedMotionContext';
import { loopBetween } from '../utils/animation';

/** A value that swings 0→1→0 forever. Stays at 0 when reduced motion is on. */
export function useLoopAnimation(halfMs: number, useNativeDriver?: boolean): Animated.Value {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) return;
    const loop = loopBetween(value, 0, 1, halfMs, useNativeDriver);
    loop.start();
    return () => loop.stop();
  }, [reduced, value, halfMs, useNativeDriver]);

  return value;
}
