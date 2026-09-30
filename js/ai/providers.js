// ═══════════════════════════════════════════
// AI CHAT PRO — Providers, Proxy & API Clients
// ═══════════════════════════════════════════

export const PROVIDERS = Object.freeze([
  { id: 'gemini', requiresKey: true, supportsVision: true },
  { id: 'openrouter', requiresKey: true, supportsVision: true },
  { id: 'groq', requiresKey: true, supportsVision: false },
  { id: 'pollinations', requiresKey: false, supportsVision: true },
  { id: 'puter_img', requiresKey: false, supportsVision: false }
]);

export const DEFAULT_CHAT_STATE = {
  provider: 'gemini',
  model: 'gemini-3.8-flash',
  apiKeys: { gemini: [''], openrouter: [''], groq: [''], pollinations: [''] },
  keyIndex: { gemini: 0, openrouter: 0, groq: 0, pollinations: 0 },
  systemPrompt: 'شما یک دستیار هوش مصنوعی مفید و دقیق هستید. به فارسی پاسخ دهید مگر اینکه کاربر زبان دیگری بخواهد.',
  temperature: 0.7,
  maxTokens: 4096,
  dailyLimit: 250,
  dailyUsage: 0,
  dailyUsageDate: '',
  theme: 'dark',
  chats: [],
  activeChat: null,
  providerUsageStats: { gemini: 0, openrouter: 0, groq: 0, pollinations: 0 },
  customProxy: { url: '', token: '' }
};

export const MODELS = {
  gemini: [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-pro-preview',
    'gemini-3.1-flash-lite-preview',
    'gemini-3-flash-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-lite-image',
    'gemini-3-pro-image',
    'gemini-2.5-flash-image',
    'gemini-2.0-flash-exp-image-generation'
  ],
  openrouter: [
    'openrouter/free',
    'nvidia/nemotron-3-ultra-550b-a55b:free',
    'nvidia/nemotron-3-super-120b-a12b:free',
    'inclusionai/ling-3.0-flash:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'deepseek/deepseek-chat-v3-0324:free',
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'openai/gpt-oss-20b:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
    'google/gemini-3.8-flash',
    'google/gemini-3.6-flash',
    'google/gemini-2.5-pro',
    'google/gemini-2.5-flash',
    'anthropic/claude-sonnet-5',
    'anthropic/claude-sonnet-4',
    'openai/gpt-5',
    'openai/gpt-5-mini',
    'deepseek/deepseek-chat-v3.1',
    'qwen/qwen3.6-plus',
    'google/gemini-3.1-flash-image',
    'google/gemini-3-pro-image',
    'openai/gpt-5-image'
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.6-27b',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'deepseek-r1-distill-llama-70b',
    'qwen-qwq-32b',
    'groq/compound',
    'groq/compound-mini',
    'allam-2-7b'
  ],
  pollinations: [
    'flux',
    'flux-realism',
    'flux-anime',
    'flux-3d',
    'flux-pro',
    'turbo',
    'gptimage',
    'kontext',
    'nanobanana',
    'nanobanana-2',
    'seedream'
  ],
  puter_img: [
    'gpt-image-2',
    'gpt-image-1',
    'flux-2-pro',
    'flux-1.1-pro',
    'stable-diffusion-3',
    'grok-imagine-image',
    'dall-e-3'
  ]
};

