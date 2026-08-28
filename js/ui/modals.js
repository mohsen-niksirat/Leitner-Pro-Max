export function showHelp(key) {
  if (typeof window.showHelp !== 'function') throw new Error('Modal runtime is not loaded');
  return window.showHelp(key);
}
