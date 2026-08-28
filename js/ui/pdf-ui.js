export function render(container = document.getElementById('content')) {
  if (typeof window.renderPDFReader !== 'function') throw new Error('PDF UI runtime is not loaded');
  return window.renderPDFReader(container);
}