export const MODEL_LABELS = Object.freeze({
  // Gemini
  'gemini-3.8-flash': '✦ Gemini 3.8 Flash (جدیدترین · پیشنهادی)',
  'gemini-3.7-flash': '✦ Gemini 3.7 Flash (سریع و هوشمند)',
  'gemini-3.6-flash': '✦ Gemini 3.6 Flash (متعادل)',
  'gemini-3.5-flash': '✦ Gemini 3.5 Flash',
  'gemini-3.5-flash-lite': '⚡ Gemini 3.5 Flash-Lite (۵۰۰ درخواست/روز)',
  'gemini-3.1-pro-preview': '💎 Gemini 3.1 Pro Preview (پیشرفته‌ترین)',
  'gemini-3.1-flash-lite-preview': '⚡ Gemini 3.1 Flash-Lite Preview',
  'gemini-3-flash-preview': '✦ Gemini 3 Flash Preview',
  'gemini-2.5-pro': '💎 Gemini 2.5 Pro (استدلال عمیق)',
  'gemini-2.5-flash': '✦ Gemini 2.5 Flash',
  'gemini-2.5-flash-lite': '⚡ Gemini 2.5 Flash-Lite (سریع)',
  'gemini-2.0-flash': '✦ Gemini 2.0 Flash',
  'gemini-3.1-flash-image': '🖼️ Nano Banana 2 — Gemini 3.1 Image (تصویرساز)',
  'gemini-3.1-flash-lite-image': '🖼️ Nano Banana 2 Lite — Gemini 3.1 Lite Image',
  'gemini-3-pro-image': '🖼️ Nano Banana Pro — Gemini 3 Pro Image (4K)',
  'gemini-2.5-flash-image': '🖼️ Nano Banana — Gemini 2.5 Flash Image',
  'gemini-2.0-flash-exp-image-generation': '🖼️ Gemini 2.0 Flash Image (تصویرساز)',
  // OpenRouter
  'openrouter/free': '🔄 Free Router (انتخاب خودکار بهترین مدل رایگان)',
  'nvidia/nemotron-3-ultra-550b-a55b:free': '🆓 Nemotron 3 Ultra 550B (رایگان · 1M ctx)',
  'nvidia/nemotron-3-super-120b-a12b:free': '🆓 Nemotron 3 Super 120B (رایگان)',
  'inclusionai/ling-3.0-flash:free': '🆓 Ling 3.0 Flash 124B MoE (رایگان)',
  'google/gemma-4-31b-it:free': '🆓 Gemma 4 31B Vision (رایگان)',
  'google/gemma-4-26b-a4b-it:free': '🆓 Gemma 4 26B MoE Vision (رایگان)',
  'deepseek/deepseek-chat-v3-0324:free': '🆓 DeepSeek V3 (رایگان)',
  'deepseek/deepseek-r1:free': '🆓 DeepSeek R1 استدلالی (رایگان)',
  'meta-llama/llama-3.3-70b-instruct:free': '🆓 Llama 3.3 70B Instruct (رایگان)',
  'qwen/qwen-2.5-72b-instruct:free': '🆓 Qwen 2.5 72B Instruct (رایگان)',
  'openai/gpt-oss-20b:free': '🆓 GPT-OSS 20B (رایگان)',
  'nvidia/nemotron-nano-12b-v2-vl:free': '🆓 Nemotron Nano 12B VL ویژن (رایگان)',
  'google/gemini-3.8-flash': '💎 Gemini 3.8 Flash',
  'google/gemini-3.6-flash': '💎 Gemini 3.6 Flash',
  'google/gemini-2.5-pro': '💎 Gemini 2.5 Pro',
  'google/gemini-2.5-flash': '💎 Gemini 2.5 Flash',
  'anthropic/claude-sonnet-5': '💎 Claude Sonnet 5',
  'anthropic/claude-sonnet-4': '💎 Claude Sonnet 4',
  'openai/gpt-5': '💎 OpenAI GPT-5',
  'openai/gpt-5-mini': '💎 OpenAI GPT-5 Mini',
  'deepseek/deepseek-chat-v3.1': '💎 DeepSeek V3.1',
  'qwen/qwen3.6-plus': '💎 Qwen 3.6 Plus',
  'google/gemini-3.1-flash-image': '🖼️ Nano Banana 2 (تصویرساز)',
  'google/gemini-3-pro-image': '🖼️ Nano Banana Pro (تصویرساز)',
  'openai/gpt-5-image': '🖼️ GPT-5 Image (تصویرساز)',
  // Groq
  'llama-3.3-70b-versatile': '⚡ Llama 3.3 70B Versatile (1K req/day)',
  'llama-3.1-8b-instant': '⚡ Llama 3.1 8B Instant (14.4K req/day)',
  'openai/gpt-oss-120b': '🧠 GPT-OSS 120B (پرهوش)',
  'openai/gpt-oss-20b': '⚡ GPT-OSS 20B (سریع)',
  'qwen/qwen3.6-27b': '🌐 Qwen 3.6 27B (عالی برای فارسی)',
  'meta-llama/llama-4-maverick-17b-128e-instruct': '🦙 Llama 4 Maverick 17B 128E',
  'meta-llama/llama-4-scout-17b-16e-instruct': '🦙 Llama 4 Scout 17B 16E',
  'deepseek-r1-distill-llama-70b': '🐋 DeepSeek R1 Distill 70B (استدلالی)',
  'qwen-qwq-32b': '🧠 Qwen QwQ 32B (استدلالی)',
  'groq/compound': '🤖 Groq Compound (ایجنت هوشمند)',
  'groq/compound-mini': '🤖 Groq Compound Mini',
  'allam-2-7b': '🌙 Allam 2 7B (عربی/فارسی)',
  // Pollinations
  'flux': '🎨 Flux (پیش‌فرض · کیفیت بالا)',
  'flux-realism': '📸 Flux Realism (واقع‌گرایانه)',
  'flux-anime': '🌸 Flux Anime (انیمه)',
  'flux-3d': '🧊 Flux 3D (سه‌بعدی)',
  'flux-pro': '💎 Flux Pro (حرفه‌ای)',
  'turbo': '⚡ Turbo (فوق سریع)',
  'gptimage': '🖼️ GPT Image (تصویرساز و ویرایش)',
  'kontext': '✏️ Flux Kontext (ویرایش تصویر)',
  'nanobanana': '🍌 Nano Banana (تصویرساز و ویرایش)',
  'nanobanana-2': '🍌 Nano Banana 2 (جدیدترین)',
  'seedream': '🌱 Seedream 3.0 (تصویرساز و ویرایش)',
  // Puter
  'gpt-image-2': '🖼️ OpenAI GPT-Image 2',
  'gpt-image-1': '🖼️ OpenAI GPT-Image 1',
  'flux-2-pro': '🎨 Flux 2 Pro',
  'flux-1.1-pro': '🎨 Flux 1.1 Pro',
  'stable-diffusion-3': '🖼️ Stable Diffusion 3 Medium',
  'grok-imagine-image': '⚡ xAI Grok Imagine',
  'dall-e-3': '🎨 DALL·E 3'
});

