/**
 * Native (Android/iOS) version of the sand transition.
 *
 * The particle transition lives in SandMorph.web.tsx and draws on a <canvas>.
 * Native has no canvas without adding a graphics library, so nothing is drawn
 * here and `onReady` is never called: SceneStage then keeps the fade-and-slide
 * transition.
 */
import type { SandMorphProps } from './SandMorph.types';

export function SandMorph(_props: SandMorphProps) {
  return null;
}
