export function render(container = document.getElementById('content')) {
  if (typeof window.renderLibrary !== 'function') throw new Error('Vocabulary UI runtime is not loaded');
  return window.renderLibrary(container);
}
