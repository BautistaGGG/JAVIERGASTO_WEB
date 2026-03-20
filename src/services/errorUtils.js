export function formatApiErrorMessage(error, fallback = 'Ocurrió un error') {
  const base = error?.message || fallback;
  const requestId = error?.requestId;
  if (!requestId) return base;
  return `${base} (ID: ${requestId})`;
}