export const IMAGE_KEYWORDS = [
  'تصویر', 'عکس', 'نقاشی', 'generate image', 'create image', 'draw', 'paint',
  'تصویر بساز', 'عکس بساز', 'بکش', 'ویرایش عکس', 'ویرایش تصویر', 'edit image', 'edit photo'
];

export const POLLINATIONS_EDIT_MODELS = ['kontext', 'nanobanana', 'nanobanana-2', 'seedream', 'gptimage', 'klein'];

export function hasProviderKey(provider) {
  const keys = window.state?.apiKeys?.[provider];
  return Array.isArray(keys) ? keys.some((key) => String(key).trim()) : Boolean(keys);
}

export function loadPuterScript() {
  return new Promise((resolve, reject) => {
    if (window.puter && window.puter.ai) return resolve();

    if (document.querySelector('script[src*="puter.com"]')) {
      let tries = 0;
      const wait = setInterval(() => {
        if (window.puter && window.puter.ai) { clearInterval(wait); resolve(); }
        if (++tries > 50) { clearInterval(wait); reject(new Error('Puter SDK بارگذاری شد ولی آماده نشد. صفحه رو رفرش کنید.')); }
      }, 200);
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://js.puter.com/v2/';
    s.onload = () => {
      let tries = 0;
      const wait = setInterval(() => {
        if (window.puter && window.puter.ai) {
          clearInterval(wait);
          try { window.puter.quiet = true; } catch(e) {}
          resolve();
        }
        if (++tries > 50) {
          clearInterval(wait);
          reject(new Error('Puter SDK لود شد ولی آماده نشد. اتصال اینترنت رو بررسی کنید.'));
        }
      }, 200);
    };
    s.onerror = () => reject(new Error('بارگذاری Puter.js ناموفق بود. اتصال اینترنت رو بررسی کنید.'));
    document.head.appendChild(s);
  });
}

export async function aiFetch(state, url, opts = {}, retries = 2) {
  const cpUrl = (state.customProxy && state.customProxy.url) ? String(state.customProxy.url).trim().replace(/\/+$/, '') : '';
  const cpToken = (state.customProxy && state.customProxy.token) ? String(state.customProxy.token).trim() : '';
  const custom = cpUrl ? { fn: u => cpUrl + '/api/proxy/' + u, token: cpToken } : null;
  const direct = { fn: u => u, token: '' };
  const publicProxies = [
    { fn: u => 'https://corsproxy.io/?' + encodeURIComponent(u), token: '' },
    { fn: u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u), token: '' },
    { fn: u => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u), token: '' },
    { fn: u => 'https://corsproxy.org/?' + encodeURIComponent(u), token: '' }
  ];
  const headers = opts.headers || {};
  const hasCredential = /[?&]key=/.test(url) || Object.keys(headers).some(k => k.toLowerCase() === 'authorization');
  // درخواست‌های دارای کلید: هرگز به پروکسی‌های عمومی نروند (کلید لو نرود).
  const routes = custom
    ? (hasCredential ? [custom, direct] : [custom, direct, ...publicProxies])
    : (hasCredential ? [direct] : [direct, ...publicProxies]);
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (let i = 0; i < routes.length; i++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const route = routes[i];
        const requestOpts = { ...opts, signal: controller.signal };
        if (route.token && route !== direct) {
          requestOpts.headers = { ...(requestOpts.headers || {}), 'X-Vortex-Token': route.token };
        }
        const r = await fetch(route.fn(url), requestOpts);
        clearTimeout(timeout);
        if (r.ok) return r;
        const body = await r.clone().json().catch(() => null);
        if (body && (body.error || body.candidates || body.choices)) {
          return { ok: false, json: () => Promise.resolve(body), status: r.status, statusText: r.statusText };
        }
        lastErr = new Error('HTTP ' + r.status);
        if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429) break;
      } catch (e) {
        clearTimeout(timeout);
        lastErr = e.name === 'AbortError' ? new Error('زمان درخواست تمام شد') : e;
        console.warn('[AI] request failed:', lastErr.message);
      }
    }
    if (attempt < retries) await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
  }
  throw new Error('اتصال برقرار نشد. ' + (lastErr ? lastErr.message : ''));
}

