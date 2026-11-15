/**
 * Sand transition (web only): the outgoing image crumbles into grains, the
 * wind carries them and they settle into the shape of the incoming image.
 *
 * How it works: thousands of points are sampled where each image has ink.
 * Every grain travels from its point in the previous image to its point in
 * the new one. It is drawn on a <canvas>, so it needs no native library;
 * Android/iOS use SandMorph.tsx (plain fade).
 */
import { Asset } from 'expo-asset';
import { useEffect, useRef } from 'react';

import { colors } from '../../theme';
import type { SandMorphProps } from './SandMorph.types';
import { loadPointCloud } from './sandSampler';
import type { PointCloud } from './sandSampler';

/** Canvas margin around the stage, as a fraction of its size, so the sand has room to fly. */
const MARGIN = 0.22;
/** Share of the transition one grain spends flying. */
const FLIGHT = 0.5;
/** Below this frame rate the next transition draws fewer grains. */
const MIN_FPS = 28;
const MAX_GRAIN_SKIP = 3;
const TONES = [colors.ink, colors.maize, colors.leaf];
const MAX_PIXEL_RATIO = 1.5;

const grainCountFor = (size: number) => Math.max(5000, Math.min(12000, Math.round(size * size * 0.042)));
const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const easeInOutCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

export function SandMorph({ sources, index, size, enabled, duration, onReady }: SandMorphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clouds = useRef<(PointCloud | null)[]>([]);
  const count = useRef(grainCountFor(size)).current;
  // Latest props for the animation loop, which outlives a single render.
  const latest = useRef({ size, duration });
  latest.current = { size, duration };

  const state = useRef({
    previousIndex: index,
    frameRequest: 0,
    running: false,
    startedAt: 0,
    /** -1 = wind blows left, 1 = wind blows right. */
    wind: -1,
    frames: 0,
    /** 1 = every grain; 2 or 3 = one in N, when the device is slow. */
    grainSkip: 1,
    target: null as PointCloud | null,
    startX: new Float32Array(count),
    startY: new Float32Array(count),
    currentX: new Float32Array(count),
    currentY: new Float32Array(count),
    delay: new Float32Array(count),
    seedA: new Float32Array(count),
    seedB: new Float32Array(count),
    grainSize: new Float32Array(count),
    tone: new Uint8Array(count),
  }).current;

  // Sample every image once and give each grain its size and color.
  useEffect(() => {
    let active = true;
    for (let grain = 0; grain < count; grain++) {
      state.seedA[grain] = Math.random();
      state.seedB[grain] = Math.random();
      const spread = Math.random();
      state.grainSize[grain] = 0.7 + 1.5 * spread * spread;
      const pick = Math.random();
      state.tone[grain] = pick < 0.035 ? 1 : pick < 0.06 ? 2 : 0; // mostly ink; a little maize and leaf
    }
    Promise.all(
      sources.map((source) => {
        try {
          return loadPointCloud(Asset.fromModule(source as number).uri, count);
        } catch {
          return Promise.resolve(null);
        }
      }),
    ).then((list) => {
      if (!active) return;
      clouds.current = list;
      if (list.length > 0 && list.every(Boolean)) onReady();
    });
    return () => {
      active = false;
      cancelAnimationFrame(state.frameRequest);
    };
    // Sources are static for the lifetime of the stage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start (or redirect) the transition when the visible scene changes.
  useEffect(() => {
    if (index === state.previousIndex) return;
    const fromIndex = state.previousIndex;
    state.previousIndex = index;
    const canvas = canvasRef.current;
    const from = clouds.current[fromIndex];
    const to = clouds.current[index];
    if (!enabled || !canvas || !from || !to) {
      cancelAnimationFrame(state.frameRequest);
      state.running = false;
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Towards the next scene the wind blows left; towards the previous one, right.
    state.wind = index === (fromIndex + 1) % sources.length ? -1 : 1;
    if (state.running) {
      // Scene changed mid-flight: grains carry on from where they are.
      state.startX.set(state.currentX);
      state.startY.set(state.currentY);
    } else {
      state.startX.set(from.x);
      state.startY.set(from.y);
    }
    for (let grain = 0; grain < count; grain++) {
      // The upwind side crumbles first, so the erosion front is visible.
      const upwind = state.wind < 0 ? 1 - state.startX[grain] : state.startX[grain];
      state.delay[grain] = clamp01(upwind) * 0.33 + state.seedA[grain] * 0.07;
    }
    state.target = to;
    state.startedAt = performance.now();
    state.frames = 0;

    const drawFrame = (now: number) => {
      const element = canvasRef.current;
      const context = element?.getContext('2d');
      const target = state.target;
      if (!element || !context || !target) {
        state.running = false;
        return;
      }
      const time = Math.min(1, (now - state.startedAt) / latest.current.duration);
      const stagePx = element.width / (1 + 2 * MARGIN);
      const pixelRatio = stagePx / latest.current.size;
      const grainUnit = Math.max(1, latest.current.size / 430) * pixelRatio * (state.grainSkip > 1 ? 1.3 : 1);

      // Trail: fade the previous frame instead of clearing it.
      context.globalAlpha = 1;
      if (time > 0.04 && time < 0.9) {
        context.globalCompositeOperation = 'destination-out';
        context.fillStyle = 'rgba(0,0,0,0.38)';
        context.fillRect(0, 0, element.width, element.height);
        context.globalCompositeOperation = 'source-over';
      } else {
        context.clearRect(0, 0, element.width, element.height);
      }

      state.frames++;
      if (time >= 1) {
        state.running = false;
        const fps = state.frames / (latest.current.duration / 1000);
        if (fps < MIN_FPS && state.grainSkip < MAX_GRAIN_SKIP) state.grainSkip++;
        return;
      }

      // Grains fade in over the outgoing image and fade out as the incoming one appears.
      const fade = time < 0.07 ? time / 0.07 : time > 0.68 ? Math.max(0, 1 - (time - 0.68) / 0.32) : 1;
      const { startX, startY, currentX, currentY, delay, seedA, seedB, grainSize, tone, wind, grainSkip } = state;
      for (let pass = 0; pass < TONES.length; pass++) {
        const isInk = pass === 0;
        context.fillStyle = TONES[pass];
        context.globalAlpha = fade * (isInk ? 0.86 : 0.95);
        for (let grain = 0; grain < count; grain += grainSkip) {
          if (tone[grain] !== pass) continue;
          const u = clamp01((time - delay[grain]) / FLIGHT);
          const eased = easeInOutCubic(u);
          // 0 at both ends, 1 mid-flight: how far the grain strays from the straight path.
          const drift = Math.sin(Math.PI * u);
          const x = startX[grain] + (target.x[grain] - startX[grain]) * eased + wind * drift * (0.04 + 0.13 * seedA[grain]) + Math.sin(u * 9 + seedB[grain] * 6.283) * 0.012 * drift;
          const y = startY[grain] + (target.y[grain] - startY[grain]) * eased + drift * (0.09 * seedB[grain] - 0.03) + Math.cos(u * 7 + seedA[grain] * 6.283) * 0.012 * drift;
          currentX[grain] = x;
          currentY[grain] = y;
          const side = grainSize[grain] * grainUnit * (isInk ? 1 : 1.25);
          context.fillRect((MARGIN + x) * stagePx, (MARGIN + y) * stagePx, side, side);
        }
      }
      state.frameRequest = requestAnimationFrame(drawFrame);
    };

    if (!state.running) {
      state.running = true;
      state.frameRequest = requestAnimationFrame(drawFrame);
    }
    // `state`, `count` and `sources` are stable; only a scene change should run this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, enabled]);

  const cssSize = size * (1 + 2 * MARGIN);
  const pixelRatio = typeof window !== 'undefined' ? Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1) : 1;
  const pixelSize = Math.round(cssSize * pixelRatio);
  return (
    <canvas
      ref={canvasRef}
      width={pixelSize}
      height={pixelSize}
      aria-hidden="true"
      style={{ position: 'absolute', left: -MARGIN * size, top: -MARGIN * size, width: cssSize, height: cssSize, pointerEvents: 'none' }}
    />
  );
}
