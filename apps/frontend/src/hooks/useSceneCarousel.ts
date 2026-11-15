import { useCallback, useEffect, useRef, useState } from 'react';

const AUTOPLAY_MS = 6500;
const PAUSE_AFTER_MANUAL_MS = 14000;

interface SceneCarousel {
  index: number;
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

/**
 * Index of the visible welcome scene. It advances by itself, pauses for a while
 * after the person changes it by hand, and never autoplays with reduced motion.
 */
export function useSceneCarousel(count: number, autoplay: boolean): SceneCarousel {
  const [index, setIndex] = useState(0);
  const pausedUntil = useRef(0);

  const pause = () => {
    pausedUntil.current = Date.now() + PAUSE_AFTER_MANUAL_MS;
  };
  const step = useCallback((delta: number) => setIndex((current) => (current + delta + count) % count), [count]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = setInterval(() => {
      if (Date.now() >= pausedUntil.current) step(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay, step]);

  const next = useCallback(() => {
    pause();
    step(1);
  }, [step]);
  const previous = useCallback(() => {
    pause();
    step(-1);
  }, [step]);
  const goTo = useCallback((target: number) => {
    pause();
    setIndex(target);
  }, []);

  return { index, next, previous, goTo };
}
