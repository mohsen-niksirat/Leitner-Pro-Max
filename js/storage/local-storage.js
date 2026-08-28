export const STATE_KEY = 'leitner_v2';

// Legacy compatibility only: normal reads and writes use IndexedDB in the runtime.
export function loadLegacyState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearLegacyState() {
  try {
    localStorage.removeItem(STATE_KEY);
    return true;
  } catch {
    return false;
  }
}

// Kept for consumers of the old facade; deliberately does not write application state.
export function saveRawState() {
  return false;
}
