export const PROVIDERS = Object.freeze([
  { id: 'gemini', requiresKey: true, supportsVision: true },
  { id: 'openrouter', requiresKey: true, supportsVision: true },
  { id: 'groq', requiresKey: true, supportsVision: false },
  { id: 'pollinations', requiresKey: false, supportsVision: true },
  { id: 'puter_img', requiresKey: false, supportsVision: false }
]);

export function hasProviderKey(provider) {
  const keys = window.state?.apiKeys?.[provider];
  return Array.isArray(keys) ? keys.some((key) => String(key).trim()) : Boolean(keys);
}
