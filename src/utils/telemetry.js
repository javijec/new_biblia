const STORAGE_KEY = 'biblia_telemetry_v1';
const MAX_ENTRIES = 200;

function readEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Ignore storage write failures
  }
}

function toErrorPayload(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  return {
    message: typeof error === 'string' ? error : JSON.stringify(error),
  };
}

function pushEntry(entry) {
  const entries = readEntries();
  entries.push({
    ts: new Date().toISOString(),
    ...entry,
  });
  writeEntries(entries);
}

export function logEvent(event, payload = {}) {
  pushEntry({ type: 'event', event, payload });
}

export function logError(event, error, context = {}) {
  pushEntry({
    type: 'error',
    event,
    error: toErrorPayload(error),
    context,
  });
}

export function getTelemetryEntries() {
  return readEntries();
}

export function clearTelemetryEntries() {
  writeEntries([]);
}
