import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Animated, Easing } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { useReducedMotion } from '../../context/ReducedMotionContext';
import { USE_NATIVE_DRIVER } from '../../theme';

interface EnterProps {
  children: ReactNode;
  delay?: number;
  /** Starting offset in px; the content slides from there to its place. */
  offsetX?: number;
  offsetY?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Soft entrance: opacity plus a small slide. Change the `key` to replay it.
 * With reduced motion it only fades, quickly.
 */
export function Enter({ children, delay = 0, offsetX = 0, offsetY = 16, duration = 520, style }: EnterProps) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 160 : duration,
      delay: reduced ? 0 : delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay, duration, reduced]);

  const travel = reduced ? 0 : 1;
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [offsetX * travel, 0] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [offsetY * travel, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
