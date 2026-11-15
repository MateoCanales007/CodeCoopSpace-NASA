import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { isWeb } from '../theme';

export interface Pointer {
  /** Follows the cursor (or finger) closely. Range -1..1. */
  fast: Animated.ValueXY;
  /** Follows with a lag, which gives a sense of mass. */
  slow: Animated.ValueXY;
  set: (x: number, y: number) => void;
}

/** Cursor position normalised to -1..1 and smoothed with springs. */
export function usePointer(enabled: boolean): Pointer {
  const fast = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const slow = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  // JS driver on purpose: these values are combined with other JS-driven ones.
  const set = useRef((x: number, y: number) => {
    Animated.spring(fast, { toValue: { x, y }, speed: 5, bounciness: 0, useNativeDriver: false }).start();
    Animated.spring(slow, { toValue: { x, y }, speed: 1.2, bounciness: 2, useNativeDriver: false }).start();
  }).current;

  useEffect(() => {
    if (!isWeb || !enabled || typeof window === 'undefined') return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled, set]);

  return useRef({ fast, slow, set }).current;
}
