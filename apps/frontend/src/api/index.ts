/**
 * ═══════════════════════════════════════════════════════════════════════
 *  API CONNECTION POINT
 * ═══════════════════════════════════════════════════════════════════════
 * Screens and hooks only use `rotationApi` (see the `RotationApi` interface).
 *
 * Everything the farmer sees comes from the team's FastAPI server
 * (services/api): the areas, the comparison, its explanation and the weather.
 * The app bundles no data. If the server cannot be reached, the screens say
 * so and offer to try again.
 *
 * Server address:
 *   - `EXPO_PUBLIC_API_URL` in apps/frontend/.env.local, when it is set.
 *   - Otherwise, on the web, the same host that serves the page on port 8000,
 *     so a phone on the same Wi-Fi reaches the server without any setup.
 *
 * Language: text written by the server is requested with the
 * `Accept-Language` header (en | es).
 */
import { createHttpRotationApi } from './httpRotationApi';
import type { RotationApi } from './rotationApi';

const API_PORT = 8000;

function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured;
  const host = typeof window !== 'undefined' ? window.location?.hostname : undefined;
  return `http://${host || '127.0.0.1'}:${API_PORT}`;
}

export const rotationApi: RotationApi = createHttpRotationApi({ baseUrl: resolveApiUrl() });

export type { RotationApi } from './rotationApi';