export async function pollinationsFetch(url, opts, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(60000) });
      if (r.ok) return r;
      if ((r.status === 500 || r.status === 502) && i < retries) {
        console.log('[Pollinations] Retry ' + (i+1) + '/' + retries + ' after HTTP ' + r.status);
        await new Promise(res => setTimeout(res, 2000 * (i+1)));
        continue;
      }
      throw new Error('HTTP ' + r.status);
    } catch (e) {
      if (i === retries) throw e;
      console.log('[Pollinations] Retry ' + (i+1) + '/' + retries + ': ' + e.message);
      await new Promise(res => setTimeout(res, 2000 * (i+1)));
    }
  }
}

export function hasImageAttachment(chat) {
  const lastMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  return Boolean(lastMsg?.attachments && lastMsg.attachments.length > 0);
}

export async function callProviderAPI({ state, chat, wantsImage, getCurrentKey, getKeyCount, rotateKey }) {
  if (state.provider === 'gemini') return callGemini({ state, chat, wantsImage, getCurrentKey, getKeyCount, rotateKey });
  if (state.provider === 'openrouter') return callOpenRouter({ state, chat, getCurrentKey, getKeyCount, rotateKey });
  if (state.provider === 'groq') return callGroq({ state, chat, getCurrentKey, getKeyCount, rotateKey });
  if (state.provider === 'pollinations') return callPollinations({ state, chat });
  if (state.provider === 'puter_img') return callPuterImg({ state, chat });
  throw new Error('ارائه‌دهنده نامعتبر');
}

