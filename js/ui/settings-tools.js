export { render as renderSettings } from './settings.js';

export function renderPacks() {
  return typeof window.renderPacksGrid === 'function' ? window.renderPacksGrid() : undefined;
}

export function downloadPack(id) {
  if (typeof window.downloadPack !== 'function') throw new Error('Pack runtime is not loaded');
  return window.downloadPack(id);
}
