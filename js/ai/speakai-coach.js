// ═══════════════════════════════════════════
// SPEAKAI COACH — Integrated Real-Time Voice Partner Tab
// Automatically loads live online GitHub Pages deployment:
// https://mohsen-niksirat.github.io/SpeakAI-Coach/
// ═══════════════════════════════════════════
import { idbGet } from '../storage/indexeddb.js';
import { S, save } from '../storage/state.js';
import { createCard, rebuildIndex, wordExists } from '../vocabulary/vocabulary.js';
import { toast, trackWordAdded } from '../ui/toast.js';

const SPEAKAI_ONLINE_URL = 'https://mohsen-niksirat.github.io/SpeakAI-Coach/';
const SPEAKAI_LOCAL_FALLBACK = './speakai/index.html';
const SPEAKAI_PROVIDERS_KEY = 'speakai_providers';
const SPEAKAI_VOCAB_KEY = 'speakai_vocab';
let _messageListenerBound = false;
let _latestSyncedVocab = [];

function resolveSpeakAiUrl() {
  if (typeof navigator !== 'undefined') {
    // Use local bundle only when offline or inside headless Playwright runner
    if (navigator.onLine === false || navigator.webdriver === true) {
      return SPEAKAI_LOCAL_FALLBACK;
    }
  }
  return SPEAKAI_ONLINE_URL;
}

function importSpeakAiCardsToLeitner(rawCards) {
  if (!Array.isArray(rawCards) || rawCards.length === 0) {
    toast('هنوز واژه‌ای در جلسه مکالمه ثبت نشده است.', 'warning');
    return 0;
  }

  let addedCount = 0;
  let skippedCount = 0;

  for (const item of rawCards) {
    const word = String(item?.word || '').trim();
    if (!word) continue;
    if (wordExists(word)) {
      skippedCount++;
      continue;
    }
    const def = String(item?.definition || '').trim();
    const ctx = String(item?.contextSentence || '').trim();
    const phonetic = String(item?.phonetic || '').trim();

    const card = createCard({
      word,
      translation: def,
      phonetic: phonetic ? `/${phonetic.replace(/^\/+|\/+$/g, '')}/` : '',
      definitions: def ? [def] : [],
      examples: ctx ? [ctx] : [],
      tags: ['speakai', 'speaking']
    });
    S.words.unshift(card);
    trackWordAdded();
    addedCount++;
  }

  if (addedCount > 0) {
    rebuildIndex();
    save();
    toast(
      `✅ ${addedCount} واژه جدید از مربی مکالمه به کتابخانه لایتنر اضافه شد` +
        (skippedCount > 0 ? ` (${skippedCount} تکراری نادیده گرفته شد)` : ''),
      'success'
    );
  } else {
    toast('همه واژگان این مکالمه قبلاً در کتابخانه لایتنر موجود هستند.', 'info');
  }

  updateSpeakAiVocabBadge();
  return addedCount;
}

function cleanToken(raw) {
  return String(raw || '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
    .trim()
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/^Bearer\s+/i, '')
    .trim();
}

async function syncAiKeysToSpeakAi(notifyUser = false) {
  try {
    const aiChat = await idbGet('ai_chat');
    const apiKeys = aiChat?.apiKeys || {};
    const geminiKeys = (Array.isArray(apiKeys.gemini) ? apiKeys.gemini : [])
      .map(cleanToken)
      .filter(k => k.startsWith('AIza'));
    const openrouterKeys = (Array.isArray(apiKeys.openrouter) ? apiKeys.openrouter : [])
      .map(cleanToken)
      .filter(Boolean);
    const groqKeys = (Array.isArray(apiKeys.groq) ? apiKeys.groq : [])
      .map(cleanToken)
      .filter(Boolean);

    if (!geminiKeys.length && !openrouterKeys.length && !groqKeys.length) {
      if (notifyUser) {
        toast('توکنی در بخش «هوش مصنوعی» پیدا نشد؛ می‌توانید مستقیماً داخل تنظیمات مربی مکالمه توکن وارد کنید.', 'warning');
      }
      return false;
    }

    let current = { providers: [], voiceProviderId: null, reportProviderId: null };
    try {
      const raw = localStorage.getItem(SPEAKAI_PROVIDERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.providers)) current = parsed;
      }
    } catch {}

    const upsertProvider = (id, name, kind, baseUrl, model, reportModel, keys) => {
      if (!keys.length) return;
      const existing = current.providers.find(p => p.id === id || (p.kind === kind && p.baseUrl === baseUrl));
      if (existing) {
        const merged = Array.from(new Set([...(existing.keys || []).map(cleanToken).filter(Boolean), ...keys]));
        existing.keys = id === 'prov-leitner-gemini' ? merged.filter(k => k.startsWith('AIza')) : merged;
        if (
          baseUrl.includes('openrouter.ai') &&
          (existing.model === 'meta-llama/llama-3.3-70b-instruct:free' ||
            existing.model === 'deepseek/deepseek-chat-v3-0324:free' ||
            existing.model === 'google/gemini-2.0-flash-exp:free')
        ) {
          existing.model = model;
          existing.reportModel = reportModel;
        }
      } else {
        current.providers.push({
          id,
          name,
          kind,
          baseUrl,
          model,
          reportModel,
          keys,
          keyIndex: 0
        });
      }
    };

    upsertProvider(
      'prov-leitner-gemini',
      'Google Gemini',
      'gemini-live',
      'https://generativelanguage.googleapis.com',
      'gemini-2.5-flash-native-audio-latest',
      'gemini-2.5-flash',
      geminiKeys
    );
    upsertProvider(
      'prov-leitner-groq',
      'Groq',
      'openai-chat',
      'https://api.groq.com/openai/v1',
      'llama-3.3-70b-versatile',
      'llama-3.3-70b-versatile',
      groqKeys
    );
    upsertProvider(
      'prov-leitner-openrouter',
      'OpenRouter',
      'openai-chat',
      'https://openrouter.ai/api/v1',
      'openrouter/free',
      'openrouter/free',
      openrouterKeys
    );

    if (!current.voiceProviderId || !current.providers.some(p => p.id === current.voiceProviderId)) {
      current.voiceProviderId = current.providers[0]?.id ?? null;
    }
    if (!current.reportProviderId || !current.providers.some(p => p.id === current.reportProviderId)) {
      current.reportProviderId = current.providers[0]?.id ?? null;
    }

    localStorage.setItem(SPEAKAI_PROVIDERS_KEY, JSON.stringify(current));
    localStorage.setItem('speakai_onboarded', '1');

    const frame = document.getElementById('speakAiFrame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'LEITNER_SYNC_PROVIDERS', settings: current }, '*');
    }

    if (notifyUser) {
      toast('✅ توکن‌های هوش مصنوعی با موفقیت به مربی مکالمه منتقل شدند!', 'success');
    }
    return true;
  } catch (err) {
    console.warn('[SpeakAI Sync]', err);
    return false;
  }
}