async function callGemini({ state, chat, wantsImage, getCurrentKey, getKeyCount, rotateKey }) {
  const apiKey = getCurrentKey('gemini');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`;

  const contents = [];
  chat.messages.forEach(msg => {
    const parts = [];
    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach(att => {
        const base64 = att.data.split(',')[1];
        parts.push({ inlineData: { mimeType: att.type || 'image/png', data: base64 } });
      });
    }
    if (msg.text) parts.push({ text: msg.text });
    if (parts.length > 0) {
      contents.push({ role: msg.role === 'user' ? 'user' : 'model', parts });
    }
  });

  const body = {
    contents,
    generationConfig: {
      temperature: state.temperature,
      maxOutputTokens: state.maxTokens
    }
  };

  const supportsImage = state.model.includes('gemini-2.5') || state.model.includes('gemini-3') || state.model.includes('image');
  if ((wantsImage || hasImageAttachment(chat)) && supportsImage) {
    body.generationConfig.responseModalities = ['TEXT', 'IMAGE'];
  }

  if (state.systemPrompt) {
    body.systemInstruction = { parts: [{ text: state.systemPrompt }] };
  }

  const reqBody = JSON.stringify(body);
  let r = await aiFetch(state, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: reqBody
  });
  if (!r.ok && (r.status === 401 || r.status === 403) && /^AQ\./i.test(apiKey)) {
    const vUrl = `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${state.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const vr = await aiFetch(state, vUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: reqBody
    }).catch(() => null);
    if (vr && vr.ok) r = vr;
  }
  const data = await r.json();

  if (!data.candidates || data.candidates.length === 0) {
    const errMsg = data.error?.message || 'پاسخی دریافت نشد (HTTP ' + (r.status || '?') + ')';
    if (data.error?.status === 'RESOURCE_EXHAUSTED' || r.status === 429 || errMsg.includes('429') || errMsg.includes('quota')) {
      const keyCount = getKeyCount('gemini');
      if (keyCount > 1) {
        rotateKey('gemini');
        throw new Error('⚠️ کلید #' + ((state.keyIndex.gemini || 0)) + ' محدود شد — سوییچ به کلید بعدی. دوباره امتحان کنید.');
      }
      throw new Error('⚠️ محدودیت رایگان Gemini تمام شد. راه‌حل:\n۱. کلید API جدید از aistudio.google.com بسازید\n۲. یا از OpenRouter (رایگان) استفاده کنید\n۳. یا از Pollinations برای تصویرسازی استفاده کنید');
    }
    throw new Error(errMsg);
  }

  const parts = data.candidates[0].content?.parts || [];
  let text = '';
  let imageData = null;

  for (const part of parts) {
    if (part.text) text += part.text;
    if (part.inlineData) {
      imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  return { text, imageData };
}

async function callOpenRouter({ state, chat, getCurrentKey, getKeyCount, rotateKey }) {
  const apiKey = getCurrentKey('openrouter');
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const messages = [];
  if (state.systemPrompt) messages.push({ role: 'system', content: state.systemPrompt });

  chat.messages.forEach(msg => {
    if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
      const content = [];
      msg.attachments.forEach(att => {
        content.push({ type: 'image_url', image_url: { url: att.data } });
      });
      if (msg.text) content.push({ type: 'text', text: msg.text });
      messages.push({ role: 'user', content });
    } else {
      messages.push({ role: msg.role, content: msg.text });
    }
  });

  const r = await aiFetch(state, url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'AI Chat Pro'
    },
    body: JSON.stringify({
      model: state.model,
      messages,
      temperature: state.temperature,
      max_tokens: state.maxTokens
    })
  });
  const data = await r.json();

  if (!data.choices || data.choices.length === 0) {
    const errMsg = data.error?.message || 'پاسخی دریافت نشد';
    if (r.status === 429 || errMsg.includes('429') || errMsg.includes('rate')) {
      const keyCount = getKeyCount('openrouter');
      if (keyCount > 1) { rotateKey('openrouter'); throw new Error('⚠️ کلید محدود شد — سوییچ به کلید بعدی. دوباره امتحان کنید.'); }
    }
    throw new Error(errMsg);
  }

  return { text: data.choices[0].message?.content || '' };
}

async function callGroq({ state, chat, getCurrentKey, getKeyCount, rotateKey }) {
  const apiKey = getCurrentKey('groq');
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const messages = [];
  if (state.systemPrompt) messages.push({ role: 'system', content: state.systemPrompt });

  chat.messages.forEach(msg => {
    messages.push({ role: msg.role, content: msg.text });
  });

  const r = await aiFetch(state, url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: state.model,
      messages,
      temperature: state.temperature,
      max_tokens: state.maxTokens
    })
  });
  const data = await r.json();

  if (!data.choices || data.choices.length === 0) {
    const errMsg = data.error?.message || 'پاسخی دریافت نشد';
    if (r.status === 429 || errMsg.includes('429') || errMsg.includes('rate')) {
      const keyCount = getKeyCount('groq');
      if (keyCount > 1) { rotateKey('groq'); throw new Error('⚠️ کلید محدود شد — سوییچ به کلید بعدی. دوباره امتحان کنید.'); }
    }
    throw new Error(errMsg);
  }

  return { text: data.choices[0].message?.content || '' };
}

