export function translate(word) {
  if (typeof window.doPdfTranslateSmart !== 'function') throw new Error('PDF translation runtime is not loaded');
  return window.doPdfTranslateSmart(word);
}
