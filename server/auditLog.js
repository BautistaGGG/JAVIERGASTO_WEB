const MAX_EVENTS = 500;
const events = [];

export function addAuditEvent(event = {}) {
  const normalized = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
    actor: event.actor || 'admin',
    action: event.action || 'unknown',
    entity: event.entity || 'system',
    entityId: event.entityId ?? null,
    detail: event.detail || '',
    requestId: event.requestId || null,
  };
  events.unshift(normalized);
  if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
  return normalized;
}

export function getAuditEvents({ limit = 50 } = {}) {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 200));
  return events.slice(0, safeLimit);
}

