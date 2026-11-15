import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import { USE_NATIVE_DRIVER } from '../../theme';
import { loopBetween } from '../../utils/animation';
import type { MotionValues, SceneMotion } from './sceneMotion';

interface SceneLife extends MotionValues {
  /** 0 = eye open, 1 = eye closed. */
  eyelid: Animated.Value;
}

/**
 * Runs the natural motion of a scene while it is on screen: breathing, the
 * kind-specific loops and, for animals, a blink every few seconds (sometimes twice).
 */
export function useSceneLife(motion: SceneMotion, running: boolean, blinks: boolean): SceneLife {
  const breath = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const gust = useRef(new Animated.Value(0)).current;
  const eyelid = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!running) return;
    const loops = [loopBetween(breath, 0, 1, motion.breathHalfMs), ...motion.createLoops({ breath, sway, gust })];
    loops.forEach((loop) => loop.start());

    let timer: ReturnType<typeof setTimeout> | undefined;
    let active = true;
    const blinkOnce = () =>
      Animated.sequence([
        Animated.timing(eyelid, { toValue: 1, duration: 90, useNativeDriver: USE_NATIVE_DRIVER }),
        Animated.delay(70),
        Animated.timing(eyelid, { toValue: 0, duration: 170, useNativeDriver: USE_NATIVE_DRIVER }),
      ]);
    const blink = () => {
      if (!active) return;
      const twice = Math.random() < 0.3;
      Animated.sequence(twice ? [blinkOnce(), Animated.delay(140), blinkOnce()] : [blinkOnce()]).start();
      timer = setTimeout(blink, 2600 + Math.random() * 3800);
    };
    if (blinks) timer = setTimeout(blink, 1900);

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      loops.forEach((loop) => loop.stop());
      // Ease back to rest so the scene does not freeze mid-movement.
      [breath, sway, gust].forEach((value) => Animated.timing(value, { toValue: 0, duration: 400, useNativeDriver: USE_NATIVE_DRIVER }).start());
      eyelid.setValue(0);
    };
  }, [running, blinks, motion, breath, sway, gust, eyelid]);

  return { breath, sway, gust, eyelid };
}
