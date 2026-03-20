import { runtimeConfig } from '../config/runtime.js';

const API_URL = runtimeConfig.apiUrl;
const API_UNAVAILABLE_ERROR = 'API_UNAVAILABLE';

const createApiUnavailableError = (endpoint) => {
  const error = new Error(`API unavailable for ${endpoint}`);
  error.code = API_UNAVAILABLE_ERROR;
  return error;
};

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('industrialpro_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
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
      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError' || !error.status) {
      console.warn(`[API] ${endpoint} unavailable`);
      return null;
    }
    throw error;
  }
}

export function ensureApiResponse(data, endpoint) {
  if (data !== null) return data;
  throw createApiUnavailableError(endpoint);
}

export function isApiUnavailableError(error) {
  return error?.code === API_UNAVAILABLE_ERROR;
}

export default apiFetch;
