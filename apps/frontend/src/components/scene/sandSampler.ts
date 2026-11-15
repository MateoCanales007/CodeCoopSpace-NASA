/** Web only: turns an image into a cloud of points that follow its ink. */

/** Points normalised to 0..1 inside the square frame. */
export interface PointCloud {
  x: Float32Array;
  y: Float32Array;
}

/** Resolution at which each image is read. */
const GRID = 220;
/** Vertical strips used to pair neighbouring grains between two images. */
const STRIPS = 30;
/** Pixels fainter than this alpha are treated as empty. */
const MIN_ALPHA = 28;

/**
 * Picks `count` random points weighted by the image's alpha channel, then
 * sorts them by strip and height. Two clouds sorted the same way pair grain
 * `i` with a nearby grain `i`, so the sand flows instead of scrambling.
 */
export function sampleImage(image: HTMLImageElement, count: number): PointCloud | null {
  const canvas = document.createElement('canvas');
  canvas.width = GRID;
  canvas.height = GRID;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  let pixels: Uint8ClampedArray;
  try {
    context.drawImage(image, 0, 0, GRID, GRID);
    pixels = context.getImageData(0, 0, GRID, GRID).data;
  } catch {
    return null; // e.g. a cross-origin image that cannot be read
  }

  // Cumulative alpha, so a random number maps to a pixel in proportion to its ink.
  const cells = GRID * GRID;
  const cumulative = new Float64Array(cells);
  let total = 0;
  for (let cell = 0; cell < cells; cell++) {
    const alpha = pixels[cell * 4 + 3];
    if (alpha > MIN_ALPHA) total += alpha;
    cumulative[cell] = total;
  }
  if (total === 0) return null;

  const rawX = new Float32Array(count);
  const rawY = new Float32Array(count);
  const sortKey = new Float32Array(count);
  for (let point = 0; point < count; point++) {
    const target = Math.random() * total;
    let low = 0;
    let high = cells - 1;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (cumulative[middle] < target) low = middle + 1;
      else high = middle;
    }
    rawX[point] = ((low % GRID) + Math.random()) / GRID;
    rawY[point] = (Math.floor(low / GRID) + Math.random()) / GRID;
    sortKey[point] = Math.floor(rawX[point] * STRIPS) * 2 + rawY[point];
  }

  const order = Array.from({ length: count }, (_, point) => point).sort((a, b) => sortKey[a] - sortKey[b]);
  const x = new Float32Array(count);
  const y = new Float32Array(count);
  order.forEach((source, target) => {
    x[target] = rawX[source];
    y[target] = rawY[source];
  });
  return { x, y };
}

/** Loads an image by URL and samples it; resolves to null if it cannot be read. */
export function loadPointCloud(uri: string, count: number): Promise<PointCloud | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(sampleImage(image, count));
    image.onerror = () => resolve(null);
    image.src = uri;
  });
}
