// ═══════════════════════════════════════════
// AI CHAT PRO — Controller & State Manager (ES Module)
// ═══════════════════════════════════════════
import { AICHAT_CSS, AICHAT_HTML, renderFullProvidersHtml } from './chat-template.js';
import {
  DEFAULT_CHAT_STATE,
  MODELS,
  MODEL_LABELS,
  IMAGE_KEYWORDS,
  loadPuterScript,
  aiFetch,
  callProviderAPI
} from './providers.js';
import { idbGet, idbPut } from '../storage/indexeddb.js';

export function renderAiChat(c) {
  window._aiChatInit = null;
  if (!document.getElementById('aiChatProStyles')) {
    const s = document.createElement('style');
    s.id = 'aiChatProStyles';
    s.textContent = AICHAT_CSS;
    document.head.appendChild(s);
  }

  c.innerHTML = AICHAT_HTML;

  if (typeof window._aiChatInit === 'function') {
    window._aiChatInit();
  } else {
    (function() {
      'use strict';

      let state = {};
      let isGenerating = false;

      const $ = id => document.getElementById(id);
      const messagesContainer = $('messagesContainer');
      const messageInput = $('messageInput');
      const sendBtn = $('sendBtn');
      const chatTabs = $('chatTabs');
      const quickPrompts = $('quickPrompts');
      const attachPreview = $('attachPreview');
      const settingsPanel = $('settingsPanel');
      const overlay = $('overlay');
      const lightbox = $('lightbox');
      const lightboxImg = $('lightboxImg');

      function normalizeChatState(raw) {
        state = { ...DEFAULT_CHAT_STATE, ...(raw || {}) };
        state.apiKeys = { ...DEFAULT_CHAT_STATE.apiKeys, ...(state.apiKeys || {}) };
        ['gemini', 'openrouter', 'groq', 'pollinations', 'puter_img'].forEach(p => {
          if (typeof state.apiKeys[p] === 'string') state.apiKeys[p] = state.apiKeys[p] ? [state.apiKeys[p]] : [''];
          if (!Array.isArray(state.apiKeys[p])) state.apiKeys[p] = [''];
        });
        state.keyIndex = { ...DEFAULT_CHAT_STATE.keyIndex, ...(state.keyIndex || {}) };
        state.providerUsageStats = { ...DEFAULT_CHAT_STATE.providerUsageStats, ...(state.providerUsageStats || {}) };
        if (!state.customProxy || typeof state.customProxy !== 'object') state.customProxy = { url: '', token: '' };
        if (!Array.isArray(state.chats)) state.chats = [];
      }

      function loadState() {
        let legacy = null;
        try {
          const saved = localStorage.getItem('ai_chat_pro');
          legacy = saved ? JSON.parse(saved) : null;
        } catch {}
        normalizeChatState(legacy);
        checkDailyReset();
        idbGet('ai_chat').then(saved => {
          if (!saved) {
            if (legacy) idbPut('ai_chat', state).then(() => { try { localStorage.removeItem('ai_chat_pro'); } catch {} });
            return;
          }
          normalizeChatState(saved);
          checkDailyReset();
          renderTabs();
          renderMessages();
        }).catch(() => {});
      }

      function saveState() {
        idbPut('ai_chat', state).catch(() => {
          console.warn('[AI] IndexedDB save failed; chat changes will retry on the next action.');
        });
      }

      function getCurrentKey(provider) {
        const keys = state.apiKeys[provider];
        if (!keys || !Array.isArray(keys) || keys.length === 0) return '';
        const idx = state.keyIndex[provider] || 0;
        const validKeys = keys.filter(k => k && k.trim());
        if (validKeys.length === 0) return '';
        return validKeys[idx % validKeys.length];
      }

      function rotateKey(provider) {
        const keys = state.apiKeys[provider];
        if (!keys || !Array.isArray(keys)) return;
        const validKeys = keys.filter(k => k && k.trim());
        if (validKeys.length <= 1) return;
        state.keyIndex[provider] = ((state.keyIndex[provider] || 0) + 1) % validKeys.length;
        saveState();
      }

      function getKeyCount(provider) {
        const keys = state.apiKeys[provider];
        if (!keys || !Array.isArray(keys)) return 0;
        return keys.filter(k => k && k.trim()).length;
      }

      function checkDailyReset() {
        const today = new Date().toISOString().split('T')[0];
        if (state.dailyUsageDate !== today) {
          state.dailyUsage = 0;
          state.dailyUsageDate = today;
          saveState();
        }
      }

      function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        const root = document.getElementById('aiChatRoot');
        if (root) root.setAttribute('data-theme', state.theme);
        $('themeToggle').textContent = state.theme === 'dark' ? '🌙' : '☀️';
      }

      function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        saveState();
      }

      function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

      function createChat() {
        const chat = { id: genId(), title: 'چت جدید', messages: [], createdAt: Date.now(), updatedAt: Date.now() };
        state.chats.unshift(chat);
        state.activeChat = chat.id;
        saveState();
        renderTabs();
        renderMessages();
        return chat;
      }

      function getActiveChat() {
        return state.chats.find(c => c.id === state.activeChat);
      }

      function deleteChat(e, chatId) {
        e.stopPropagation();
        state.chats = state.chats.filter(c => c.id !== chatId);
        if (state.activeChat === chatId) {
          state.activeChat = state.chats.length > 0 ? state.chats[0].id : null;
        }
        if (state.chats.length === 0) createChat();
        saveState();
        renderTabs();
        renderMessages();
      }

      function switchChat(chatId) {
        state.activeChat = chatId;
        saveState();
        renderTabs();
        renderMessages();
      }

      function renderTabs() {
        const tabs = chatTabs.querySelectorAll('.chat-tab');
        tabs.forEach(t => t.remove());
        const btn = $('newChatBtn');
        state.chats.forEach(chat => {
          const tab = document.createElement('div');
          tab.className = 'chat-tab' + (chat.id === state.activeChat ? ' active' : '');
          tab.innerHTML = `<span class="close-tab" data-id="${chat.id}">✕</span>${escapeHtml(chat.title)}`;
          tab.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-tab')) deleteChat(e, e.target.dataset.id);
            else switchChat(chat.id);
          });
          chatTabs.insertBefore(tab, btn);
        });
      }

      function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
      }

      function formatTime(ts) {
        return new Date(ts).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      }

      function renderMessages() {
        const chat = getActiveChat();
        messagesContainer.innerHTML = '';
        if (!chat || chat.messages.length === 0) {
          quickPrompts.style.display = 'flex';
          messagesContainer.appendChild(quickPrompts);
          return;
        }
        quickPrompts.style.display = 'none';
        chat.messages.forEach(msg => {
          const div = document.createElement('div');
          div.className = `message ${msg.role}` + (msg.isError ? ' error' : '');
          let content = '';

          if (msg.attachments && msg.attachments.length > 0) {
            content += '<div class="message-images">';
            msg.attachments.forEach(att => {
              const src = safeImageUrl(att && att.data);
              if (src) content += `<img src="${escapeAttr(src)}" alt="پیوست">`;
            });
            content += '</div>';
          }

          const imageSrc = safeImageUrl(msg.imageData);
          if (imageSrc) {
            content += `<img class="generated-image" src="${escapeAttr(imageSrc)}" alt="تصویر تولیدشده">`;
          }

          content += `<div class="message-bubble">${formatMessageText(msg.text)}</div>`;
          content += `<div class="message-meta"><span>${formatTime(msg.timestamp)}</span>`;
          if (msg.role === 'assistant') {
            content += `<button class="copy-btn" data-copy="${escapeAttr(msg.text)}">کپی 📋</button>`;
          }
          content += '</div>';

          div.innerHTML = content;
          messagesContainer.appendChild(div);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      function formatMessageText(text) {
        if (!text) return '';
        let html = escapeHtml(text);
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg);padding:12px;border-radius:8px;direction:ltr;text-align:left;overflow-x:auto;margin:8px 0;font-size:0.82rem"><code>$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg);padding:2px 6px;border-radius:4px;font-size:0.85rem;direction:ltr">$1</code>');
        return html;
      }

      function safeImageUrl(value) {
        const raw = String(value || '').trim();
        if (!raw) return '';
        if (/^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(raw)) return raw;
        try {
          const url = new URL(raw, location.href);
          return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
        } catch {
          return '';
        }
      }

      function escapeAttr(text) {
        return String(text || '')
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '&#10;')
          .replace(/\r/g, '');
      }

      function showTyping() {
        const div = document.createElement('div');
        div.className = 'message assistant';
        div.id = 'typingMsg';
        div.innerHTML = `<div class="message-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      function hideTyping() {
        const el = $('typingMsg');
        if (el) el.remove();
      }

      function initQuickPrompts() {
        quickPrompts.querySelectorAll('.quick-prompt').forEach(btn => {
          btn.addEventListener('click', () => {
            messageInput.value = btn.dataset.prompt;
            messageInput.focus();
            autoResize();
          });
        });
      }

      function updateModelOptions() {
        const select = $('modelSelect');
        const quickSelect = $('quickModelSelect');
        const models = MODELS[state.provider] || [];
        if (models.length > 0 && !models.includes(state.model)) {
          state.model = models[0];
        }
        const optionsHtml = models.map(m => `<option value="${m}" ${m === state.model ? 'selected' : ''}>${MODEL_LABELS[m] || m}</option>`).join('');
        if (select) select.innerHTML = optionsHtml;
        if (quickSelect) quickSelect.innerHTML = optionsHtml;
      }

      function updateProviderBadge() {
        const name = state.provider.charAt(0).toUpperCase() + state.provider.slice(1);
        const keyCount = getKeyCount(state.provider);
        const keyInfo = keyCount > 1 ? ' (' + keyCount + '🔑)' : '';
        $('providerBadge').textContent = name + keyInfo;
      }

      function initProviderChips() {
        $('providerChips').querySelectorAll('.provider-chip').forEach(chip => {
          chip.classList.toggle('active', chip.dataset.provider === state.provider);
          chip.onclick = () => {
            state.provider = chip.dataset.provider;
            state.model = MODELS[state.provider][0];
            updateModelOptions();
            updateProviderBadge();
            initProviderChips();
            const isPuter = state.provider === 'puter_img';
            const puterNote = $('puterNote');
            if (puterNote) puterNote.style.display = isPuter ? 'block' : 'none';
            const pollNote = $('pollinationsNote');
            if (pollNote) pollNote.style.display = state.provider === 'pollinations' ? 'block' : 'none';
            saveState();
          };
        });
      }

      function renderKeyFields(provider) {
        const list = $(provider + 'KeysList');
        if (!list) return;
        const keys = state.apiKeys[provider] || [''];
        list.innerHTML = '';
        keys.forEach((key, i) => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center;';
          const input = document.createElement('input');
          input.type = 'password';
          input.value = key;
          input.placeholder = provider === 'gemini' ? 'AIza...' : provider === 'openrouter' ? 'sk-or-...' : provider === 'groq' ? 'gsk_...' : 'pk_...';
          input.style.cssText = 'flex:1;padding:8px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.82rem;font-family:monospace;outline:none;';
          input.dataset.provider = provider;
          input.dataset.index = i;
          input.addEventListener('input', () => saveKeysFromUI());

          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.textContent = '👁';
          toggle.style.cssText = 'background:none;border:none;cursor:pointer;font-size:0.85rem;padding:4px;';
          toggle.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            toggle.textContent = input.type === 'password' ? '👁' : '🙈';
          });

          const remove = document.createElement('button');
          remove.type = 'button';
          remove.textContent = '✕';
          remove.style.cssText = 'background:var(--danger);color:#fff;border:none;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:0.7rem;display:flex;align-items:center;justify-content:center;';
          remove.addEventListener('click', () => {
            if (keys.length <= 1) return;
            keys.splice(i, 1);
            state.apiKeys[provider] = keys;
            saveState();
            renderKeyFields(provider);
          });

          const badge = document.createElement('span');
          badge.textContent = '#' + (i + 1);
          badge.style.cssText = 'font-size:0.68rem;color:var(--text2);min-width:20px;text-align:center;';

          row.appendChild(badge);
          row.appendChild(input);
          row.appendChild(toggle);
          if (keys.length > 1) row.appendChild(remove);
          list.appendChild(row);
        });
        const countEl = $(provider + 'KeyCount');
        const validCount = keys.filter(k => k && k.trim()).length;
        if (countEl) countEl.textContent = validCount > 0 ? '(' + validCount + ' کلید)' : '';
      }

      function addKeyField(provider) {
        if (!state.apiKeys[provider]) state.apiKeys[provider] = [''];
        state.apiKeys[provider].push('');
        saveState();
        renderKeyFields(provider);
      }
      window.addKeyField = addKeyField;

      function saveKeysFromUI() {
        ['gemini', 'openrouter', 'groq', 'pollinations'].forEach(provider => {
          const list = $(provider + 'KeysList');
          if (!list) return;
          const inputs = list.querySelectorAll('input');
          state.apiKeys[provider] = Array.from(inputs).map(inp => inp.value.trim());
        });
        saveState();
      }

      function renderFullProviders() {
        const wrapped = document.getElementById('fullProvidersTable');
        if (wrapped) wrapped.innerHTML = renderFullProvidersHtml();
      }

      function openSettings() {
        settingsPanel.classList.add('active');
        overlay.classList.add('active');
        ['gemini', 'openrouter', 'groq', 'pollinations', 'puter_img'].forEach(p => renderKeyFields(p));
        renderFullProviders();
        $('systemPrompt').value = state.systemPrompt;
        $('tempSlider').value = state.temperature;
        $('tempValue').textContent = state.temperature;
        $('maxTokens').value = state.maxTokens;
        $('proxyUrlInput').value = (state.customProxy && state.customProxy.url) || '';
        $('proxyTokenInput').value = '';
        updateModelOptions();
        updateUsageCard();
      }

      function saveSettingsInputs() {
        saveKeysFromUI();
        state.systemPrompt = $('systemPrompt').value;
        state.temperature = parseFloat($('tempSlider').value);
        state.maxTokens = parseInt($('maxTokens').value);
        state.model = $('modelSelect').value;
        const proxyUrl = ($('proxyUrlInput') ? $('proxyUrlInput').value.trim() : '');
        const enteredProxyToken = ($('proxyTokenInput') ? $('proxyTokenInput').value.trim() : '');
        let normalizedProxyUrl = '';
        try {
          const parsedProxyUrl = new URL(proxyUrl);
          if (parsedProxyUrl.protocol === 'https:' || parsedProxyUrl.hostname === 'localhost' || parsedProxyUrl.hostname === '127.0.0.1') {
            parsedProxyUrl.pathname = parsedProxyUrl.pathname.replace(/\/+$/, '');
            normalizedProxyUrl = parsedProxyUrl.toString().replace(/\/$/, '');
          }
        } catch {}
        state.customProxy = {
          url: normalizedProxyUrl,
          token: enteredProxyToken || (state.customProxy && state.customProxy.token) || ''
        };
        saveState();
      }

      function closeSettings() {
        saveSettingsInputs();
        settingsPanel.classList.remove('active');
        overlay.classList.remove('active');
      }

      function updateUsageCard() {
        const pct = Math.min(100, (state.dailyUsage / state.dailyLimit) * 100);
        $('usageFill').style.width = pct + '%';
        $('usageFill').style.background = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--accent)';
        $('usageCount').textContent = `${state.dailyUsage} / ${state.dailyLimit} پیام`;
        $('usageDate').textContent = state.dailyUsageDate || '-';
        const stats = state.providerUsageStats || {};
        $('providerUsage').innerHTML = `Gemini: ${stats.gemini || 0} | OpenRouter: ${stats.openrouter || 0} | Groq: ${stats.groq || 0} | Pollinations: ${stats.pollinations || 0}`;
      }

      async function testProxies() {
        const testUrl = 'https://httpbin.org/get';
        const proxies = [
          {name:'corsproxy.io', fn: u=>'https://corsproxy.io/?'+encodeURIComponent(u)},
          {name:'allorigins', fn: u=>'https://api.allorigins.win/raw?url='+encodeURIComponent(u)},
          {name:'codetabs', fn: u=>'https://api.codetabs.com/v1/proxy?quest='+encodeURIComponent(u)},
          {name:'corsproxy.org', fn: u=>'https://corsproxy.org/?'+encodeURIComponent(u)},
          {name:'direct', fn: u=>u}
        ];
        const results = [];
        for (const p of proxies) {
          try {
            const r = await fetch(p.fn(testUrl), {signal: AbortSignal.timeout(5000)});
            results.push(p.name + ': ' + (r.ok ? '✅' : '❌ HTTP ' + r.status));
          } catch(e) {
            results.push(p.name + ': ❌ ' + e.message);
          }
        }
        alert('نتایج تست پراکسی:\n\n' + results.join('\n'));
      }

      async function testConnection() {
        saveSettingsInputs();
        const status = $('testStatus');
        status.className = 'test-status success';
        status.style.display = 'block';
        status.textContent = 'در حال تست...';

        try {
          const apiKey = getCurrentKey(state.provider);
          const noKeyProviders = ['puter_img', 'pollinations'];
          if (!apiKey && !noKeyProviders.includes(state.provider)) throw new Error('کلید API تنظیم نشده');

          if (state.provider === 'pollinations') {
            try {
              const testUrl = 'https://image.pollinations.ai/prompt/a%20cute%20cat?width=256&height=256&nologo=true';
              const r = await fetch(testUrl);
              if (r.ok) {
                let msg = '✅ اتصال موفق! تولید تصویر رایگان کار می‌کنه.';
                const pollKey = getCurrentKey('pollinations');
                if (pollKey) {
                  try {
                    const modelsR = await fetch('https://gen.pollinations.ai/v1/models', {
                      headers: { 'Authorization': 'Bearer ' + pollKey }
                    });
                    msg += modelsR.ok
                      ? '\n✅ API key معتبره — ویرایش تصویر هم فعاله.'
                      : '\n⚠️ API key نامعتبره — فقط تولید تصویر کار می‌کنه.';
                  } catch {}
                } else {
                  msg += '\n💡 برای ویرایش تصویر، API key وارد کنید.';
                }
                status.textContent = msg;
                status.className = 'test-status success';
              } else {
                throw new Error('HTTP ' + r.status);
              }
            } catch (pollErr) {
              status.textContent = '❌ خطا: ' + pollErr.message;
              status.className = 'test-status error';
            }
            return;
          }

          if (state.provider === 'puter_img') {
            try {
              await loadPuterScript();
              if (!window.puter || !window.puter.ai) throw new Error('SDK آماده نیست');
              await window.puter.ai.txt2img('A cute cat', { provider: 'openai-image-generation', model: 'gpt-image-1-mini' });
              status.textContent = '✅ اتصال موفق! تصویر تست تولید شد.';
              status.className = 'test-status success';
            } catch (putErr) {
              status.textContent = '❌ خطا: ' + putErr.message + '\n💡 فایل رو با http://localhost باز کنید';
              status.className = 'test-status error';
            }
            return;
          }

          if (state.provider === 'gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`;
            const r = await aiFetch(state, url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contents: [{ parts: [{ text: 'سلام' }] }] })
            });
            const data = await r.json();
            if (data.candidates) {
              status.textContent = '✅ اتصال موفق!';
              status.className = 'test-status success';
            } else {
              const locErr = Boolean(data.error && /location|region|country/i.test(JSON.stringify(data.error)));
              throw new Error(locErr
                ? 'Google این کلید را از منطقه/لوکیشن شما رد می‌کند.‌نحست: 1) از VPN/فیلترشکن با لوکیشن مجاز استفاده کنید 2) یا کلید جدید بسازید 3) یا از OpenRouter (با همین اتصال) استفاده کنید.\n(API: ' + (data.error.message || '') + ')'
                : JSON.stringify(data.error || data));
            }
          } else if (state.provider === 'openrouter' || state.provider === 'groq') {
            const endpoint = state.provider === 'openrouter'
              ? 'https://openrouter.ai/api/v1/chat/completions'
              : 'https://api.groq.com/openai/v1/chat/completions';
            const r = await aiFetch(state, endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
              body: JSON.stringify({ model: state.model, messages: [{ role: 'user', content: 'سلام' }], max_tokens: 10 })
            });
            const data = await r.json();
            if (data.choices) {
              status.textContent = '✅ اتصال موفق!';
              status.className = 'test-status success';
            } else {
              throw new Error(JSON.stringify(data.error || data));
            }
          }
        } catch (e) {
          status.textContent = '❌ خطا: ' + e.message;
          status.className = 'test-status error';
        }
      }

      function detectImageRequest(text) {
        const lower = text.toLowerCase();
        return IMAGE_KEYWORDS.some(kw => lower.includes(kw));
      }

      async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text && pendingAttachments.length === 0) return;
        if (isGenerating) return;

        checkDailyReset();
        if (state.dailyUsage >= state.dailyLimit) {
          alert('محدودیت روزانه به پایان رسیده! فردا دوباره امتحان کنید.');
          return;
        }

        let chat = getActiveChat();
        if (!chat) chat = createChat();

        if (chat.messages.length === 0) {
          chat.title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
          renderTabs();
        }

        const userMsg = {
          role: 'user',
          text: text,
          timestamp: Date.now(),
          attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
        };
        chat.messages.push(userMsg);
        chat.updatedAt = Date.now();

        messageInput.value = '';
        autoResize();
        clearAttachments();
        saveState();
        renderMessages();

        const apiKey = getCurrentKey(state.provider);
        const noKeyProviders = ['puter_img', 'pollinations'];
        if (!apiKey && !noKeyProviders.includes(state.provider)) {
          chat.messages.push({ role: 'assistant', text: '❌ لطفاً ابتدا کلید API را در تنظیمات وارد کنید.', timestamp: Date.now(), isError: true });
          saveState();
          renderMessages();
          return;
        }

        isGenerating = true;
        sendBtn.disabled = true;
        showTyping();

        try {
          const wantsImage = detectImageRequest(text);
          const response = await callProviderAPI({ state, chat, wantsImage, getCurrentKey, getKeyCount, rotateKey });
          hideTyping();

          chat.messages.push({
            role: 'assistant',
            text: response.text || '',
            timestamp: Date.now(),
            imageData: response.imageData || undefined
          });
          chat.updatedAt = Date.now();
          state.dailyUsage++;
          state.providerUsageStats[state.provider] = (state.providerUsageStats[state.provider] || 0) + 1;
          saveState();
          renderMessages();
        } catch (e) {
          hideTyping();
          let errorMsg = '❌ خطا: ' + e.message;
          if (e.message.includes('500')) errorMsg += '\n\n💡 سرور موقتاً مشکل داره. چند ثانیه صبر کن و دوباره امتحان کن.';
          else if (e.message.includes('429') || e.message.includes('quota')) errorMsg += '\n\n💡 محدودیت رایگان تمام شد. از provider دیگه‌ای استفاده کن.';
          else if (e.message.includes('network') || e.message.includes('fetch')) errorMsg += '\n\n💡 اتصال اینترنت رو بررسی کن.';
          chat.messages.push({ role: 'assistant', text: errorMsg, timestamp: Date.now(), isError: true });
          saveState();
          renderMessages();
        } finally {
          isGenerating = false;
          sendBtn.disabled = false;
        }
      }

      let pendingAttachments = [];

      function handleFiles(files) {
        Array.from(files).forEach(file => {
          if (!file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = (e) => {
            pendingAttachments.push({ data: e.target.result, type: file.type, name: file.name });
            renderAttachments();
            checkImageAttached();
          };
          reader.readAsDataURL(file);
        });
      }

      function renderAttachments() {
        attachPreview.innerHTML = '';
        pendingAttachments.forEach((att, i) => {
          const div = document.createElement('div');
          div.className = 'attach-item';
          div.innerHTML = `<img src="${att.data}" style="width:60px;height:60px;object-fit:cover;border-radius:8px"><button class="remove-attach" data-idx="${i}">✕</button>`;
          div.querySelector('.remove-attach').addEventListener('click', () => {
            pendingAttachments.splice(i, 1);
            renderAttachments();
            checkImageAttached();
          });
          attachPreview.appendChild(div);
        });
      }

      function clearAttachments() {
        pendingAttachments = [];
        attachPreview.innerHTML = '';
      }

      function autoResize() {
        messageInput.style.height = 'auto';
        messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
      }

      function exportTxt() {
        const chat = getActiveChat();
        if (!chat) return;
        let text = `عنوان: ${chat.title}\nتاریخ: ${new Date(chat.createdAt).toLocaleString('fa-IR')}\n${'='.repeat(50)}\n\n`;
        chat.messages.forEach(msg => {
          const label = msg.role === 'user' ? '👤 کاربر' : '🤖 دستیار';
          text += `${label} [${formatTime(msg.timestamp)}]:\n${msg.text}\n\n`;
        });
        downloadFile(text, `chat-${chat.id}.txt`, 'text/plain');
      }

      function exportJson() {
        const chat = getActiveChat();
        if (!chat) return;
        downloadFile(JSON.stringify(chat, null, 2), `chat-${chat.id}.json`, 'application/json');
      }

      function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      }

      window.showLightbox = function(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
      };

      function checkImageAttached() {
        const bar = $('imageAttachedBar');
        if (!bar) return;
        if (pendingAttachments.length > 0 && state.provider !== 'pollinations') bar.classList.add('active');
        else bar.classList.remove('active');
      }

      function init() {
        loadState();
        applyTheme();
        updateModelOptions();
        updateProviderBadge();
        initProviderChips();
        initQuickPrompts();

        if (!state.activeChat || !state.chats.find(c => c.id === state.activeChat)) {
          if (state.chats.length > 0) state.activeChat = state.chats[0].id;
          else createChat();
        }
        renderTabs();
        renderMessages();

        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
        });
        messageInput.addEventListener('input', autoResize);
        $('newChatBtn').addEventListener('click', () => { createChat(); });
        $('themeToggle').addEventListener('click', toggleTheme);
        $('settingsBtn').addEventListener('click', openSettings);
        $('closeSettings').addEventListener('click', closeSettings);
        overlay.addEventListener('click', closeSettings);
        $('testBtn').addEventListener('click', testConnection);
        $('testProxyBtn').addEventListener('click', testProxies);
        $('saveKeysBtn').addEventListener('click', () => {
          saveSettingsInputs();
          const status = $('testStatus');
          status.textContent = '✅ کلیدها ذخیره شدند!';
          status.className = 'test-status success';
          status.style.display = 'block';
          setTimeout(() => { status.style.display = 'none'; }, 2000);
        });
        $('exportTxt').addEventListener('click', exportTxt);
        $('exportJson').addEventListener('click', exportJson);
        $('attachBtn').addEventListener('click', () => $('fileInput').click());
        $('fileInput').addEventListener('change', (e) => { handleFiles(e.target.files); e.target.value = ''; });
        $('tempSlider').addEventListener('input', (e) => { $('tempValue').textContent = e.target.value; });
        $('modelSelect').addEventListener('change', (e) => {
          state.model = e.target.value;
          const qs = $('quickModelSelect');
          if (qs) qs.value = state.model;
          saveState();
        });
        if ($('quickModelSelect')) {
          $('quickModelSelect').addEventListener('change', (e) => {
            state.model = e.target.value;
            const ms = $('modelSelect');
            if (ms) ms.value = state.model;
            saveState();
          });
        }

        function handlePaste(e) {
          const items = e.clipboardData?.items;
          if (!items) return;
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              e.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handleFiles([file]);
                const t = document.createElement('div');
                t.textContent = '📋 تصویر چسبانده شد';
                t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:8px 16px;border-radius:8px;font-size:0.82rem;z-index:999;animation:fadeIn 0.3s;';
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 1500);
              }
              break;
            }
          }
        }
        messageInput.addEventListener('paste', handlePaste);

        const mainArea = $('mainArea');
        mainArea.addEventListener('dragover', (e) => e.preventDefault());
        mainArea.addEventListener('drop', (e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        });

        function updateQuickSwitch() {
          document.querySelectorAll('.quick-switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.provider === state.provider);
          });
        }
        updateQuickSwitch();

        document.querySelectorAll('.quick-switch-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            state.provider = btn.dataset.provider;
            state.model = MODELS[state.provider][0];
            updateModelOptions();
            updateProviderBadge();
            initProviderChips();
            updateQuickSwitch();
            saveState();
          });
        });

        $('switchToGeminiEditBtn').addEventListener('click', () => {
          state.provider = 'gemini';
          state.model = 'gemini-3.1-flash-image';
          updateModelOptions();
          updateProviderBadge();
          initProviderChips();
          updateQuickSwitch();
          saveState();
          checkImageAttached();
        });

        $('switchToEditBtn').addEventListener('click', () => {
          state.provider = 'pollinations';
          state.model = 'kontext';
          updateModelOptions();
          updateProviderBadge();
          initProviderChips();
          updateQuickSwitch();
          saveState();
          checkImageAttached();
        });

        $('helpBtn').addEventListener('click', () => $('helpOverlay').classList.add('active'));
        $('closeHelp').addEventListener('click', () => $('helpOverlay').classList.remove('active'));
        $('helpOverlay').addEventListener('click', (e) => {
          if (e.target === $('helpOverlay')) $('helpOverlay').classList.remove('active');
        });
      }

      window._aiChatInit = init;
      init();
    })();
  }
}

export const initialize = renderAiChat;
if (typeof window !== 'undefined') window.renderAiChat = renderAiChat;
