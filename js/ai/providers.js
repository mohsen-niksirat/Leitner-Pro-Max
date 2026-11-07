// ═══════════════════════════════════════════
// AI STUDIO PRO — Multi-Provider Gateway, Key-Pool Router & API Clients
// Supports 20+ Famous Built-in Providers, Custom Providers (OpenAI/Gemini/Anthropic),
// Manual & Remote Model Discovery, and Multi-Policy Key Rotation (Round-Robin, Failover, Least-Used, Random)
// ═══════════════════════════════════════════

export const ROTATION_POLICIES = Object.freeze([
  {
    id: 'round_robin',
    name: 'چرخش نوبتی (Round-Robin)',
    shortName: '🔄 راند-رابین',
    desc: 'هر درخواست به نوبت روی کلید بعدی ارسال می‌شود تا سقف محدودیت (RPM/RPD) در تعداد کلیدها ضرب شود.'
  },
  {
    id: 'failover',
    name: 'اولویت ترتیبی (Failover / Sticky)',
    shortName: '🛡️ اولویت ترتیبی',
    desc: 'همیشه از کلید اول استفاده می‌کند و فقط در صورت خطا یا محدودیت (429) به سراغ کلید بعدی می‌رود.'
  },
  {
    id: 'least_used',
    name: 'کم‌مصرف‌ترین کلید (Least-Used)',
    shortName: '⚖️ کم‌مصرف‌ترین',
    desc: 'کلیدی را انتخاب می‌کند که کمترین تعداد درخواست موفق را داشته تا سهمیه همه کلیدها متوازن مصرف شود.'
  },
  {
    id: 'random',
    name: 'توزیع تصادفی (Random)',
    shortName: '🎲 تصادفی',
    desc: 'در هر درخواست به صورت تصادفی یکی از کلیدهای سالم و خارج از استراحت (Cooldown) را انتخاب می‌کند.'
  }
]);

