export function canGenerateImage() {
  return typeof window.generateImage === 'function';
}

export function generateImage(...args) {
  if (!canGenerateImage()) throw new Error('Image generation is not available');
  return window.generateImage(...args);
}
