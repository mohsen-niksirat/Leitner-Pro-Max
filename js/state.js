export function getState() {
  return window.S;
}

export function saveState() {
  if (typeof window.save === 'function') window.save();
}

export function forceSaveState() {
  return typeof window.saveForce === 'function' ? window.saveForce() : Promise.resolve(false);
}

export function getStorageKeys() {
  return {
    indexedDb: 'leitnerDB',
    indexedDbStore: 'data',
    legacyLocalStorage: 'leitner_v2'
  };
}