export const PROVIDERS = Object.freeze([
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '✦',
    category: 'featured',
    protocol: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'AIzaSy... / AQ.Ab8...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    badge: 'رایگان + تصویرساز'
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🔀',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'sk-or-v1-...',
    keyUrl: 'https://openrouter.ai/keys',
    badge: 'مدل‌های رایگان و پرچمدار'
  },
  {
    id: 'groq',
    name: 'Groq (فوق سریع)',
    icon: '⚡',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    badge: 'رایگان · LPU'
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    icon: '🟢',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'sk-proj-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    badge: 'GPT-5 / GPT-4.1 / o4'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    icon: '🧡',
    category: 'flagship',
    protocol: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'sk-ant-api03-...',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    badge: 'Claude 4 / 3.7 Sonnet'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🐋',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    requiresKey: true,
    supportsVision: false,
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    badge: 'DeepSeek V3 / R1'
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    icon: '𝕏',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.x.ai/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'xai-...',
    keyUrl: 'https://console.x.ai',
    badge: 'Grok 3 / Mini'
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    icon: '🧠',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://api.cerebras.ai/v1',
    requiresKey: true,
    supportsVision: false,
    keyPlaceholder: 'csk-...',
    keyUrl: 'https://cloud.cerebras.ai',
    badge: 'رایگان · ۲۲۰۰ توکن/ثانیه'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    icon: '🌊',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.mistral.ai/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: ' کلید Mistral...',
    keyUrl: 'https://console.mistral.ai/api-keys',
    badge: 'رایگان (La Plateforme)'
  },
  {
    id: 'sambanova',
    name: 'SambaNova',
    icon: '🔥',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://api.sambanova.ai/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'UUID کلید SambaNova...',
    keyUrl: 'https://cloud.sambanova.ai/apis',
    badge: 'رایگان · DeepSeek R1'
  },
  {
    id: 'github',
    name: 'GitHub Models',
    icon: '🐙',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://models.inference.ai.azure.com',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'ghp_... / github_pat_...',
    keyUrl: 'https://github.com/settings/tokens',
    badge: 'رایگان با اکانت گیت‌هاب'
  },
  {
    id: 'together',
    name: 'Together AI',
    icon: '🤝',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.together.xyz/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'tgp_v1_...',
    keyUrl: 'https://api.together.ai/settings/api-keys',
    badge: 'مدل‌های متن‌باز'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    icon: '🔮',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://api.cohere.ai/compatibility/v1',
    requiresKey: true,
    supportsVision: false,
    keyPlaceholder: 'کلید آزمایشی یا اصلی Cohere...',
    keyUrl: 'https://dashboard.cohere.com/api-keys',
    badge: 'رایگان · Command A'
  },
  {
    id: 'nvidia',
    name: 'NVIDIA NIM',
    icon: '💚',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'nvapi-...',
    keyUrl: 'https://build.nvidia.com',
    badge: 'رایگان · Nemotron'
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    icon: '🎆',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'fw_...',
    keyUrl: 'https://fireworks.ai/account/api-keys',
    badge: 'سریع و کم‌تاخیر'
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    icon: '🤗',
    category: 'featured',
    protocol: 'openai',
    baseUrl: 'https://router.huggingface.co/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'hf_...',
    keyUrl: 'https://huggingface.co/settings/tokens',
    badge: 'رایگان · Inference'
  },
  {
    id: 'alibaba',
    name: 'Alibaba Qwen',
    icon: '🏮',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
    requiresKey: true,
    supportsVision: true,
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://bailian.console.alibabacloud.com',
    badge: 'Qwen 3 / Max'
  },
  {
    id: 'kimi',
    name: 'Kimi (Moonshot)',
    icon: '🌙',
    category: 'flagship',
    protocol: 'openai',
    baseUrl: 'https://api.moonshot.ai/v1',
    requiresKey: true,
    supportsVision: false,
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.kimi.ai/console/keys',
    badge: 'Kimi K2'
  },
  {
    id: 'pollinations',
    name: 'Pollinations (تصویرساز)',
    icon: '🎨',
    category: 'image',
    protocol: 'pollinations',
    baseUrl: 'https://image.pollinations.ai',
    requiresKey: false,
    supportsVision: true,
    keyPlaceholder: 'pk_... (اختیاری برای ویرایش)',
    keyUrl: 'https://enter.pollinations.ai/keys',
    badge: 'تصویرساز رایگان بدون کلید'
  },
  {
    id: 'puter_img',
    name: 'Puter.js (تصویرساز)',
    icon: '🖼️',
    category: 'image',
    protocol: 'puter_img',
    baseUrl: 'https://js.puter.com/v2/',
    requiresKey: false,
    supportsVision: false,
    keyPlaceholder: 'نیازی به کلید ندارد',
    keyUrl: '',
    badge: 'تصویرساز رایگان مرورگر'
  }
]);

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
    'openai/gpt-4.1',
    'openai/o4-mini',
    'deepseek/deepseek-chat-v3.1',
    'qwen/qwen3.6-plus',
    'x-ai/grok-3',
    'google/gemini-3.1-flash-image',
    'google/gemini-3-pro-image',
    'openai/gpt-5-image'
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'deepseek-r1-distill-llama-70b',
    'qwen-qwq-32b',
    'qwen/qwen3.6-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'groq/compound',
    'groq/compound-mini',
    'gemma2-9b-it',
    'allam-2-7b'
  ],
  openai: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
    'o4-mini',
    'o3',
    'o3-mini',
    'gpt-5',
    'gpt-5-mini'
  ],
  anthropic: [
    'claude-sonnet-4-20250514',
    'claude-opus-4-20250514',
    'claude-3-7-sonnet-latest',
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
    'claude-3-opus-latest'
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-reasoner'
  ],
  xai: [
    'grok-3',
    'grok-3-mini',
    'grok-3-fast',
    'grok-2-vision-1212',
    'grok-2-1212'
  ],
  cerebras: [
    'llama-3.3-70b',
    'llama-4-scout-17b-16e-instruct',
    'llama3.1-8b',
    'qwen-3-32b',
    'deepseek-r1-distill-llama-70b'
  ],
  mistral: [
    'mistral-large-latest',
    'mistral-medium-latest',
    'mistral-small-latest',
    'codestral-latest',
    'pixtral-large-latest',
    'pixtral-12b-2409',
    'ministral-8b-latest'
  ],
  sambanova: [
    'Meta-Llama-3.3-70B-Instruct',
    'DeepSeek-R1',
    'DeepSeek-V3-0324',
    'Llama-4-Maverick-17B-128E-Instruct',
    'Qwen3-32B',
    'Meta-Llama-3.1-8B-Instruct'
  ],
  github: [
    'gpt-4o',
    'gpt-4o-mini',
    'o3-mini',
    'DeepSeek-R1',
    'Llama-3.3-70B-Instruct',
    'Mistral-large-2411',
    'Phi-4'
  ],
  together: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
    'deepseek-ai/DeepSeek-R1',
    'deepseek-ai/DeepSeek-V3',
    'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'Qwen/QwQ-32B'
  ],
  cohere: [
    'command-a-03-2025',
    'command-r-plus-08-2024',
    'command-r-08-2024',
    'command-r7b-12-2024',
    'c4ai-aya-expanse-32b'
  ],
  nvidia: [
    'nvidia/llama-3.1-nemotron-ultra-253b-v1',
    'deepseek-ai/deepseek-r1',
    'meta/llama-3.3-70b-instruct',
    'qwen/qwen2.5-coder-32b-instruct',
    'mistralai/mistral-large-2-instruct'
  ],
  fireworks: [
    'accounts/fireworks/models/deepseek-v3',
    'accounts/fireworks/models/deepseek-r1',
    'accounts/fireworks/models/llama-v3p3-70b-instruct',
    'accounts/fireworks/models/qwen2p5-72b-instruct'
  ],
  huggingface: [
    'Qwen/Qwen2.5-72B-Instruct',
    'meta-llama/Llama-3.3-70B-Instruct',
    'deepseek-ai/DeepSeek-R1',
    'mistralai/Mistral-Small-24B-Instruct-2501'
  ],
  alibaba: [
    'qwen-max',
    'qwen-plus',
    'qwen-turbo',
    'qwen-vl-max',
    'qwq-32b'
  ],
  kimi: [
    'kimi-k2-0711-preview',
    'moonshot-v1-128k',
    'moonshot-v1-32k',
    'moonshot-v1-8k'
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
  'openai/gpt-4.1': '💎 OpenAI GPT-4.1',
  'openai/o4-mini': '🧠 OpenAI o4-mini (استدلالی)',
  'deepseek/deepseek-chat-v3.1': '💎 DeepSeek V3.1',
  'qwen/qwen3.6-plus': '💎 Qwen 3.6 Plus',
  'x-ai/grok-3': '𝕏 Grok 3',
  'google/gemini-3.1-flash-image': '🖼️ Nano Banana 2 (تصویرساز)',
  'google/gemini-3-pro-image': '🖼️ Nano Banana Pro (تصویرساز)',
  'openai/gpt-5-image': '🖼️ GPT-5 Image (تصویرساز)',
  // Groq
  'llama-3.3-70b-versatile': '⚡ Llama 3.3 70B Versatile (1K req/day)',
  'llama-3.1-8b-instant': '⚡ Llama 3.1 8B Instant (14.4K req/day)',
  'openai/gpt-oss-120b': '🧠 GPT-OSS 120B (پرهوش)',
  'openai/gpt-oss-20b': '⚡ GPT-OSS 20B (سریع)',
  'qwen/qwen3.6-27b': '🌐 Qwen 3.6 27B (عالی برای فارسی)',
  'meta-llama/llama-4-maverick-17b-128e-instruct': '🦙 Llama 4 Maverick 17B 128E (ویژن)',
  'meta-llama/llama-4-scout-17b-16e-instruct': '🦙 Llama 4 Scout 17B 16E (ویژن)',
  'deepseek-r1-distill-llama-70b': '🐋 DeepSeek R1 Distill 70B (استدلالی)',
  'qwen-qwq-32b': '🧠 Qwen QwQ 32B (استدلالی)',
  'groq/compound': '🤖 Groq Compound (ایجنت هوشمند)',
  'groq/compound-mini': '🤖 Groq Compound Mini',
  'gemma2-9b-it': '⚡ Gemma 2 9B IT',
  'allam-2-7b': '🌙 Allam 2 7B (عربی/فارسی)',
  // OpenAI
  'gpt-4.1': '🟢 GPT-4.1 (پرچمدار دقیق)',
  'gpt-4.1-mini': '⚡ GPT-4.1 Mini (سریع و اقتصادی)',
  'gpt-4.1-nano': '⚡ GPT-4.1 Nano (فوق سریع)',
  'gpt-4o': '🟢 GPT-4o Omni (چندوجهی)',
  'gpt-4o-mini': '⚡ GPT-4o Mini',
  'o4-mini': '🧠 OpenAI o4-mini (استدلالی جدید)',
  'o3': '💎 OpenAI o3 (استدلال عمیق)',
  'o3-mini': '🧠 OpenAI o3-mini',
  'gpt-5': '💎 OpenAI GPT-5',
  'gpt-5-mini': '⚡ OpenAI GPT-5 Mini',
  // Anthropic
  'claude-sonnet-4-20250514': '🧡 Claude Sonnet 4 (جدیدترین)',
  'claude-opus-4-20250514': '💎 Claude Opus 4 (قدرتمندترین)',
  'claude-3-7-sonnet-latest': '🧡 Claude 3.7 Sonnet (Thinking)',
  'claude-3-5-sonnet-latest': '🧡 Claude 3.5 Sonnet',
  'claude-3-5-haiku-latest': '⚡ Claude 3.5 Haiku (سریع)',
  'claude-3-opus-latest': '💎 Claude 3 Opus',
  // DeepSeek
  'deepseek-chat': '🐋 DeepSeek V3 (چت و کدنویسی)',
  'deepseek-reasoner': '🧠 DeepSeek R1 (استدلال عمیق)',
  // xAI
  'grok-3': '𝕏 Grok 3 (پرچمدار xAI)',
  'grok-3-mini': '⚡ Grok 3 Mini (استدلالی سریع)',
  'grok-3-fast': '🚀 Grok 3 Fast',
  'grok-2-vision-1212': '👁️ Grok 2 Vision',
  'grok-2-1212': '𝕏 Grok 2',
  // Cerebras
  'llama-3.3-70b': '🧠 Llama 3.3 70B (Cerebras Ultra-Fast)',
  'llama-4-scout-17b-16e-instruct': '🦙 Llama 4 Scout 17B (Cerebras)',
  'llama3.1-8b': '⚡ Llama 3.1 8B (Cerebras)',
  'qwen-3-32b': '🌐 Qwen 3 32B (Cerebras)',
  // Mistral
  'mistral-large-latest': '🌊 Mistral Large 2 (پرچمدار)',
  'mistral-medium-latest': '🌊 Mistral Medium 3',
  'mistral-small-latest': '⚡ Mistral Small 3.1 (ویژن)',
  'codestral-latest': '💻 Codestral (تخصصی کد و ساختار)',
  'pixtral-large-latest': '👁️ Pixtral Large (ویژن)',
  'pixtral-12b-2409': '👁️ Pixtral 12B (ویژن رایگان)',
  'ministral-8b-latest': '⚡ Ministral 8B',
  // SambaNova
  'Meta-Llama-3.3-70B-Instruct': '🔥 Llama 3.3 70B (SambaNova)',
  'DeepSeek-R1': '🧠 DeepSeek R1 (استدلالی)',
  'DeepSeek-V3-0324': '🐋 DeepSeek V3 0324',
  'Llama-4-Maverick-17B-128E-Instruct': '🦙 Llama 4 Maverick 17B',
  'Qwen3-32B': '🌐 Qwen 3 32B',
  'Meta-Llama-3.1-8B-Instruct': '⚡ Llama 3.1 8B',
  // GitHub Models
  'Llama-3.3-70B-Instruct': '🐙 Llama 3.3 70B (GitHub)',
  'Mistral-large-2411': '🐙 Mistral Large 2411 (GitHub)',
  'Phi-4': '🐙 Microsoft Phi-4 (GitHub)',
  // Together
  'meta-llama/Llama-3.3-70B-Instruct-Turbo': '🤝 Llama 3.3 70B Turbo',
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8': '🦙 Llama 4 Maverick 17B FP8',
  'deepseek-ai/DeepSeek-R1': '🧠 DeepSeek R1',
  'deepseek-ai/DeepSeek-V3': '🐋 DeepSeek V3',
  'Qwen/Qwen2.5-72B-Instruct-Turbo': '🌐 Qwen 2.5 72B Turbo',
  'Qwen/QwQ-32B': '🧠 Qwen QwQ 32B',
  // Cohere
  'command-a-03-2025': '🔮 Command A (جدیدترین و قوی‌ترین مدل Cohere)',
  'command-r-plus-08-2024': '🔮 Command R+ (تحلیل و ترجمه دقیق)',
  'command-r-08-2024': '⚡ Command R',
  'command-r7b-12-2024': '⚡ Command R7B (سریع)',
  'c4ai-aya-expanse-32b': '🌍 Aya Expanse 32B (ویژه چندزبانه و فارسی)',
  // NVIDIA
  'nvidia/llama-3.1-nemotron-ultra-253b-v1': '💚 Nemotron Ultra 253B',
  'meta/llama-3.3-70b-instruct': '💚 Llama 3.3 70B (NVIDIA)',
  'qwen/qwen2.5-coder-32b-instruct': '💻 Qwen 2.5 Coder 32B',
  'mistralai/mistral-large-2-instruct': '🌊 Mistral Large 2 (NVIDIA)',
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

const DEFAULT_API_KEYS = Object.fromEntries(PROVIDERS.map(p => [p.id, ['']]));
const DEFAULT_KEY_INDEX = Object.fromEntries(PROVIDERS.map(p => [p.id, 0]));
const DEFAULT_USAGE_STATS = Object.fromEntries(PROVIDERS.map(p => [p.id, 0]));

export const DEFAULT_CHAT_STATE = {
  provider: 'gemini',
  model: 'gemini-3.8-flash',
  apiKeys: DEFAULT_API_KEYS,
  keyIndex: DEFAULT_KEY_INDEX,
  keyPolicy: 'round_robin', // 'round_robin' | 'failover' | 'least_used' | 'random'
  autoRetryOnFail: true,
  keyCooldownSec: 60,
  fallbackProvider: '',
  keyStats: {}, // { [providerId]: { [keyHashOrIdx]: { used: 0, errors: 0, cooldownUntil: 0, lastStatus: '' } } }
  customModels: {}, // { [providerId]: [{ id: 'model-id', label: 'Optional Label' }] }
  customProviders: [], // [{ id, name, icon, protocol, baseUrl, models: [], supportsVision: true, headers: {} }]
  systemPrompt: 'شما یک دستیار هوش مصنوعی و استاد زبان مفید و دقیق هستید. به فارسی پاسخ دهید مگر اینکه کاربر زبان دیگری بخواهد.',
  temperature: 0.7,
  maxTokens: 4096,
  dailyLimit: 500,
  dailyUsage: 0,
  dailyUsageDate: '',
  theme: 'dark',
  chats: [],
  activeChat: null,
  providerUsageStats: DEFAULT_USAGE_STATS,
  customProxy: { url: '', token: '' }
};

export const IMAGE_KEYWORDS = [
  'تصویر', 'عکس', 'نقاشی', 'generate image', 'create image', 'draw', 'paint',
  'تصویر بساز', 'عکس بساز', 'بکش', 'ویرایش عکس', 'ویرایش تصویر', 'edit image', 'edit photo'
];

export const POLLINATIONS_EDIT_MODELS = ['kontext', 'nanobanana', 'nanobanana-2', 'seedream', 'gptimage', 'klein'];

export function getAllProviders(state) {
  const custom = Array.isArray(state?.customProviders) ? state.customProviders.map(cp => ({
    id: cp.id,
    name: cp.name || cp.id,
    icon: cp.icon || '🛰️',
    category: 'custom',
    protocol: cp.protocol || 'openai',
    baseUrl: String(cp.baseUrl || '').trim(),
    requiresKey: cp.requiresKey !== false,
    supportsVision: cp.supportsVision !== false,
    keyPlaceholder: cp.keyPlaceholder || 'sk-... (کلید API)',
    keyUrl: cp.keyUrl || '',
    badge: 'سفارشی (' + (cp.protocol || 'OpenAI').toUpperCase() + ')',
    isCustom: true,
    models: Array.isArray(cp.models) ? cp.models : []
  })) : [];
  return [...PROVIDERS, ...custom];
}

export function getProviderMeta(state, providerId) {
  const all = getAllProviders(state);
  return all.find(p => p.id === providerId) || all[0];
}

export function getProviderModels(state, providerId) {
  const baseModels = Array.isArray(MODELS[providerId]) ? [...MODELS[providerId]] : [];
  const cp = Array.isArray(state?.customProviders)
    ? state.customProviders.find(p => p.id === providerId)
    : null;
  const cpModels = Array.isArray(cp?.models) ? cp.models : [];
  const userAddedRaw = Array.isArray(state?.customModels?.[providerId])
    ? state.customModels[providerId]
    : [];
  const userAddedIds = userAddedRaw
    .map(m => (typeof m === 'string' ? m.trim() : String(m?.id || '').trim()))
    .filter(Boolean);

  const merged = [];
  const seen = new Set();
  for (const m of [...userAddedIds, ...cpModels, ...baseModels]) {
    const clean = String(m || '').trim();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      merged.push(clean);
    }
  }
  return merged.length > 0 ? merged : ['default-model'];
}

