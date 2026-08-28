export const LEGACY_GLOBALS = Object.freeze([
  'S', 'render', 'save', 'toast', 'uid', 'esc', 'ensurePdfJs', 'ensureChartJs',
  'ensureJsZip', 'receivePendingVocabForge', 'downloadPack', 'downloadCustomPack'
]);

export function hasLegacyApi(name) {
  return typeof window[name] !== 'undefined';
}

export function callLegacy(name, ...args) {
  const fn = window[name];
  if (typeof fn !== 'function') {
    throw new Error(`Legacy API unavailable: ${name}`);
  }
  return fn(...args);
}
