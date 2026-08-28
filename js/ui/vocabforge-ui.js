export function render(container = document.getElementById('content')) {
  if (typeof window.renderVocabforge !== 'function') throw new Error('VocabForge UI runtime is not loaded');
  return window.renderVocabforge(container);
}

export function receivePending() {
  return typeof window.receivePendingVocabForge === 'function' ? window.receivePendingVocabForge() : false;
}
