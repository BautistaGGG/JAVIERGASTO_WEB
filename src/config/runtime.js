const parseBooleanEnv = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
};

const explicitMockFallback = parseBooleanEnv(import.meta.env?.VITE_ENABLE_MOCK_FALLBACK);

export const isMockFallbackEnabled = () => {
  if (explicitMockFallback !== null) return explicitMockFallback;
  return Boolean(import.meta.env?.DEV);
};

export const runtimeConfig = {
  apiUrl: import.meta.env?.VITE_API_URL || '/api',
  isDev: Boolean(import.meta.env?.DEV),
  isProd: Boolean(import.meta.env?.PROD),
  mockFallbackEnabled: isMockFallbackEnabled(),
};

