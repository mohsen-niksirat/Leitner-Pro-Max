export function buildPrompt(...args) {
  if (typeof window.buildPrompt === 'function') return window.buildPrompt(...args);
  return args.filter(Boolean).join('\n');
}