function getSpeakAiSavedCards() {
  try {
    const raw = localStorage.getItem(SPEAKAI_VOCAB_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return _latestSyncedVocab;
}

function updateSpeakAiVocabBadge() {
  const badge = document.getElementById('speakAiVocabCount');
  if (!badge) return;
  const cards = getSpeakAiSavedCards();
  badge.textContent = String(cards.length);
}

function ensureMessageBridge() {
  if (_messageListenerBound || typeof window === 'undefined') return;
  _messageListenerBound = true;
  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === 'SPEAKAI_IMPORT_TO_LEITNER' && Array.isArray(e.data.cards)) {
      _latestSyncedVocab = e.data.cards;
      importSpeakAiCardsToLeitner(e.data.cards);
    } else if (e.data.type === 'SPEAKAI_VOCAB_SYNC' && Array.isArray(e.data.cards)) {
      _latestSyncedVocab = e.data.cards;
      try {
        localStorage.setItem(SPEAKAI_VOCAB_KEY, JSON.stringify(e.data.cards));
      } catch {}
      updateSpeakAiVocabBadge();
    }
  });
}

export function renderSpeakAi(c) {
  ensureMessageBridge();

  try {
    if (!localStorage.getItem('speakai_lang')) {
      localStorage.setItem('speakai_lang', 'fa');
    }
  } catch {}

  const savedCards = getSpeakAiSavedCards();
  const targetUrl = resolveSpeakAiUrl();

  c.innerHTML = `
    <div class="card" style="padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:linear-gradient(135deg,rgba(108,92,231,0.12),rgba(16,185,129,0.06));border:1px solid rgba(108,92,231,0.25)">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.35rem">🎙️</span>
        <div>
          <div style="font-weight:700;font-size:.92rem;color:var(--text)">مربی مکالمه صوتی هوشمند (SpeakAI Coach — نسخه آنلاین خودکار)</div>
          <div style="font-size:.75rem;color:var(--text2)">متصل به مخزن آنلاین SpeakAI-Coach • دریافت خودکار آخرین آپدیت‌ها، شدویینگ و استخراج لغات به لایتنر</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn btn-ghost btn-sm" id="syncSpeakAiKeysBtn" title="انتقال خودکار کلیدهای Gemini / Groq / OpenRouter از بخش هوش مصنوعی">
          🔑 همگام‌سازی توکن‌ها
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="importSpeakAiVocabBtn" title="افزودن مستقیم واژگان کشف‌شده در مکالمه به کتابخانه لایتنر">
          📥 افزودن واژگان مکالمه به لایتنر (<span id="speakAiVocabCount">${savedCards.length}</span>)
        </button>
        <a href="${SPEAKAI_ONLINE_URL}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="text-decoration:none" title="باز کردن صفحه رسمی گیت‌هاب SpeakAI Coach در تب مستقل">
          ↗️ تمام‌صفحه
        </a>
      </div>
    </div>
    <div style="width:100%;height:calc(100vh - 175px);min-height:660px;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:#0b0f19;box-shadow:0 12px 32px rgba(0,0,0,0.28)">
      <iframe
        id="speakAiFrame"
        src="${targetUrl}"
        title="SpeakAI Coach — مربی مکالمه هوشمند"
        allow="microphone; autoplay; clipboard-write"
        style="width:100%;height:100%;border:0;display:block;background:#0b0f19"
      ></iframe>
    </div>
  `;

  const frame = document.getElementById('speakAiFrame');
  if (frame) {
    frame.addEventListener('load', () => {
      syncAiKeysToSpeakAi(false);
    });
  }

  document.getElementById('syncSpeakAiKeysBtn')?.addEventListener('click', () => {
    syncAiKeysToSpeakAi(true);
  });

  document.getElementById('importSpeakAiVocabBtn')?.addEventListener('click', () => {
    const cards = getSpeakAiSavedCards();
    importSpeakAiCardsToLeitner(cards);
  });

  syncAiKeysToSpeakAi(false);
}
