export function render(blobUrl) {
  if (typeof window.renderPDFCanvasPages !== 'function') throw new Error('PDF renderer is not loaded');
  return window.renderPDFCanvasPages(blobUrl);
}