export function getModelLabel(state, providerId, modelId) {
  const userAdded = Array.isArray(state?.customModels?.[providerId])
    ? state.customModels[providerId]
    : [];
  const foundCustom = userAdded.find(m => (typeof m === 'object' && m?.id === modelId));
  if (foundCustom && foundCustom.label) {
    return `✨ ${foundCustom.label} (${modelId})`;
  }
  if (userAdded.some(m => (typeof m === 'string' ? m === modelId : m?.id === modelId))) {
    return `✨ ${modelId} (دستی)`;
  }
  return MODEL_LABELS[modelId] || modelId;
}

export function hasProviderKey(provider) {
  const keys = window.state?.apiKeys?.[provider];
  return Array.isArray(keys) ? keys.some((key) => String(key).trim()) : Boolean(keys);
}

// ── Key Pool & Policy Selection Helpers ──
export function maskKey(key) {
  const clean = String(key || '').trim();
  if (!clean) return 'Empty';
  if (clean.length <= 10) return clean.slice(0, 3) + '***';
  return clean.slice(0, 6) + '••••' + clean.slice(-4);
}

export function ensureProviderKeyStats(state, providerId) {
  if (!state.keyStats || typeof state.keyStats !== 'object') state.keyStats = {};
  if (!state.keyStats[providerId] || typeof state.keyStats[providerId] !== 'object') {
    state.keyStats[providerId] = {};
  }
  return state.keyStats[providerId];
}

