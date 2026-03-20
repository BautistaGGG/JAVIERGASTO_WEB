const sanitizeMeta = (meta = {}) => {
  const next = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'object') {
      next[key] = Array.isArray(value) ? value : JSON.stringify(value);
    } else {
      next[key] = value;
    }
  }
  return next;
};

const write = (level, message, meta = {}) => {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizeMeta(meta),
  };
  const line = JSON.stringify(payload);
  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
};

export function logInfo(message, meta = {}) {
  write('info', message, meta);
}

export function logWarn(message, meta = {}) {
  write('warn', message, meta);
}

export function logError(message, meta = {}) {
  write('error', message, meta);
}

