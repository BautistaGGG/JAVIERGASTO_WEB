const STORAGE_KEY = 'client_error_log';
const METRIC_STORAGE_KEY = 'client_metric_log';
const MAX_ENTRIES = 60;

function sanitizeEntry(entry = {}) {
  return {
    at: new Date().toISOString(),
    source: String(entry.source || 'unknown'),
    message: String(entry.message || 'Error sin mensaje'),
    requestId: entry.requestId ? String(entry.requestId) : null,
    path: entry.path ? String(entry.path) : (typeof window !== 'undefined' ? window.location.pathname : null),
    extra: entry.extra && typeof entry.extra === 'object' ? entry.extra : null,
  };
}

function persist(entry) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const current = raw ? JSON.parse(raw) : [];
    const next = [entry, ...(Array.isArray(current) ? current : [])].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // no-op: storage can fail in private mode
  }
}

export function logClientError(entry) {
  const normalized = sanitizeEntry(entry);
  persist(normalized);
  // keep console visible for immediate diagnostics in QA/prod console
  // eslint-disable-next-line no-console
  console.error('[client_error]', normalized);
  return normalized;
}

export function getRecentClientErrors() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function sanitizeMetric(metric = {}) {
  return {
    at: new Date().toISOString(),
    name: String(metric.name || 'metric.unknown'),
    value: Number.isFinite(Number(metric.value)) ? Number(metric.value) : 0,
    unit: String(metric.unit || 'count'),
    tags: metric.tags && typeof metric.tags === 'object' ? metric.tags : null,
  };
}

export function logClientMetric(metric) {
  const normalized = sanitizeMetric(metric);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(METRIC_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : [];
      const next = [normalized, ...(Array.isArray(current) ? current : [])].slice(0, MAX_ENTRIES);
      window.localStorage.setItem(METRIC_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // no-op
    }
  }
  return normalized;
}

export function getRecentClientMetrics() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(METRIC_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