export function getKeyMetric(state, providerId, key) {
  const clean = String(key || '').trim();
  if (!clean) return { used: 0, errors: 0, cooldownUntil: 0, lastStatus: '' };
  const pStats = ensureProviderKeyStats(state, providerId);
  if (!pStats[clean]) {
    pStats[clean] = { used: 0, errors: 0, cooldownUntil: 0, lastStatus: '' };
  }
  return pStats[clean];
}

export function isKeyInCooldown(state, providerId, key) {
  const metric = getKeyMetric(state, providerId, key);
  return Boolean(metric.cooldownUntil && metric.cooldownUntil > Date.now());
}

/**
 * Selects the next API key for `providerId` according to `state.keyPolicy`:
 * - 'round_robin': cycles through healthy keys in order
 * - 'failover': always picks the first healthy key in priority order
 * - 'least_used': picks the healthy key with the lowest `used` count
 * - 'random': picks a random healthy key
 * If all keys are currently in cooldown, picks the one whose cooldown expires soonest.
 */
export function selectKeyFromPool(state, providerId, excludeKeys = new Set()) {
  const rawKeys = state?.apiKeys?.[providerId];
  const validEntries = [];
  if (Array.isArray(rawKeys)) {
    rawKeys.forEach((k, idx) => {
      const clean = String(k || '').trim();
      if (clean && !excludeKeys.has(clean)) {
        validEntries.push({ key: clean, index: idx, metric: getKeyMetric(state, providerId, clean) });
      }
    });
  } else if (typeof rawKeys === 'string' && rawKeys.trim()) {
    const clean = rawKeys.trim();
    if (!excludeKeys.has(clean)) {
      validEntries.push({ key: clean, index: 0, metric: getKeyMetric(state, providerId, clean) });
    }
  }

  if (validEntries.length === 0) return { key: '', index: 0, totalValid: 0 };

  const now = Date.now();
  const healthy = validEntries.filter(e => !e.metric.cooldownUntil || e.metric.cooldownUntil <= now);
  const candidates = healthy.length > 0
    ? healthy
    : [...validEntries].sort((a, b) => (a.metric.cooldownUntil || 0) - (b.metric.cooldownUntil || 0));

  const policy = state?.keyPolicy || 'round_robin';
  let chosen = candidates[0];

  if (policy === 'failover') {
    chosen = candidates[0];
  } else if (policy === 'random') {
    chosen = candidates[Math.floor(Math.random() * candidates.length)];
  } else if (policy === 'least_used') {
    chosen = [...candidates].sort((a, b) => (a.metric.used || 0) - (b.metric.used || 0))[0];
  } else {
    // 'round_robin' (default)
    const ptr = Number(state?.keyIndex?.[providerId] || 0);
    chosen = candidates[ptr % candidates.length];
  }

  return { key: chosen.key, index: chosen.index, totalValid: validEntries.length };
}

