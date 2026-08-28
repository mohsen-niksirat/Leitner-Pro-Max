export function hideSelectionPopup() {
  return typeof window.hidePdfTranslateInput === 'function' ? window.hidePdfTranslateInput() : undefined;
}
