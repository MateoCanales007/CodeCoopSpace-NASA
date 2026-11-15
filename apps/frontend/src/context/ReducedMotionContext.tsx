import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AccessibilityInfo } from 'react-native';

const ReducedMotionContext = createContext(false);

/** Reads the "reduce motion" setting of the phone or browser and shares it with the tree. */
export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => active && setReduced(Boolean(enabled)))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => setReduced(Boolean(enabled)));
    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  return <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>;
}

/** true when the person asked for less motion. */
export function useReducedMotion(): boolean {
  return useContext(ReducedMotionContext);
}
