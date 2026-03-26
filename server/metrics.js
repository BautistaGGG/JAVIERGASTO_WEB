const MAX_SAMPLES = 5000;

const state = {
  requests: [],
  routeErrors: 0,
  unhandledErrors: 0,
  whatsappClicks: [],
};

const normalizePath = (value = '') =>
  String(value)
    .replace(/\b\d+\b/g, ':id')
    .replace(/[a-f0-9]{24,}/gi, ':token');

const percentile95 = (values = []) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1);
  return sorted[index];
};

export function recordRequestMetric({ method, path, statusCode, durationMs }) {
  state.requests.push({
    method,
    path: normalizePath(path),
    statusCode: Number(statusCode || 0),
    durationMs: Number(durationMs || 0),
    at: Date.now(),
  });

  if (state.requests.length > MAX_SAMPLES) {
    state.requests.splice(0, state.requests.length - MAX_SAMPLES);
  }
}

export function recordRouteError() {
  state.routeErrors += 1;
}

export function recordUnhandledError() {
  state.unhandledErrors += 1;
}

export function recordWhatsAppClick({ source = 'unknown', metadata = {} } = {}) {
  state.whatsappClicks.push({
    source: String(source || 'unknown'),
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
    at: Date.now(),
  });

  if (state.whatsappClicks.length > MAX_SAMPLES) {
    state.whatsappClicks.splice(0, state.whatsappClicks.length - MAX_SAMPLES);
  }
}

export function getMetricsSnapshot() {
  const total = state.requests.length;
  const success = state.requests.filter((request) => request.statusCode >= 200 && request.statusCode < 400).length;
  const error = state.requests.filter((request) => request.statusCode >= 400).length;
  const availabilityPct = total > 0 ? Number(((success / total) * 100).toFixed(2)) : 100;
  const p95Ms = percentile95(state.requests.map((request) => request.durationMs));

  const endpointMap = new Map();
  for (const request of state.requests) {
    const key = `${request.method} ${request.path}`;
    if (!endpointMap.has(key)) {
      endpointMap.set(key, { key, count: 0, errors: 0, durations: [] });
    }
    const entry = endpointMap.get(key);
    entry.count += 1;
    if (request.statusCode >= 400) entry.errors += 1;
    entry.durations.push(request.durationMs);
  }

  const endpoints = [...endpointMap.values()]
    .map((entry) => ({
      endpoint: entry.key,
      count: entry.count,
      errorRatePct: Number(((entry.errors / entry.count) * 100).toFixed(2)),
      p95Ms: percentile95(entry.durations),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const whatsappBySource = state.whatsappClicks.reduce((acc, event) => {
    const key = event.source || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    timestamp: new Date().toISOString(),
    requests: {
      total,
      success,
      error,
      availabilityPct,
    },
    latency: {
      p95Ms,
    },
    errors: {
      route: state.routeErrors,
      unhandled: state.unhandledErrors,
    },
    whatsapp: {
      totalClicks: state.whatsappClicks.length,
      bySource: whatsappBySource,
    },
    endpoints,
  };
}