async function callPollinations({ state, chat }) {
  const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  const prompt = lastUserMsg?.text || 'A beautiful landscape';
  const model = state.model || 'flux';
  const isEditModel = POLLINATIONS_EDIT_MODELS.includes(model);
  const hasImage = lastUserMsg?.attachments && lastUserMsg.attachments.length > 0;
  const pollKey = Array.isArray(state.apiKeys?.pollinations)
    ? (state.apiKeys.pollinations.find(k => k && k.trim()) || '')
    : (state.apiKeys?.pollinations || '');

  if (hasImage && (isEditModel || model === 'flux')) {
    const editModel = isEditModel ? model : 'kontext';
    const imgData = lastUserMsg.attachments[0].data;

    if (pollKey) {
      try {
        const apiUrl = 'https://gen.pollinations.ai/v1/images/edits';
        const formData = new FormData();
        const base64Data = imgData.split(',')[1];
        const byteChars = atob(base64Data);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteArray[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteArray], { type: 'image/png' });

        formData.append('image', blob, 'image.png');
        formData.append('prompt', prompt);
        formData.append('model', editModel);
        formData.append('size', '1024x1024');

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + pollKey },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data[0]) {
            const imgUrl = result.data[0].url;
            const imgResponse = await fetch(imgUrl);
            const imgBlob = await imgResponse.blob();
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve({
                text: '✏️ تصویر ویرایش شده با Pollinations (' + editModel + '): "' + prompt + '"',
                imageData: reader.result
              });
              reader.onerror = () => reject(new Error('تبدیل تصویر ناموفق بود'));
              reader.readAsDataURL(imgBlob);
            });
          }
        }

        const errData = await response.json().catch(() => ({}));
        if (errData.error?.message?.includes('balance') || errData.error?.message?.includes('pollen')) {
          throw new Error('BALANCE_ZERO');
        }
        throw new Error(errData.error?.message || 'HTTP ' + response.status);
      } catch (e) {
        if (e.message !== 'BALANCE_ZERO' && !e.message?.includes('Insufficient balance')) {
          throw e;
        }
      }
    }

    throw new Error(
      '⚠️ ویرایش تصویر با Pollinations نیاز به شارژ (pollen) داره.\n\n' +
      '✅ راه‌حل رایگان: از Gemini استفاده کن!\n' +
      '۱. API key از aistudio.google.com بگیر\n' +
      '۲. Provider رو به Gemini تغییر بده\n' +
      '۳. مدل gemini-3.1-flash-image یا gemini-3.8-flash انتخاب کن\n' +
      '۴. عکس + پرامپت بفرست\n\n' +
      '💰 یا Pollinations رو شارژ کن: enter.pollinations.ai'
    );
  }

  const encodedPrompt = encodeURIComponent(prompt);
  const imgUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${model}&nologo=true&seed=${Math.floor(Math.random()*999999)}`;

  const response = await pollinationsFetch(imgUrl);
  if (!response.ok) throw new Error('تولید تصویر ناموفق بود (HTTP ' + response.status + ')');

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve({
      text: '🎨 تصویر تولید شده با Pollinations: "' + prompt + '"\nمدل: ' + model,
      imageData: reader.result
    });
    reader.onerror = () => reject(new Error('تبدیل تصویر ناموفق بود'));
    reader.readAsDataURL(blob);
  });
}

async function callPuterImg({ state, chat }) {
  try {
    await loadPuterScript();
  } catch (e) {
    throw new Error('Puter SDK لود نشد: ' + e.message + '\n\n💡 راه‌حل: فایل رو با http://localhost باز کنید (نه file://)');
  }

  if (!window.puter || !window.puter.ai) {
    throw new Error('Puter SDK آماده نیست. صفحه رو رفرش کنید یا با http://localhost باز کنید.');
  }

  const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  const prompt = lastUserMsg?.text || 'A beautiful landscape';

  const modelMap = {
    'gpt-image-2': { provider: 'openai-image-generation', model: 'gpt-image-2' },
    'gpt-image-1': { provider: 'openai-image-generation', model: 'gpt-image-1' },
    'flux-2-pro': { provider: 'replicate-image-generation', model: 'black-forest-labs/flux-2-pro' },
    'flux-1.1-pro': { provider: 'replicate-image-generation', model: 'black-forest-labs/flux-1.1-pro' },
    'stable-diffusion-3': { provider: 'replicate-image-generation', model: 'stabilityai/stable-diffusion-3-medium' },
    'grok-imagine-image': { provider: 'xai', model: 'grok-imagine-image' },
    'dall-e-3': { provider: 'openai-image-generation', model: 'dall-e-3' }
  };
  const opts = modelMap[state.model] || modelMap['gpt-image-2'];

  const imgElement = await window.puter.ai.txt2img(prompt, {
    provider: opts.provider,
    model: opts.model
  });

  const canvas = document.createElement('canvas');
  canvas.width = imgElement.naturalWidth || imgElement.width;
  canvas.height = imgElement.naturalHeight || imgElement.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');

  return {
    text: '🎨 تصویر تولید شده: "' + prompt + '"',
    imageData: dataUrl
  };
}