export function recordKeySuccess(state, providerId, key) {
  if (!key) return;
  const metric = getKeyMetric(state, providerId, key);
  metric.used = (metric.used || 0) + 1;
  metric.cooldownUntil = 0;
  metric.lastStatus = 'ok';
  metric.lastUsedAt = Date.now();
  // In round-robin mode, advance pointer after every request so next call uses next key!
  const validCount = (Array.isArray(state?.apiKeys?.[providerId]) ? state.apiKeys[providerId] : [])
    .filter(k => k && String(k).trim()).length;
  if ((state?.keyPolicy || 'round_robin') === 'round_robin' && validCount > 1) {
    state.keyIndex[providerId] = ((state.keyIndex[providerId] || 0) + 1) % validCount;
  }
}

export function recordKeyFailure(state, providerId, key, statusCode = 429, errorMessage = '') {
  if (!key) return;
  const metric = getKeyMetric(state, providerId, key);
  metric.errors = (metric.errors || 0) + 1;
  const cooldownSec = Math.max(5, Number(state?.keyCooldownSec) || 60);
  const isRateOrAuth = statusCode === 429 || statusCode === 401 || statusCode === 403 || statusCode >= 500 || /429|quota|rate|exhausted|balance|credit/i.test(errorMessage);
  if (isRateOrAuth) {
    metric.cooldownUntil = Date.now() + cooldownSec * 1000;
  }
  metric.lastStatus = `err:${statusCode || 'fail'}`;
  const validCount = (Array.isArray(state?.apiKeys?.[providerId]) ? state.apiKeys[providerId] : [])
    .filter(k => k && String(k).trim()).length;
  if (validCount > 1) {
    state.keyIndex[providerId] = ((state.keyIndex[providerId] || 0) + 1) % validCount;
  }
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
  const hasCredential = /[?&]key=/.test(url) || Object.keys(headers).some(k => ['authorization', 'x-api-key'].includes(k.toLowerCase()));
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
        if (body && (body.error || body.candidates || body.choices || body.content)) {
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
        await new Promise(res => setTimeout(res, 2000 * (i + 1)));
        continue;
      }
      throw new Error('HTTP ' + r.status);
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(res => setTimeout(res, 2000 * (i + 1)));
    }
  }
}

