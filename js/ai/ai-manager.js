// ═══════════════════════════════════════════
// AI STUDIO PRO — Controller, Multi-Key Pool & Custom Provider Manager (ES Module)
// ═══════════════════════════════════════════
import { AICHAT_CSS, AICHAT_HTML, renderFullProvidersHtml } from './chat-template.js';
import {
  DEFAULT_CHAT_STATE,
  ROTATION_POLICIES,
  PROVIDERS,
  MODELS,
  MODEL_LABELS,
  IMAGE_KEYWORDS,
  getAllProviders,
  getProviderMeta,
  getProviderModels,
  getModelLabel,
  selectKeyFromPool,
  getKeyMetric,
  isKeyInCooldown,
  recordKeySuccess,
  recordKeyFailure,
  resolveOpenAIChatEndpoint,
  resolveAnthropicEndpoint,
  fetchRemoteModels,
  loadPuterScript,
  aiFetch,
  callProviderAPI
} from './providers.js';
import { idbGet, idbPut } from '../storage/indexeddb.js';

export function renderAiChat(c) {
  window._aiChatInit = null;
  const existingStyle = document.getElementById('aiChatProStyles');
  if (existingStyle) {
    existingStyle.textContent = AICHAT_CSS;
  } else {
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
        state.keyIndex = { ...DEFAULT_CHAT_STATE.keyIndex, ...(state.keyIndex || {}) };
        state.providerUsageStats = { ...DEFAULT_CHAT_STATE.providerUsageStats, ...(state.providerUsageStats || {}) };
        if (!state.keyStats || typeof state.keyStats !== 'object') state.keyStats = {};
        if (!state.customModels || typeof state.customModels !== 'object') state.customModels = {};
        if (!Array.isArray(state.customProviders)) state.customProviders = [];
        if (!ROTATION_POLICIES.some(p => p.id === state.keyPolicy)) state.keyPolicy = 'round_robin';
        if (typeof state.autoRetryOnFail !== 'boolean') state.autoRetryOnFail = true;
        state.keyCooldownSec = Math.max(5, Number(state.keyCooldownSec) || 60);
        if (typeof state.fallbackProvider !== 'string') state.fallbackProvider = '';

        const allProvs = getAllProviders(state);
        allProvs.forEach(p => {
          const val = state.apiKeys[p.id];
          if (typeof val === 'string') {
            state.apiKeys[p.id] = val ? [val] : [''];
          } else if (!Array.isArray(val) || val.length === 0) {
            state.apiKeys[p.id] = [''];
          }
          if (typeof state.keyIndex[p.id] !== 'number') state.keyIndex[p.id] = 0;
          if (typeof state.providerUsageStats[p.id] !== 'number') state.providerUsageStats[p.id] = 0;
        });

        if (!allProvs.some(p => p.id === state.provider)) {
          state.provider = 'gemini';
        }
        const availModels = getProviderModels(state, state.provider);
        if (!state.model || !availModels.includes(state.model)) {
          state.model = availModels[0] || 'gemini-3.8-flash';
        }

        if (!state.customProxy || typeof state.customProxy !== 'object') state.customProxy = { url: '', token: '' };
        if (!Array.isArray(state.chats)) state.chats = [];
        window.state = state;
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
          refreshAllUI();
        }).catch(() => {});
      }

      function saveState() {
        window.state = state;
        idbPut('ai_chat', state).catch(() => {
          console.warn('[AI] IndexedDB save failed; chat changes will retry on the next action.');
        });
      }

      function getCurrentKey(provider) {
        const selected = selectKeyFromPool(state, provider || state.provider);
        return selected.key || '';
      }

      function rotateKey(provider) {
        const p = provider || state.provider;
        const keys = state.apiKeys[p];
        if (!keys || !Array.isArray(keys)) return;
        const validKeys = keys.filter(k => k && k.trim());
        if (validKeys.length <= 1) return;
        state.keyIndex[p] = ((state.keyIndex[p] || 0) + 1) % validKeys.length;
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
        const root = document.getElementById('aiChatRoot');
        if (root) root.setAttribute('data-theme', state.theme);
        if ($('themeToggle')) $('themeToggle').textContent = state.theme === 'dark' ? '🌙' : '☀️';
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
        if (!chatTabs) return;
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
        if (!messagesContainer) return;
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
          if (msg.metaBadge) {
            content += `<span style="padding:1px 7px;border-radius:999px;background:rgba(124,108,240,0.12);color:var(--accent);font-size:0.65rem">${escapeHtml(msg.metaBadge)}</span>`;
          }
          if (msg.role === 'assistant') {
            content += `<button class="copy-btn" data-copy="${escapeAttr(msg.text)}">کپی 📋</button>`;
          }
          content += '</div>';

          div.innerHTML = content;
          div.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              navigator.clipboard?.writeText(btn.dataset.copy || '').then(() => {
                const orig = btn.textContent;
                btn.textContent = 'کپی شد ✅';
                setTimeout(() => { btn.textContent = orig; }, 1400);
              }).catch(() => {});
            });
          });
          messagesContainer.appendChild(div);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }

      function formatMessageText(text) {
        if (!text) return '';
        let html = escapeHtml(text);
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:var(--bg);padding:12px;border-radius:10px;direction:ltr;text-align:left;overflow-x:auto;margin:8px 0;font-size:0.82rem;border:1px solid var(--border)"><code>$2</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code style="background:var(--bg);padding:2px 6px;border-radius:5px;font-size:0.84rem;direction:ltr">$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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
        if (!quickPrompts) return;
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
        const models = getProviderModels(state, state.provider);
        if (models.length > 0 && !models.includes(state.model)) {
          state.model = models[0];
        }
        const optionsHtml = models
          .map(m => `<option value="${escapeAttr(m)}" ${m === state.model ? 'selected' : ''}>${escapeHtml(getModelLabel(state, state.provider, m))}</option>`)
          .join('');
        if (select) select.innerHTML = optionsHtml;
        if (quickSelect) quickSelect.innerHTML = optionsHtml;

        const meta = getProviderMeta(state, state.provider);
        if ($('activeProviderModelLabel')) {
          $('activeProviderModelLabel').textContent = `${meta.icon || ''} ${meta.name}`;
        }
        renderCustomModelsChips();
      }

      function renderCustomModelsChips() {
        const wrap = $('customModelsList');
        if (!wrap) return;
        const list = Array.isArray(state.customModels?.[state.provider])
          ? state.customModels[state.provider]
          : [];
        if (list.length === 0) {
          wrap.innerHTML = '<span style="font-size:0.7rem;color:var(--text2)">هنوز مدل دستی به این ارائه‌دهنده اضافه نشده است.</span>';
          return;
        }
        wrap.innerHTML = '';
        list.forEach((item, idx) => {
          const id = typeof item === 'string' ? item : item.id;
          const label = typeof item === 'object' && item.label ? `${item.label} (${id})` : id;
          const pill = document.createElement('span');
          pill.className = 'custom-model-pill';
          pill.innerHTML = `<span class="sel-model" title="انتخاب این مدل">${escapeHtml(label)}</span><span class="del-model" title="حذف این مدل">✕</span>`;
          pill.querySelector('.sel-model').addEventListener('click', () => {
            state.model = id;
            updateModelOptions();
            saveState();
          });
          pill.querySelector('.del-model').addEventListener('click', (e) => {
            e.stopPropagation();
            state.customModels[state.provider].splice(idx, 1);
            updateModelOptions();
            saveState();
          });
          wrap.appendChild(pill);
        });
      }

      function addCustomModel() {
        const idInput = $('customModelIdInput');
        const labelInput = $('customModelLabelInput');
        const id = String(idInput?.value || '').trim();
        const label = String(labelInput?.value || '').trim();
        if (!id) return;
        if (!Array.isArray(state.customModels[state.provider])) {
          state.customModels[state.provider] = [];
        }
        const exists = state.customModels[state.provider].some(m => (typeof m === 'string' ? m === id : m?.id === id));
        if (!exists) {
          state.customModels[state.provider].unshift(label ? { id, label } : { id, label: '' });
        }
        state.model = id;
        if (idInput) idInput.value = '';
        if (labelInput) labelInput.value = '';
        updateModelOptions();
        saveState();
      }

      function updateProviderBadge() {
        const meta = getProviderMeta(state, state.provider);
        const keyCount = getKeyCount(state.provider);
        const policyObj = ROTATION_POLICIES.find(p => p.id === state.keyPolicy) || ROTATION_POLICIES[0];
        const keyInfo = keyCount > 0 ? ` (${keyCount}🔑)` : '';
        if ($('providerBadge')) {
          $('providerBadge').textContent = `${meta.icon || ''} ${meta.name}${keyInfo}`.trim();
        }
        if ($('quickPolicySelect')) {
          $('quickPolicySelect').value = state.keyPolicy || 'round_robin';
        }
        if ($('keyPolicySelect')) {
          $('keyPolicySelect').value = state.keyPolicy || 'round_robin';
        }
        if ($('activePoolSummary')) {
          $('activePoolSummary').textContent = `${meta.icon} ${meta.name} · مدل: ${state.model} · کلیدهای فعال: ${keyCount} · سیاست: ${policyObj.shortName}`;
        }
      }

      function switchActiveProvider(providerId) {
        saveKeysFromUI();
        state.provider = providerId;
        const models = getProviderModels(state, providerId);
        if (!models.includes(state.model)) {
          state.model = models[0] || '';
        }
        refreshAllUI();
        saveState();
      }

      function renderProviderChips() {
        const container = $('providerChips');
        if (!container) return;
        const allProvs = getAllProviders(state);
        container.innerHTML = '';
        allProvs.forEach(p => {
          const count = getKeyCount(p.id);
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'provider-chip' + (p.id === state.provider ? ' active' : '');
          chip.dataset.provider = p.id;
          const keyBadge = count > 0
            ? `<span style="font-size:0.65rem;padding:1px 6px;border-radius:999px;background:rgba(16,185,129,0.18);color:var(--success)">${count}🔑</span>`
            : (!p.requiresKey ? `<span style="font-size:0.62rem;color:var(--accent2)">بدون کلید</span>` : '');
          chip.innerHTML = `
            <div class="provider-chip-top">
              <span>${escapeHtml(p.icon || '🤖')} ${escapeHtml(p.name)}</span>
              ${keyBadge}
            </div>
            <div class="provider-chip-sub">${escapeHtml(p.badge || p.protocol)}</div>
          `;
          chip.addEventListener('click', () => switchActiveProvider(p.id));
          container.appendChild(chip);
        });
      }

      function renderQuickSwitchBar() {
        const wrap = $('quickSwitchProviders');
        if (!wrap) return;
        const allProvs = getAllProviders(state);
        wrap.innerHTML = '';
        allProvs.forEach(p => {
          const count = getKeyCount(p.id);
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'quick-switch-btn' + (p.id === state.provider ? ' active' : '');
          btn.dataset.provider = p.id;
          btn.textContent = `${p.icon || ''} ${p.name}${count > 1 ? ` (${count}🔑)` : ''}`.trim();
          btn.addEventListener('click', () => switchActiveProvider(p.id));
          wrap.appendChild(btn);
        });
      }

      function renderPolicyCards() {
        const grid = $('policyCardsGrid');
        if (!grid) return;
        grid.innerHTML = '';
        ROTATION_POLICIES.forEach(pol => {
          const card = document.createElement('div');
          card.className = 'policy-card' + (state.keyPolicy === pol.id ? ' active' : '');
          card.innerHTML = `
            <div class="policy-card-title">${escapeHtml(pol.shortName)} — ${escapeHtml(pol.name)}</div>
            <div class="policy-card-desc">${escapeHtml(pol.desc)}</div>
          `;
          card.addEventListener('click', () => {
            state.keyPolicy = pol.id;
            updateProviderBadge();
            renderPolicyCards();
            saveState();
          });
          grid.appendChild(card);
        });

        const fbSelect = $('fallbackProviderSelect');
        if (fbSelect) {
          const allProvs = getAllProviders(state);
          fbSelect.innerHTML = `<option value="">بدون پشتیبان (فقط همین ارائه‌دهنده)</option>` +
            allProvs
              .filter(p => p.id !== state.provider && p.protocol !== 'pollinations' && p.protocol !== 'puter_img')
              .map(p => `<option value="${escapeAttr(p.id)}" ${state.fallbackProvider === p.id ? 'selected' : ''}>${escapeHtml(p.icon + ' ' + p.name)}</option>`)
              .join('');
        }
        if ($('keyCooldownSec')) $('keyCooldownSec').value = state.keyCooldownSec || 60;
        if ($('autoRetryKeysToggle')) $('autoRetryKeysToggle').checked = state.autoRetryOnFail !== false;
      }

      function buildKeyRowsInto(container, provider) {
        if (!container) return;
        const meta = getProviderMeta(state, provider);
        if (!Array.isArray(state.apiKeys[provider]) || state.apiKeys[provider].length === 0) {
          state.apiKeys[provider] = [''];
        }
        const keys = state.apiKeys[provider];
        container.innerHTML = '';

        keys.forEach((key, i) => {
          const row = document.createElement('div');
          row.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center;flex-wrap:wrap;';

          const badge = document.createElement('span');
          badge.textContent = '#' + (i + 1);
          badge.style.cssText = 'font-size:0.7rem;font-weight:700;color:var(--accent);min-width:24px;text-align:center;';

          const input = document.createElement('input');
          input.type = 'password';
          input.value = key;
          input.placeholder = meta?.keyPlaceholder || 'sk-...';
          input.style.cssText = 'flex:1;min-width:160px;padding:8px 11px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.8rem;font-family:monospace;outline:none;direction:ltr;text-align:left;';
          input.dataset.provider = provider;
          input.dataset.index = i;
          input.addEventListener('input', () => {
            state.apiKeys[provider][i] = input.value.trim();
            updateKeyCountBadge(provider);
            updateProviderBadge();
            saveState();
          });

          const metric = getKeyMetric(state, provider, key);
          const inCd = isKeyInCooldown(state, provider, key);
          const statPill = document.createElement('span');
          if (key && key.trim()) {
            const remSec = inCd ? Math.ceil((metric.cooldownUntil - Date.now()) / 1000) : 0;
            statPill.textContent = inCd
              ? `⏳ ${remSec}s`
              : `🟢 ${metric.used || 0}✓` + (metric.errors ? ` ${metric.errors}✗` : '');
            statPill.title = inCd
              ? `این کلید به دلیل خطا/محدودیت تا ${remSec} ثانیه دیگر در استراحت است`
              : `تعداد درخواست موفق: ${metric.used || 0} | خطاها: ${metric.errors || 0}`;
            statPill.style.cssText = `font-size:0.66rem;padding:2px 7px;border-radius:999px;background:${inCd ? 'rgba(245,158,11,0.16)' : 'rgba(16,185,129,0.14)'};color:${inCd ? 'var(--warning)' : 'var(--success)'};white-space:nowrap;`;
          }

          const toggle = document.createElement('button');
          toggle.type = 'button';
          toggle.textContent = '👁';
          toggle.title = 'نمایش / مخفی کردن کلید';
          toggle.style.cssText = 'background:var(--card);border:1px solid var(--border);border-radius:7px;cursor:pointer;font-size:0.8rem;padding:4px 7px;';
          toggle.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            toggle.textContent = input.type === 'password' ? '👁' : '🙈';
          });

          const remove = document.createElement('button');
          remove.type = 'button';
          remove.textContent = '✕';
          remove.title = 'حذف این کلید';
          remove.style.cssText = 'background:var(--danger);color:#fff;border:none;border-radius:7px;width:26px;height:26px;cursor:pointer;font-size:0.72rem;display:flex;align-items:center;justify-content:center;';
          remove.addEventListener('click', () => {
            if (keys.length <= 1) {
              state.apiKeys[provider] = [''];
            } else {
              keys.splice(i, 1);
              state.apiKeys[provider] = keys;
            }
            saveState();
            renderAllKeyEditors();
            updateProviderBadge();
          });

          row.appendChild(badge);
          row.appendChild(input);
          if (key && key.trim()) row.appendChild(statPill);
          row.appendChild(toggle);
          if (keys.length > 1 || (key && key.trim())) row.appendChild(remove);
          container.appendChild(row);
        });

        updateKeyCountBadge(provider);
      }

      function updateKeyCountBadge(provider) {
        const countEl = $(provider + 'KeyCount');
        const validCount = getKeyCount(provider);
        if (countEl) countEl.textContent = validCount > 0 ? '(' + validCount + ' کلید فعال)' : '';
      }

      function renderKeyFields(provider) {
        const list = $(provider + 'KeysList');
        if (list) buildKeyRowsInto(list, provider);
      }

      function renderAllKeyEditors() {
        const meta = getProviderMeta(state, state.provider);
        if ($('activeProviderKeyTitle')) {
          $('activeProviderKeyTitle').innerHTML = `${escapeHtml(meta.icon || '🔑')} استخر کلیدهای <strong>${escapeHtml(meta.name)}</strong> <span style="font-size:0.72rem;color:var(--success)">(${getKeyCount(state.provider)} کلید فعال)</span>`;
        }
        const linkEl = $('activeProviderKeyLink');
        if (linkEl) {
          if (meta.keyUrl) {
            linkEl.href = meta.keyUrl;
            linkEl.style.display = 'inline-block';
          } else {
            linkEl.style.display = 'none';
          }
        }

        const coreProviders = ['gemini', 'openrouter', 'groq', 'pollinations'];
        coreProviders.forEach(p => {
          const grp = $(p + 'KeysGroup');
          if (grp) grp.style.display = 'block';
          renderKeyFields(p);
        });

        const dynBox = $('activeProviderKeysDynamic');
        if (!dynBox) return;
        if (coreProviders.includes(state.provider)) {
          dynBox.innerHTML = `<div style="font-size:0.75rem;color:var(--text2);margin-bottom:6px">کلیدهای <strong>${escapeHtml(meta.name)}</strong> در بخش زیر قابل افزودن و ویرایش هستند:</div>
            <button type="button" class="add-key-btn" onclick="addKeyField('${escapeAttr(state.provider)}')" style="font-size:0.76rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:5px 14px;cursor:pointer">+ افزودن کلید جدید به ${escapeHtml(meta.name)}</button>`;
        } else {
          dynBox.innerHTML = `
            <div id="${escapeAttr(state.provider)}KeysList"></div>
            <button type="button" class="add-key-btn" onclick="addKeyField('${escapeAttr(state.provider)}')" style="font-size:0.76rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:5px 14px;cursor:pointer;margin-top:6px">+ افزودن کلید جدید به ${escapeHtml(meta.name)}</button>
          `;
          renderKeyFields(state.provider);
        }
      }

      function addKeyField(provider) {
        const target = provider || state.provider;
        if (!Array.isArray(state.apiKeys[target])) state.apiKeys[target] = [''];
        state.apiKeys[target].push('');
        saveState();
        renderAllKeyEditors();
        updateProviderBadge();
      }
      window.addKeyField = addKeyField;

      function saveKeysFromUI() {
        const allProvs = getAllProviders(state);
        allProvs.forEach(p => {
          const list = $(p.id + 'KeysList');
          if (!list) return;
          const inputs = list.querySelectorAll('input');
          if (inputs.length > 0) {
            state.apiKeys[p.id] = Array.from(inputs).map(inp => inp.value.trim());
          }
        });
        saveState();
      }

      function renderCustomProvidersList() {
        const listEl = $('customProvidersManageList');
        if (!listEl) return;
        if (!Array.isArray(state.customProviders) || state.customProviders.length === 0) {
          listEl.innerHTML = '';
          return;
        }
        listEl.innerHTML = '<div style="font-size:0.74rem;font-weight:700;color:var(--text2);margin:8px 0 6px">ارائه‌دهنده‌های سفارشی ثبت‌شده شما:</div>' +
          state.customProviders.map(cp => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg);border:1px solid var(--border);border-radius:9px;margin-bottom:6px;gap:8px;flex-wrap:wrap">
              <div style="font-size:0.76rem">
                <strong>${escapeHtml(cp.icon || '🛰️')} ${escapeHtml(cp.name)}</strong>
                <span style="color:var(--text2);font-family:monospace;font-size:0.68rem;margin-right:6px" dir="ltr">${escapeHtml(cp.baseUrl)}</span>
                <span style="color:var(--accent);font-size:0.68rem;margin-right:6px">(${(cp.models || []).length} مدل · ${getKeyCount(cp.id)} کلید)</span>
              </div>
              <div style="display:flex;gap:5px">
                <button type="button" class="copy-btn" data-edit-cp="${escapeAttr(cp.id)}">✏️ ویرایش</button>
                <button type="button" class="copy-btn" data-del-cp="${escapeAttr(cp.id)}" style="color:var(--danger);border-color:rgba(244,63,94,0.35)">🗑️ حذف</button>
              </div>
            </div>
          `).join('');

        listEl.querySelectorAll('[data-edit-cp]').forEach(btn => {
          btn.addEventListener('click', () => {
            const cp = state.customProviders.find(p => p.id === btn.dataset.editCp);
            if (!cp) return;
            $('customProvEditId').value = cp.id;
            $('customProvName').value = cp.name || '';
            $('customProvIcon').value = cp.icon || '🛰️';
            $('customProvProtocol').value = cp.protocol || 'openai';
            $('customProvBaseUrl').value = cp.baseUrl || '';
            $('customProvKeysInput').value = (state.apiKeys[cp.id] || []).filter(Boolean).join('\n');
            $('customProvModelsInput').value = (cp.models || []).join(', ');
            $('customProvVision').checked = cp.supportsVision !== false;
          });
        });

        listEl.querySelectorAll('[data-del-cp]').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.dataset.delCp;
            state.customProviders = state.customProviders.filter(p => p.id !== id);
            if (state.provider === id) {
              state.provider = 'gemini';
              state.model = getProviderModels(state, 'gemini')[0];
            }
            saveState();
            refreshAllUI();
          });
        });
      }

      function saveCustomProviderFromForm() {
        const editId = String($('customProvEditId')?.value || '').trim();
        const name = String($('customProvName')?.value || '').trim();
        const icon = String($('customProvIcon')?.value || '🛰️').trim() || '🛰️';
        const protocol = String($('customProvProtocol')?.value || 'openai').trim();
        const baseUrl = String($('customProvBaseUrl')?.value || '').trim().replace(/\/+$/, '');
        const rawKeys = String($('customProvKeysInput')?.value || '')
          .split(/[\r\n,]+/)
          .map(k => k.trim())
          .filter(Boolean);
        const rawModels = String($('customProvModelsInput')?.value || '')
          .split(/[\r\n,]+/)
          .map(m => m.trim())
          .filter(Boolean);
        const supportsVision = Boolean($('customProvVision')?.checked);

        const status = $('testStatus');
        if (!name || !baseUrl) {
          if (status) {
            status.textContent = '❌ لطفاً نام ارائه‌دهنده و آدرس پایه (Base URL) را وارد کنید.';
            status.className = 'test-status error';
          }
          return;
        }

        const id = editId || ('custom_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '_' + Date.now().toString(36).slice(-4));
        const models = rawModels.length > 0 ? rawModels : ['gpt-4o-mini'];

        const existingIdx = state.customProviders.findIndex(p => p.id === id);
        const providerObj = {
          id,
          name,
          icon,
          protocol,
          baseUrl,
          models,
          requiresKey: rawKeys.length > 0,
          supportsVision
        };

        if (existingIdx >= 0) {
          state.customProviders[existingIdx] = providerObj;
        } else {
          state.customProviders.push(providerObj);
        }

        state.apiKeys[id] = rawKeys.length > 0 ? rawKeys : [''];
        if (typeof state.keyIndex[id] !== 'number') state.keyIndex[id] = 0;
        if (typeof state.providerUsageStats[id] !== 'number') state.providerUsageStats[id] = 0;

        state.provider = id;
        state.model = models[0];

        resetCustomProviderForm();
        saveState();
        refreshAllUI();

        if (status) {
          status.textContent = `✅ ارائه‌دهنده سفارشی «${name}» با ${rawKeys.length} کلید و ${models.length} مدل ذخیره و فعال شد!`;
          status.className = 'test-status success';
        }
      }

      function resetCustomProviderForm() {
        if ($('customProvEditId')) $('customProvEditId').value = '';
        if ($('customProvName')) $('customProvName').value = '';
        if ($('customProvIcon')) $('customProvIcon').value = '🛰️';
        if ($('customProvProtocol')) $('customProvProtocol').value = 'openai';
        if ($('customProvBaseUrl')) $('customProvBaseUrl').value = '';
        if ($('customProvKeysInput')) $('customProvKeysInput').value = '';
        if ($('customProvModelsInput')) $('customProvModelsInput').value = '';
        if ($('customProvVision')) $('customProvVision').checked = true;
      }

      function renderFullProviders() {
        const wrapped = document.getElementById('fullProvidersTable');
        if (wrapped) wrapped.innerHTML = renderFullProvidersHtml();
      }

      function refreshAllUI() {
        applyTheme();
        renderProviderChips();
        renderQuickSwitchBar();
        updateModelOptions();
        updateProviderBadge();
        renderPolicyCards();
        renderAllKeyEditors();
        renderCustomProvidersList();
        renderFullProviders();
        updateUsageCard();
      }

      function openSettings() {
        settingsPanel.classList.add('active');
        overlay.classList.add('active');
        refreshAllUI();
        $('systemPrompt').value = state.systemPrompt;
        $('tempSlider').value = state.temperature;
        $('tempValue').textContent = state.temperature;
        $('maxTokens').value = state.maxTokens;
        $('proxyUrlInput').value = (state.customProxy && state.customProxy.url) || '';
        $('proxyTokenInput').value = '';
      }

      function saveSettingsInputs() {
        saveKeysFromUI();
        state.systemPrompt = $('systemPrompt').value;
        state.temperature = parseFloat($('tempSlider').value);
        state.maxTokens = parseInt($('maxTokens').value) || 4096;
        if ($('modelSelect') && $('modelSelect').value) {
          state.model = $('modelSelect').value;
        }
        if ($('keyPolicySelect') && $('keyPolicySelect').value) {
          state.keyPolicy = $('keyPolicySelect').value;
        }
        if ($('keyCooldownSec')) {
          state.keyCooldownSec = Math.max(5, parseInt($('keyCooldownSec').value) || 60);
        }
        if ($('fallbackProviderSelect')) {
          state.fallbackProvider = $('fallbackProviderSelect').value || '';
        }
        if ($('autoRetryKeysToggle')) {
          state.autoRetryOnFail = Boolean($('autoRetryKeysToggle').checked);
        }

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
        updateProviderBadge();
        saveState();
      }

      function closeSettings() {
        saveSettingsInputs();
        settingsPanel.classList.remove('active');
        overlay.classList.remove('active');
      }

      function updateUsageCard() {
        if (!$('usageFill')) return;
        const pct = Math.min(100, (state.dailyUsage / state.dailyLimit) * 100);
        $('usageFill').style.width = pct + '%';
        $('usageFill').style.background = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--accent)';
        $('usageCount').textContent = `${state.dailyUsage} / ${state.dailyLimit} پیام`;
        $('usageDate').textContent = state.dailyUsageDate || '-';
        const stats = state.providerUsageStats || {};
        const nonZero = Object.entries(stats)
          .filter(([, count]) => count > 0)
          .map(([id, count]) => `${getProviderMeta(state, id)?.name || id}: ${count}`);
        $('providerUsage').innerHTML = nonZero.length > 0
          ? nonZero.join(' | ')
          : `Gemini: ${stats.gemini || 0} | OpenRouter: ${stats.openrouter || 0} | Groq: ${stats.groq || 0}`;
      }

      async function testProxies() {
        const testUrl = 'https://httpbin.org/get';
        const proxies = [
          { name: 'corsproxy.io', fn: u => 'https://corsproxy.io/?' + encodeURIComponent(u) },
          { name: 'allorigins', fn: u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u) },
          { name: 'codetabs', fn: u => 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(u) },
          { name: 'corsproxy.org', fn: u => 'https://corsproxy.org/?' + encodeURIComponent(u) },
          { name: 'direct', fn: u => u }
        ];
        const results = [];
        for (const p of proxies) {
          try {
            const r = await fetch(p.fn(testUrl), { signal: AbortSignal.timeout(5000) });
            results.push(p.name + ': ' + (r.ok ? '✅' : '❌ HTTP ' + r.status));
          } catch (e) {
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
          const meta = getProviderMeta(state, state.provider);
          const protocol = meta.protocol || 'openai';
          const apiKey = getCurrentKey(state.provider);
          const noKeyProviders = ['puter_img', 'pollinations'];
          if (!apiKey && meta.requiresKey && !noKeyProviders.includes(state.provider)) {
            throw new Error('کلید API تنظیم نشده است');
          }

          if (protocol === 'pollinations' || state.provider === 'pollinations') {
            const testUrl = 'https://image.pollinations.ai/prompt/a%20cute%20cat?width=256&height=256&nologo=true';
            const r = await fetch(testUrl);
            if (r.ok) {
              status.textContent = '✅ اتصال موفق! تولید تصویر رایگان کار می‌کنه.';
              status.className = 'test-status success';
            } else {
              throw new Error('HTTP ' + r.status);
            }
            return;
          }

          if (protocol === 'puter_img' || state.provider === 'puter_img') {
            await loadPuterScript();
            if (!window.puter || !window.puter.ai) throw new Error('SDK آماده نیست');
            await window.puter.ai.txt2img('A cute cat', { provider: 'openai-image-generation', model: 'gpt-image-1-mini' });
            status.textContent = '✅ اتصال موفق! تصویر تست تولید شد.';
            status.className = 'test-status success';
            return;
          }

          if (protocol === 'gemini' || state.provider === 'gemini') {
            const root = String(meta.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').trim().replace(/\/+$/, '');
            const url = `${root}/models/${state.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const reqBody = JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'سلام' }] }] });
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
            if (data.candidates) {
              recordKeySuccess(state, state.provider, apiKey);
              saveState();
              status.textContent = `✅ اتصال موفق! (${meta.name} · ${state.model})`;
              status.className = 'test-status success';
            } else {
              recordKeyFailure(state, state.provider, apiKey, r.status || 400, JSON.stringify(data.error || data));
              saveState();
              const locErr = Boolean(data.error && /location|region|country/i.test(JSON.stringify(data.error)));
              throw new Error(locErr
                ? 'Google این کلید را از منطقه/لوکیشن شما رد می‌کند. از VPN/پروکسی Vortex یا OpenRouter استفاده کنید.\n(API: ' + (data.error.message || '') + ')'
                : JSON.stringify(data.error || data));
            }
          } else if (protocol === 'anthropic') {
            const endpoint = resolveAnthropicEndpoint(meta.baseUrl);
            const r = await aiFetch(state, endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
              },
              body: JSON.stringify({
                model: state.model,
                max_tokens: 16,
                messages: [{ role: 'user', content: 'سلام' }]
              })
            });
            const data = await r.json();
            if (Array.isArray(data.content)) {
              recordKeySuccess(state, state.provider, apiKey);
              saveState();
              status.textContent = `✅ اتصال موفق! (${meta.name} · ${state.model})`;
              status.className = 'test-status success';
            } else {
              throw new Error(data.error?.message || JSON.stringify(data));
            }
          } else {
            const endpoint = resolveOpenAIChatEndpoint(meta.baseUrl);
            const headers = { 'Content-Type': 'application/json' };
            if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
            const r = await aiFetch(state, endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({ model: state.model, messages: [{ role: 'user', content: 'سلام' }], max_tokens: 12 })
            });
            const data = await r.json();
            if (data.choices) {
              recordKeySuccess(state, state.provider, apiKey);
              saveState();
              status.textContent = `✅ اتصال موفق! (${meta.name} · ${state.model})`;
              status.className = 'test-status success';
            } else {
              recordKeyFailure(state, state.provider, apiKey, r.status || 400, JSON.stringify(data.error || data));
              saveState();
              throw new Error(data.error?.message || JSON.stringify(data.error || data));
            }
          }
          renderAllKeyEditors();
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

        const meta = getProviderMeta(state, state.provider);
        const apiKey = getCurrentKey(state.provider);
        const noKeyProviders = ['puter_img', 'pollinations'];
        if (!apiKey && meta.requiresKey && !noKeyProviders.includes(state.provider)) {
          chat.messages.push({ role: 'assistant', text: `❌ لطفاً ابتدا کلید API را برای «${meta.name}» در تنظیمات (⚙️) وارد کنید.`, timestamp: Date.now(), isError: true });
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

          const usedProvMeta = getProviderMeta(state, response.usedProvider || state.provider);
          const keyBadge = response.usedKeyIndex ? ` · کلید #${response.usedKeyIndex}` : '';
          const retryNote = response.retriedCount > 0 ? ` (چرخش خودکار پس از ${response.retriedCount} خطا)` : '';

          chat.messages.push({
            role: 'assistant',
            text: response.text || '',
            timestamp: Date.now(),
            imageData: response.imageData || undefined,
            metaBadge: `${usedProvMeta.icon || ''} ${usedProvMeta.name} · ${response.usedModel || state.model}${keyBadge}${retryNote}`
          });
          chat.updatedAt = Date.now();
          state.dailyUsage++;
          const usedId = response.usedProvider || state.provider;
          state.providerUsageStats[usedId] = (state.providerUsageStats[usedId] || 0) + 1;
          saveState();
          updateProviderBadge();
          renderMessages();
        } catch (e) {
          hideTyping();
          let errorMsg = '❌ خطا: ' + e.message;
          if (e.message.includes('500')) errorMsg += '\n\n💡 سرور موقتاً مشکل دارد. چند ثانیه صبر کنید یا کلید/پروایدر دیگری انتخاب کنید.';
          else if (e.message.includes('429') || e.message.includes('quota')) errorMsg += '\n\n💡 سهمیه کلید(ها) به پایان رسیده است. کلیدهای بیشتری اضافه کنید یا سیاست چرخش کلید را روی Round-Robin بگذارید.';
          else if (e.message.includes('network') || e.message.includes('fetch')) errorMsg += '\n\n💡 اتصال اینترنت یا Base URL را بررسی کنید.';
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
        refreshAllUI();
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

        // Quick header actions
        $('quickPolicySelect')?.addEventListener('change', (e) => {
          state.keyPolicy = e.target.value;
          updateProviderBadge();
          renderPolicyCards();
          saveState();
        });
        $('keyPolicySelect')?.addEventListener('change', (e) => {
          state.keyPolicy = e.target.value;
          updateProviderBadge();
          renderPolicyCards();
          saveState();
        });
        $('quickAddModelBtn')?.addEventListener('click', () => {
          openSettings();
          setTimeout(() => {
            $('modelManagerSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            $('customModelIdInput')?.focus();
          }, 120);
        });
        $('quickAddProviderBtn')?.addEventListener('click', () => {
          openSettings();
          setTimeout(() => {
            $('customProviderSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            $('customProvName')?.focus();
          }, 120);
        });
        $('toggleCustomProvFormBtn')?.addEventListener('click', () => {
          $('customProviderSection')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          $('customProvName')?.focus();
        });

        // Custom model adder & remote model discovery
        $('addCustomModelBtn')?.addEventListener('click', addCustomModel);
        $('customModelIdInput')?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); addCustomModel(); }
        });

        $('fetchProviderModelsBtn')?.addEventListener('click', async () => {
          saveKeysFromUI();
          const btn = $('fetchProviderModelsBtn');
          const orig = btn.textContent;
          btn.textContent = '⏳ در حال دریافت...';
          try {
            const models = await fetchRemoteModels(state, state.provider);
            if (!Array.isArray(state.customModels[state.provider])) state.customModels[state.provider] = [];
            const existing = new Set(getProviderModels(state, state.provider));
            let added = 0;
            models.slice(0, 60).forEach(m => {
              if (!existing.has(m)) {
                state.customModels[state.provider].push({ id: m, label: '' });
                added++;
              }
            });
            updateModelOptions();
            saveState();
            const status = $('testStatus');
            if (status) {
              status.textContent = `✅ ${models.length} مدل از سرور یافت شد (${added} مدل جدید به لیست اضافه شد).`;
              status.className = 'test-status success';
            }
          } catch (err) {
            const status = $('testStatus');
            if (status) {
              status.textContent = '❌ خطا در استعلام مدل‌ها: ' + err.message;
              status.className = 'test-status error';
            }
          } finally {
            btn.textContent = orig;
          }
        });

        // Custom Provider builder events
        $('saveCustomProvBtn')?.addEventListener('click', saveCustomProviderFromForm);
        $('resetCustomProvBtn')?.addEventListener('click', resetCustomProviderForm);
        $('fetchCustomProvModelsBtn')?.addEventListener('click', async () => {
          const baseUrl = String($('customProvBaseUrl')?.value || '').trim();
          const protocol = String($('customProvProtocol')?.value || 'openai').trim();
          const firstKey = String($('customProvKeysInput')?.value || '').split(/[\r\n,]+/).map(k => k.trim()).find(Boolean) || '';
          const btn = $('fetchCustomProvModelsBtn');
          if (!baseUrl) {
            alert('ابتدا Base URL را وارد کنید.');
            return;
          }
          const orig = btn.textContent;
          btn.textContent = '⏳ در حال استعلام...';
          try {
            const models = await fetchRemoteModels(state, state.provider, firstKey, baseUrl, protocol);
            if (models.length > 0 && $('customProvModelsInput')) {
              $('customProvModelsInput').value = models.slice(0, 50).join(', ');
            }
          } catch (err) {
            alert('خطا در دریافت لیست مدل‌ها از Base URL:\n' + err.message);
          } finally {
            btn.textContent = orig;
          }
        });

        // Bulk keys & cooldown reset
        $('toggleBulkKeysBtn')?.addEventListener('click', () => {
          const box = $('bulkKeysBox');
          if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
        });
        $('applyBulkKeysBtn')?.addEventListener('click', () => {
          const raw = String($('bulkKeysTextarea')?.value || '');
          const parsed = raw.split(/[\r\n,]+/).map(k => k.trim()).filter(Boolean);
          if (parsed.length === 0) return;
          const existing = (state.apiKeys[state.provider] || []).map(k => k.trim()).filter(Boolean);
          state.apiKeys[state.provider] = Array.from(new Set([...existing, ...parsed]));
          if ($('bulkKeysTextarea')) $('bulkKeysTextarea').value = '';
          if ($('bulkKeysBox')) $('bulkKeysBox').style.display = 'none';
          saveState();
          renderAllKeyEditors();
          updateProviderBadge();
        });
        $('resetCooldownsBtn')?.addEventListener('click', () => {
          state.keyStats = {};
          saveState();
          renderAllKeyEditors();
          const status = $('testStatus');
          if (status) {
            status.textContent = '✅ وضعیت استراحت (Cooldown) تمام کلیدها بازنشانی شد!';
            status.className = 'test-status success';
          }
        });

        $('saveKeysBtn').addEventListener('click', () => {
          saveSettingsInputs();
          renderAllKeyEditors();
          const status = $('testStatus');
          status.textContent = '✅ کلیدها و تنظیمات ذخیره شدند!';
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
          updateProviderBadge();
          saveState();
        });
        if ($('quickModelSelect')) {
          $('quickModelSelect').addEventListener('change', (e) => {
            state.model = e.target.value;
            const ms = $('modelSelect');
            if (ms) ms.value = state.model;
            updateProviderBadge();
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

        $('switchToGeminiEditBtn').addEventListener('click', () => {
          state.provider = 'gemini';
          state.model = 'gemini-3.1-flash-image';
          refreshAllUI();
          saveState();
          checkImageAttached();
        });

        $('switchToEditBtn').addEventListener('click', () => {
          state.provider = 'pollinations';
          state.model = 'kontext';
          refreshAllUI();
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
