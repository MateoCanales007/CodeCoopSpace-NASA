import type { Language } from '../i18n/types';
import { ApiError } from './ApiError';
import { normalizeCompareResponse, normalizeSites } from './normalize';
import type { RotationApi } from './rotationApi';

interface HttpOptions {
  baseUrl: string;
  timeoutMs?: number;
}

/** Talks to the team backend following docs/CONTRATO.md. */
export function createHttpRotationApi({ baseUrl, timeoutMs = 8000 }: HttpOptions): RotationApi {
  const root = baseUrl.replace(/\/$/, '');

  async function request(path: string, language: Language, init?: RequestInit): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${root}${path}`, {
        ...init,
        // The language of every returned text is requested with Accept-Language (en | es).
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Accept-Language': language },
        signal: controller.signal,
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new ApiError(`HTTP ${response.status} on ${path}`, response.status, path, body);
      return body;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // Network failure, CORS rejection or timeout.
      throw new ApiError(`Could not reach ${root}${path}: ${error instanceof Error ? error.message : String(error)}`, 0, path);
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    async listSites(language) {
      const path = '/v1/sites';
      return normalizeSites(await request(path, language), path);
    },
    async compareRotations(body, language) {
      const path = '/v1/compare';
      return normalizeCompareResponse(await request(path, language, { method: 'POST', body: JSON.stringify(body) }), path);
    },
  };
}