export function hasImageAttachment(chat) {
  const lastMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  return Boolean(lastMsg?.attachments && lastMsg.attachments.length > 0);
}

export function resolveOpenAIChatEndpoint(baseUrl) {
  const raw = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!raw) return 'https://api.openai.com/v1/chat/completions';
  if (/\/chat\/completions$/i.test(raw)) return raw;
  return raw + '/chat/completions';
}

export function resolveOpenAIModelsEndpoint(baseUrl) {
  const raw = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!raw) return 'https://api.openai.com/v1/models';
  const stripped = raw.replace(/\/chat\/completions$/i, '');
  if (/\/models$/i.test(stripped)) return stripped;
  return stripped + '/models';
}

export function resolveAnthropicEndpoint(baseUrl) {
  const raw = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!raw) return 'https://api.anthropic.com/v1/messages';
  if (/\/messages$/i.test(raw)) return raw;
  if (/\/v1$/i.test(raw)) return raw + '/messages';
  return raw + '/v1/messages';
}

/**
 * Fetches available models from a provider's remote API (`/models` or Gemini `v1beta/models`).
 */
export async function fetchRemoteModels(state, providerId, overrideKey = '', overrideBaseUrl = '', overrideProtocol = '') {
  const meta = getProviderMeta(state, providerId);
  const protocol = overrideProtocol || meta?.protocol || 'openai';
  const baseUrl = (overrideBaseUrl || meta?.baseUrl || '').trim().replace(/\/+$/, '');
  const { key: poolKey } = selectKeyFromPool(state, providerId);
  const apiKey = String(overrideKey || poolKey || '').trim();

  if (protocol === 'gemini') {
    if (!apiKey) throw new Error('ابتدا کلید API Gemini را وارد کنید.');
    const root = baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    const url = `${root}/models?key=${encodeURIComponent(apiKey)}`;
    const r = await aiFetch(state, url, { method: 'GET' });
    const data = await r.json();
    if (!Array.isArray(data.models)) {
      throw new Error(data.error?.message || 'لیست مدل‌ها از Gemini دریافت نشد.');
    }
    return data.models
      .map(m => String(m.name || '').replace(/^models\//, ''))
      .filter(Boolean);
  }

  if (protocol === 'anthropic') {
    if (!apiKey) throw new Error('ابتدا کلید API Anthropic را وارد کنید.');
    const root = baseUrl.replace(/\/messages$/i, '') || 'https://api.anthropic.com/v1';
    const r = await aiFetch(state, `${root}/models`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    });
    const data = await r.json();
    if (Array.isArray(data.data)) {
      return data.data.map(m => m.id).filter(Boolean);
    }
    return MODELS.anthropic || [];
  }

  const modelsUrl = resolveOpenAIModelsEndpoint(baseUrl);
  const headers = {};
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
  const r = await aiFetch(state, modelsUrl, { method: 'GET', headers });
  const data = await r.json();
  const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data?.models) ? data.models : []);
  if (!list.length) {
    throw new Error(data?.error?.message || 'لیست مدل‌ها از سرور دریافت نشد.');
  }
  return list.map(m => (typeof m === 'string' ? m : m?.id || m?.name)).filter(Boolean);
}

