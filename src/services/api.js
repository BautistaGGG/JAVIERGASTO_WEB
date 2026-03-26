import { runtimeConfig } from '../config/runtime.js';
import { logClientError } from './clientLogger.js';
import { logClientMetric } from './clientLogger.js';

const API_URL = runtimeConfig.apiUrl;
const API_UNAVAILABLE_ERROR = 'API_UNAVAILABLE';
const API_TIMEOUT_MS = 10000;
const RETRIABLE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createApiUnavailableError = (endpoint) => {
  const error = new Error(`API unavailable for ${endpoint}`);
  error.code = API_UNAVAILABLE_ERROR;
  return error;
};

const normalizeApiError = (error, endpoint) => {
  if (error?.code === API_UNAVAILABLE_ERROR) return error;
  const normalized = new Error(error?.message || `API error at ${endpoint}`);
  normalized.code = error?.code || API_UNAVAILABLE_ERROR;
  normalized.status = error?.status;
  normalized.requestId = error?.requestId;
  return normalized;
};

const shouldRetry = (method, attempt, error) => {
  if (attempt >= 2) return false;
  if (!RETRIABLE_METHODS.has(method)) return false;
  if (error?.status) return error.status >= 500;
  return true;
};

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('industrialpro_token');
  const method = String(options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        method,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const errorMessage = typeof payload.error === 'string'
          ? payload.error
          : payload.error?.message || `HTTP ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        error.code = payload.error?.code;
        error.requestId = payload.error?.requestId;
        logClientError({
          source: 'api.response',
          message: error.message,
          requestId: error.requestId,
          extra: { endpoint, method, status: response.status },
        });
        logClientMetric({
          name: 'api.request',
          value: Math.round(performance.now() - startedAt),
          unit: 'ms',
          tags: { endpoint, method, status: response.status, result: 'error' },
        });
        if (shouldRetry(method, attempt, error)) {
          await sleep(150 * (attempt + 1));
          continue;
        }
        throw error;
      }

      const text = await response.text();
      logClientMetric({
        name: 'api.request',
        value: Math.round(performance.now() - startedAt),
        unit: 'ms',
        tags: { endpoint, method, status: response.status, result: 'ok' },
      });
      return text ? JSON.parse(text) : {};
    } catch (error) {
      if (shouldRetry(method, attempt, error)) {
        await sleep(150 * (attempt + 1));
        continue;
      }
      if (error.name === 'TypeError' || error.name === 'AbortError' || !error.status) {
        console.warn(`[API] ${endpoint} unavailable`);
        logClientError({
          source: 'api.network',
          message: error?.message || 'Network/API unavailable',
          extra: { endpoint, method },
        });
        logClientMetric({
          name: 'api.request',
          value: Math.round(performance.now() - startedAt),
          unit: 'ms',
          tags: { endpoint, method, result: 'network_error' },
        });
        return null;
      }
      logClientError({
        source: 'api.exception',
        message: error?.message || 'API error',
        requestId: error?.requestId,
        extra: { endpoint, method, status: error?.status || null },
      });
      logClientMetric({
        name: 'api.request',
        value: Math.round(performance.now() - startedAt),
        unit: 'ms',
        tags: { endpoint, method, status: error?.status || 'unknown', result: 'exception' },
      });
      throw normalizeApiError(error, endpoint);
    } finally {
      clearTimeout(timeout);
    }
  }

  return null;
}

export function ensureApiResponse(data, endpoint) {
  if (data !== null) return data;
  throw createApiUnavailableError(endpoint);
}

export function isApiUnavailableError(error) {
  return error?.code === API_UNAVAILABLE_ERROR;
}

export default apiFetch;
