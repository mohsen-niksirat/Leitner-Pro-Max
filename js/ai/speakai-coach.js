// ═══════════════════════════════════════════
// SPEAKAI COACH — Integrated Real-Time Voice Partner Tab
// ═══════════════════════════════════════════
import { idbGet } from '../storage/indexeddb.js';
import { S, save } from '../storage/state.js';
import { createCard, rebuildIndex, wordExists } from '../vocabulary/vocabulary.js';
import { toast, trackWordAdded } from '../ui/toast.js';

const SPEAKAI_PROVIDERS_KEY = 'speakai_providers';
const SPEAKAI_VOCAB_KEY = 'speakai_vocab';
let _messageListenerBound = false;

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

async function syncAiKeysToSpeakAi(notifyUser = false) {
  try {
    const aiChat = await idbGet('ai_chat');
    const apiKeys = aiChat?.apiKeys || {};
    const geminiKeys = (Array.isArray(apiKeys.gemini) ? apiKeys.gemini : []).map(k => String(k || '').trim()).filter(Boolean);
    const openrouterKeys = (Array.isArray(apiKeys.openrouter) ? apiKeys.openrouter : []).map(k => String(k || '').trim()).filter(Boolean);
    const groqKeys = (Array.isArray(apiKeys.groq) ? apiKeys.groq : []).map(k => String(k || '').trim()).filter(Boolean);

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

    if (!notifyUser && current.providers.length > 0) {
      return false;
    }

    const upsertProvider = (id, name, kind, baseUrl, model, reportModel, keys) => {
      if (!keys.length) return;
      const existing = current.providers.find(p => p.kind === kind && p.baseUrl === baseUrl);
      if (existing) {
        const merged = Array.from(new Set([...(existing.keys || []), ...keys]));
        existing.keys = merged;
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
      'google/gemini-2.5-flash',
      'google/gemini-2.5-flash',
      openrouterKeys
    );

    if (!current.voiceProviderId && current.providers.length > 0) {
      current.voiceProviderId = current.providers[0].id;
    }
    if (!current.reportProviderId && current.providers.length > 0) {
      current.reportProviderId = current.providers[0].id;
    }

    localStorage.setItem(SPEAKAI_PROVIDERS_KEY, JSON.stringify(current));
    localStorage.setItem('speakai_onboarded', '1');

    const frame = document.getElementById('speakAiFrame');
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'LEITNER_SYNC_PROVIDERS' }, '*');
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
      importSpeakAiCardsToLeitner(e.data.cards);
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

  c.innerHTML = `
    <div class="card" style="padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;background:linear-gradient(135deg,rgba(108,92,231,0.12),rgba(16,185,129,0.06));border:1px solid rgba(108,92,231,0.25)">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:1.35rem">🎙️</span>
        <div>
          <div style="font-weight:700;font-size:.92rem;color:var(--text)">مربی مکالمه صوتی هوشمند (SpeakAI Coach)</div>
          <div style="font-size:.75rem;color:var(--text2)">شبیه‌ساز آیلتس، مصاحبه شغلی و مکالمه آزاد با استخراج خودکار لغات به جعبه لایتنر</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <button type="button" class="btn btn-ghost btn-sm" id="syncSpeakAiKeysBtn" title="انتقال خودکار کلیدهای Gemini / Groq / OpenRouter از بخش هوش مصنوعی">
          🔑 همگام‌سازی توکن‌ها
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="importSpeakAiVocabBtn" title="افزودن مستقیم واژگان کشف‌شده در مکالمه به کتابخانه لایتنر">
          📥 افزودن واژگان مکالمه به لایتنر (<span id="speakAiVocabCount">${savedCards.length}</span>)
        </button>
        <a href="./speakai/index.html" target="_blank" rel="noopener" class="btn btn-ghost btn-sm" style="text-decoration:none" title="باز کردن در تب مستقل">
          ↗️ تمام‌صفحه
        </a>
      </div>
    </div>
    <div style="width:100%;height:calc(100vh - 175px);min-height:660px;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:#0b0f19;box-shadow:0 12px 32px rgba(0,0,0,0.28)">
      <iframe
        id="speakAiFrame"
        src="./speakai/index.html"
        title="SpeakAI Coach — مربی مکالمه هوشمند"
        allow="microphone; autoplay; clipboard-write"
        style="width:100%;height:100%;border:0;display:block;background:#0b0f19"
      ></iframe>
    </div>
  `;

  document.getElementById('syncSpeakAiKeysBtn')?.addEventListener('click', () => {
    syncAiKeysToSpeakAi(true);
  });

  document.getElementById('importSpeakAiVocabBtn')?.addEventListener('click', () => {
    const cards = getSpeakAiSavedCards();
    importSpeakAiCardsToLeitner(cards);
  });

  // Auto-sync keys on first visit if SpeakAI has no configured providers yet
  syncAiKeysToSpeakAi(false);
}