/**
 * High-resilience dispatcher with Key-Pool Policy routing, transparent per-key retry on 429/quota,
 * and optional cross-provider fallback.
 */
export async function callProviderAPI({ state, chat, wantsImage, getCurrentKey, getKeyCount, rotateKey, targetProviderId, targetModel }) {
  const providerId = targetProviderId || state.provider;
  const meta = getProviderMeta(state, providerId);
  const model = targetModel || state.model || getProviderModels(state, providerId)[0];
  const protocol = meta?.protocol || 'openai';

  if (protocol === 'pollinations' || providerId === 'pollinations') {
    return callPollinations({ state, chat, model });
  }
  if (protocol === 'puter_img' || providerId === 'puter_img') {
    return callPuterImg({ state, chat, model });
  }

  // Determine how many keys we can try if autoRetryOnFail is enabled
  const rawKeys = Array.isArray(state?.apiKeys?.[providerId])
    ? state.apiKeys[providerId].map(k => String(k || '').trim()).filter(Boolean)
    : [];
  const maxAttempts = state?.autoRetryOnFail !== false && rawKeys.length > 1 ? rawKeys.length : 1;
  const triedKeys = new Set();
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selected = selectKeyFromPool(state, providerId, triedKeys);
    const apiKey = selected.key || (typeof getCurrentKey === 'function' ? getCurrentKey(providerId) : '');
    if (apiKey) triedKeys.add(apiKey);

    try {
      let result;
      if (protocol === 'gemini' || providerId === 'gemini') {
        result = await callGeminiSingle({ state, chat, wantsImage, apiKey, model, baseUrl: meta?.baseUrl });
      } else if (protocol === 'anthropic' || providerId === 'anthropic') {
        result = await callAnthropicSingle({ state, chat, apiKey, model, baseUrl: meta?.baseUrl });
      } else {
        result = await callOpenAICompatibleSingle({
          state,
          chat,
          apiKey,
          model,
          providerId,
          baseUrl: meta?.baseUrl,
          supportsVision: meta?.supportsVision !== false
        });
      }
      recordKeySuccess(state, providerId, apiKey);
      return {
        ...result,
        usedProvider: providerId,
        usedModel: model,
        usedKeyIndex: selected.index + 1,
        retriedCount: attempt
      };
    } catch (err) {
      lastError = err;
      const status = err.statusCode || 0;
      const isRetryable = status === 429 || status === 401 || status === 403 || status >= 500 ||
        /429|quota|rate|exhausted|limit|balance|credit/i.test(err.message || '');
      recordKeyFailure(state, providerId, apiKey, status || 429, err.message);
      if (typeof rotateKey === 'function' && !isRetryable) {
        // Keep legacy rotateKey hook compatible
      }
      if (!isRetryable || attempt + 1 >= maxAttempts) {
        break;
      }
    }
  }

  // Optional cross-provider fallback if configured and not already in fallback
  const fbProvider = String(state?.fallbackProvider || '').trim();
  if (!targetProviderId && fbProvider && fbProvider !== providerId) {
    const fbKeys = Array.isArray(state?.apiKeys?.[fbProvider])
      ? state.apiKeys[fbProvider].filter(k => k && String(k).trim())
      : [];
    const fbMeta = getProviderMeta(state, fbProvider);
    if (fbKeys.length > 0 || !fbMeta?.requiresKey) {
      const fbModel = getProviderModels(state, fbProvider)[0];
      try {
        const fbRes = await callProviderAPI({
          state,
          chat,
          wantsImage,
          getCurrentKey,
          getKeyCount,
          rotateKey,
          targetProviderId: fbProvider,
          targetModel: fbModel
        });
        return {
          ...fbRes,
          text: `${fbRes.text}\n\n---\n💡 *پاسخ از ارائه‌دهنده پشتیبان (${fbMeta.name} · ${fbModel}) به دلیل محدودیت کلیدهای ${meta.name}*`
        };
      } catch {}
    }
  }

  throw lastError || new Error('خطا در دریافت پاسخ از ارائه‌دهنده');
}

