export { dueCards, startReview, rateReview } from './review.js';

export function renderLibrary(container = document.getElementById('content')) {
  if (typeof window.renderLibrary !== 'function') throw new Error('Library runtime is not loaded');
  return window.renderLibrary(container);
}
