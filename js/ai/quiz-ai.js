export { initialize } from './ai-manager.js';
export { PROVIDERS, hasProviderKey } from './providers.js';

export function openChat(container = document.getElementById('content')) {
  if (typeof window.renderAiChat !== 'function') throw new Error('AI chat runtime is not loaded');
  return window.renderAiChat(container);
}