async function callGeminiSingle({ state, chat, wantsImage, apiKey, model, baseUrl }) {
  const root = String(baseUrl || 'https://generativelanguage.googleapis.com/v1beta').trim().replace(/\/+$/, '');
  const url = `${root}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

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

  const supportsImage = model.includes('gemini-2.5') || model.includes('gemini-3') || model.includes('image');
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
    const vUrl = `https://aiplatform.googleapis.com/v1beta1/publishers/google/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
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
    const err = new Error(errMsg);
    err.statusCode = r.status || (data.error?.status === 'RESOURCE_EXHAUSTED' ? 429 : 400);
    throw err;
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

async function callOpenAICompatibleSingle({ state, chat, apiKey, model, providerId, baseUrl, supportsVision }) {
  const endpoint = resolveOpenAIChatEndpoint(baseUrl);

  const messages = [];
  if (state.systemPrompt) messages.push({ role: 'system', content: state.systemPrompt });

  chat.messages.forEach(msg => {
    if (supportsVision && msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
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

  const headers = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  if (providerId === 'openrouter' || endpoint.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = typeof window !== 'undefined' ? window.location.href : 'https://leitner-pro.app';
    headers['X-Title'] = 'Leitner Pro Max AI Studio';
  }

  const payload = {
    model,
    messages,
    temperature: state.temperature
  };
  // OpenAI o1/o3/o4 models prefer max_completion_tokens or omit max_tokens
  if (/^o[134](-|$)/i.test(model)) {
    payload.max_completion_tokens = state.maxTokens;
  } else {
    payload.max_tokens = state.maxTokens;
  }

  const r = await aiFetch(state, endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });
  const data = await r.json();

  if (!data.choices || data.choices.length === 0) {
    const errMsg = data.error?.message || (typeof data.error === 'string' ? data.error : 'پاسخی دریافت نشد (HTTP ' + (r.status || '?') + ')');
    const err = new Error(errMsg);
    err.statusCode = r.status || 400;
    throw err;
  }

  const choiceMsg = data.choices[0].message || {};
  let text = choiceMsg.content || '';
  if (choiceMsg.reasoning_content) {
    text = `💭 **استدلال مدل:**\n${choiceMsg.reasoning_content}\n\n---\n\n${text}`;
  }
  return { text };
}

async function callAnthropicSingle({ state, chat, apiKey, model, baseUrl }) {
  const endpoint = resolveAnthropicEndpoint(baseUrl);
  const messages = [];

  chat.messages.forEach(msg => {
    if (msg.role === 'user' && msg.attachments && msg.attachments.length > 0) {
      const content = [];
      msg.attachments.forEach(att => {
        const base64 = (att.data || '').split(',')[1] || '';
        if (base64) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: att.type || 'image/png',
              data: base64
            }
          });
        }
      });
      if (msg.text) content.push({ type: 'text', text: msg.text });
      messages.push({ role: 'user', content });
    } else if (msg.text) {
      messages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content: msg.text });
    }
  });

  const payload = {
    model,
    max_tokens: state.maxTokens || 4096,
    temperature: Math.min(1, state.temperature ?? 0.7),
    messages
  };
  if (state.systemPrompt) {
    payload.system = state.systemPrompt;
  }

  const r = await aiFetch(state, endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(payload)
  });
  const data = await r.json();

  if (data.error || !Array.isArray(data.content)) {
    const errMsg = data.error?.message || 'پاسخی از Anthropic دریافت نشد';
    const err = new Error(errMsg);
    err.statusCode = r.status || 400;
    throw err;
  }

  const text = data.content
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n');
  return { text };
}

async function callPollinations({ state, chat, model: targetModel }) {
  const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  const prompt = lastUserMsg?.text || 'A beautiful landscape';
  const model = targetModel || state.model || 'flux';
  const isEditModel = POLLINATIONS_EDIT_MODELS.includes(model);
  const hasImage = lastUserMsg?.attachments && lastUserMsg.attachments.length > 0;
  const { key: pollKey } = selectKeyFromPool(state, 'pollinations');

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

async function callPuterImg({ state, chat, model: targetModel }) {
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
  const modelKey = targetModel || state.model || 'gpt-image-2';

  const modelMap = {
    'gpt-image-2': { provider: 'openai-image-generation', model: 'gpt-image-2' },
    'gpt-image-1': { provider: 'openai-image-generation', model: 'gpt-image-1' },
    'flux-2-pro': { provider: 'replicate-image-generation', model: 'black-forest-labs/flux-2-pro' },
    'flux-1.1-pro': { provider: 'replicate-image-generation', model: 'black-forest-labs/flux-1.1-pro' },
    'stable-diffusion-3': { provider: 'replicate-image-generation', model: 'stabilityai/stable-diffusion-3-medium' },
    'grok-imagine-image': { provider: 'xai', model: 'grok-imagine-image' },
    'dall-e-3': { provider: 'openai-image-generation', model: 'dall-e-3' }
  };
  const opts = modelMap[modelKey] || modelMap['gpt-image-2'];

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
