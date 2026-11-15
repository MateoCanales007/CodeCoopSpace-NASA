/**
 * ═══════════════════════════════════════════════════════════════════════
 *  API CONNECTION POINT
 * ═══════════════════════════════════════════════════════════════════════
 * Screens and hooks only use `rotationApi` (see the `RotationApi` interface).
 *
 * Today it answers with demo data (src/api/demo), so the flow works with the
 * backend switched off.
 *
 * To connect the team's real API:
 *   1. Implement `GET /v1/sites` and `POST /v1/compare` following
 *      docs/CONTRATO.md and the types in src/api/types.ts.
 *   2. In apps/frontend/.env.local set:
 *        EXPO_PUBLIC_USE_API=1
 *        EXPO_PUBLIC_API_URL=http://<ip-or-domain>:8000
 *   3. Restart Expo. No screen needs to change.
 *
 * Language: the UI asks for English or Spanish text with the `Accept-Language`
 * header (en | es). If the backend answers in a single language, reasons and
 * warnings will show in that language even when the UI switches.
 */
import { createDemoRotationApi } from './demoRotationApi';
import { createHttpRotationApi } from './httpRotationApi';
import type { RotationApi } from './rotationApi';
import { withDemoFallback } from './withDemoFallback';

const USE_API = process.env.EXPO_PUBLIC_USE_API === '1';
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

const demoApi = createDemoRotationApi();

export const rotationApi: RotationApi = USE_API ? withDemoFallback(createHttpRotationApi({ baseUrl: API_URL }), demoApi) : demoApi;

export type { RotationApi } from './rotationApi';
