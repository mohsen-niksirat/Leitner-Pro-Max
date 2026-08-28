// AI CHAT PRO — Full-featured AI Chat (from ai_chat.html)
// Self-contained with own localStorage ('ai_chat_pro')
// Scoped CSS under #aiChatRoot to avoid conflicts
// ═══════════════════════════════════════════

const AICHAT_CSS = `
#aiChatRoot {
  --bg: #0a0b10; --bg2: #13151f; --card: #1a1d2b; --border: #2a2e42;
  --text: #e8eaed; --text2: #8b90a5; --accent: #6c5ce7; --success: #00b894;
  --danger: #e17055; --warning: #fdcb6e; --user-bubble: linear-gradient(135deg, #6c5ce7, #a29bfe);
  --shadow: 0 4px 24px rgba(0,0,0,0.3); --input-bg: #1e2030;
  --scrollbar-thumb: #2a2e42; --scrollbar-track: #13151f;
}
#aiChatRoot[data-theme="light"] {
  --bg: #f0f2f5; --bg2: #ffffff; --card: #ffffff; --border: #e0e3eb;
  --text: #1a1d2b; --text2: #6b7280; --accent: #6c5ce7; --success: #00b894;
  --danger: #e17055; --warning: #fdcb6e; --user-bubble: linear-gradient(135deg, #6c5ce7, #a29bfe);
  --shadow: 0 4px 24px rgba(0,0,0,0.08); --input-bg: #f7f8fa;
  --scrollbar-thumb: #d0d3db; --scrollbar-track: #f0f2f5;
}
#aiChatRoot, #aiChatRoot *::before, #aiChatRoot *::after { box-sizing: border-box; margin: 0; padding: 0; }
#aiChatRoot { font-size: 15px; font-family: 'Vazirmatn', sans-serif; background: var(--bg); color: var(--text); display: flex; flex-direction: column; overflow: hidden; transition: background 0.3s, color 0.3s; height: calc(100vh - 60px); }
#aiChatRoot ::-webkit-scrollbar { width: 6px; }
#aiChatRoot ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
#aiChatRoot ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }

/* Header */
#aiChatRoot .header {
  display: flex; align-items: center; gap: 12px; padding: 12px 20px;
  padding-top: max(12px, env(safe-area-inset-top));
  background: var(--bg2); border-bottom: 1px solid var(--border); z-index: 100;
  flex-shrink: 0;
}
#aiChatRoot .header .logo { font-size: 1.3rem; font-weight: 700; color: var(--accent); white-space: nowrap; }
#aiChatRoot .header .logo span { font-size: 0.8rem; font-weight: 400; color: var(--text2); margin-right: 6px; }
#aiChatRoot .header-right { display: flex; align-items: center; gap: 8px; margin-right: auto; }
#aiChatRoot .icon-btn {
  width: 38px; height: 38px; border: 1px solid var(--border); border-radius: 10px;
  background: var(--card); color: var(--text); cursor: pointer; display: flex;
  align-items: center; justify-content: center; font-size: 1.15rem; transition: all 0.2s;
}
#aiChatRoot .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
#aiChatRoot .provider-badge {
  padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 500;
  background: var(--accent); color: #fff; white-space: nowrap;
}

/* Chat Tabs */
#aiChatRoot .chat-tabs {
  display: flex; align-items: center; gap: 6px; padding: 8px 20px;
  background: var(--bg); border-bottom: 1px solid var(--border);
  overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
}
#aiChatRoot .chat-tabs::-webkit-scrollbar { display: none; }
#aiChatRoot .chat-tab {
  padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 500;
  background: var(--card); color: var(--text2); border: 1px solid transparent;
  cursor: pointer; white-space: nowrap; transition: all 0.2s; position: relative;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis;
}
#aiChatRoot .chat-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
#aiChatRoot .chat-tab:hover:not(.active) { border-color: var(--accent); color: var(--text); }
#aiChatRoot .chat-tab .close-tab {
  margin-right: 6px; font-size: 0.7rem; opacity: 0.6; cursor: pointer;
  display: inline-block;
}
#aiChatRoot .chat-tab .close-tab:hover { opacity: 1; color: var(--danger); }
#aiChatRoot .new-chat-btn {
  padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
  background: transparent; color: var(--accent); border: 1px dashed var(--accent);
  cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
}
#aiChatRoot .new-chat-btn:hover { background: var(--accent); color: #fff; }

/* Main Area */
#aiChatRoot .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; padding: 0 !important; margin: 0 !important; min-width: 0 !important; background: transparent !important; width: 100% !important; }
#aiChatRoot .messages-container {
  flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px;
}

/* Quick Prompts */
#aiChatRoot .quick-prompts {
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
  padding: 20px; animation: fadeIn 0.5s;
}
#aiChatRoot .quick-prompt {
  padding: 8px 18px; border-radius: 20px; font-size: 0.82rem; font-weight: 500;
  background: var(--card); color: var(--text); border: 1px solid var(--border);
  cursor: pointer; transition: all 0.2s;
}
#aiChatRoot .quick-prompt:hover { border-color: var(--accent); color: var(--accent); transform: translateY(-2px); }

/* Messages */
#aiChatRoot .message {
  display: flex; flex-direction: column; max-width: 80%; animation: slideUp 0.3s ease;
}
#aiChatRoot .message.user { align-items: flex-start; }
#aiChatRoot .message.assistant { align-items: flex-end; }
#aiChatRoot .message-bubble {
  padding: 12px 18px; border-radius: 16px; font-size: 0.92rem; line-height: 1.7;
  position: relative; word-break: break-word; white-space: pre-wrap;
}
#aiChatRoot .message.user .message-bubble {
  background: var(--user-bubble); color: #fff; border-bottom-right-radius: 4px;
}
#aiChatRoot .message.assistant .message-bubble {
  background: var(--card); color: var(--text); border: 1px solid var(--border);
  border-bottom-left-radius: 4px;
}
#aiChatRoot .message.error .message-bubble {
  background: var(--card); color: var(--danger); border: 1px solid var(--danger);
  border-bottom-left-radius: 4px;
}
#aiChatRoot .message-meta {
  display: flex; align-items: center; gap: 8px; margin-top: 4px; font-size: 0.7rem; color: var(--text2);
}
#aiChatRoot .copy-btn {
  padding: 2px 8px; border-radius: 6px; font-size: 0.68rem; background: var(--bg2);
  color: var(--text2); border: 1px solid var(--border); cursor: pointer; transition: all 0.2s;
}
#aiChatRoot .copy-btn:hover { color: var(--accent); border-color: var(--accent); }

/* Message images */
#aiChatRoot .message-images { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
#aiChatRoot .message-images img, #aiChatRoot .attach-preview img {
  max-width: 300px; max-height: 300px; border-radius: 12px; cursor: pointer;
  transition: transform 0.2s; object-fit: cover;
}
#aiChatRoot .message-images img:hover, #aiChatRoot .attach-preview img:hover { transform: scale(1.02); }
#aiChatRoot .generated-image {
  max-width: 100%; max-width: min(400px, 100%); max-height: 400px; border-radius: 12px; margin: 8px 0;
}
@media (max-width: 640px) {
  #aiChatRoot .message-images img { max-width: 200px; max-height: 200px; }
  #aiChatRoot .generated-image { max-width: 100%; max-height: 300px; }
}

/* Typing indicator */
#aiChatRoot .typing-indicator { display: flex; gap: 4px; padding: 16px 20px; align-items: center; }
#aiChatRoot .typing-dot {
  width: 8px; height: 8px; border-radius: 50%; background: var(--text2);
  animation: typingBounce 1.4s infinite;
}
#aiChatRoot .typing-dot:nth-child(2) { animation-delay: 0.2s; }
#aiChatRoot .typing-dot:nth-child(3) { animation-delay: 0.4s; }

/* Input Area */
#aiChatRoot .input-area {
  padding: 16px 20px; background: var(--bg2); border-top: 1px solid var(--border);
  flex-shrink: 0;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
#aiChatRoot .attach-preview {
  display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;
}
#aiChatRoot .attach-item {
  position: relative; display: inline-block;
}
#aiChatRoot .attach-item .remove-attach {
  position: absolute; top: -6px; left: -6px; width: 20px; height: 20px;
  border-radius: 50%; background: var(--danger); color: #fff; border: none;
  cursor: pointer; font-size: 0.65rem; display: flex; align-items: center;
  justify-content: center;
}
#aiChatRoot .input-row {
  display: flex; gap: 10px; align-items: flex-end;
}
#aiChatRoot .input-wrapper {
  flex: 1; position: relative; background: var(--input-bg); border: 1px solid var(--border);
  border-radius: 14px; transition: border-color 0.2s;
}
#aiChatRoot .input-wrapper:focus-within { border-color: var(--accent); }
#aiChatRoot .input-wrapper textarea {
  width: 100%; padding: 12px 16px; background: transparent; border: none;
  color: var(--text); font-family: 'Vazirmatn', sans-serif; font-size: 0.9rem;
  resize: none; outline: none; min-height: 44px; max-height: 150px; line-height: 1.5;
}
#aiChatRoot .input-wrapper textarea::placeholder { color: var(--text2); }
#aiChatRoot .input-actions {
  display: flex; align-items: center; gap: 4px; padding: 6px 10px;
}
#aiChatRoot .send-btn {
  width: 44px; height: 44px; border-radius: 12px; background: var(--accent);
  color: #fff; border: none; cursor: pointer; font-size: 1.2rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  flex-shrink: 0;
}
#aiChatRoot .send-btn:hover { opacity: 0.85; transform: scale(1.05); }
#aiChatRoot .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
#aiChatRoot .attach-btn {
  width: 34px; height: 34px; border-radius: 8px; background: transparent;
  color: var(--text2); border: none; cursor: pointer; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.2s;
}
#aiChatRoot .attach-btn:hover { color: var(--accent); }

/* Settings Panel */
#aiChatRoot .overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; }
#aiChatRoot .overlay.active { display: block; }
#aiChatRoot .settings-panel {
  position: fixed; top: 0; left: 0; width: min(480px, 95vw); height: 100vh;
  background: var(--bg2); border-right: 1px solid var(--border); z-index: 201;
  transform: translateX(-100%); transition: transform 0.3s ease; overflow-y: auto;
  padding: 24px;
}
#aiChatRoot [dir="rtl"] .settings-panel { left: auto; right: 0; border-right: none; border-left: 1px solid var(--border); transform: translateX(100%); }
#aiChatRoot .settings-panel.active { transform: translateX(0); }
#aiChatRoot .settings-title {
  font-size: 1.2rem; font-weight: 700; margin-bottom: 24px; display: flex;
  align-items: center; justify-content: space-between;
}
#aiChatRoot .settings-section { margin-bottom: 24px; }
#aiChatRoot .settings-section h3 {
  font-size: 0.85rem; font-weight: 600; color: var(--accent); margin-bottom: 12px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
#aiChatRoot .form-group { margin-bottom: 14px; }
#aiChatRoot .form-group label { display: block; font-size: 0.82rem; color: var(--text2); margin-bottom: 6px; font-weight: 500; }
#aiChatRoot .form-group input, #aiChatRoot .form-group select, #aiChatRoot .form-group textarea {
  width: 100%; padding: 10px 14px; background: var(--input-bg); border: 1px solid var(--border);
  border-radius: 10px; color: var(--text); font-family: 'Vazirmatn', sans-serif;
  font-size: 0.85rem; outline: none; transition: border-color 0.2s;
}
#aiChatRoot .form-group input:focus, #aiChatRoot .form-group select:focus, #aiChatRoot .form-group textarea:focus {
  border-color: var(--accent);
}
#aiChatRoot .form-group textarea { min-height: 80px; resize: vertical; }
#aiChatRoot .provider-chips { display: flex; gap: 8px; flex-wrap: wrap; }
#aiChatRoot .provider-chip {
  padding: 8px 18px; border-radius: 20px; font-size: 0.82rem; font-weight: 500;
  background: var(--card); color: var(--text2); border: 1px solid var(--border);
  cursor: pointer; transition: all 0.2s;
}
#aiChatRoot .provider-chip.active { background: var(--accent); color: #fff; border-color: var(--accent); }
#aiChatRoot .slider-group { display: flex; align-items: center; gap: 12px; }
#aiChatRoot .slider-group input[type="range"] { flex: 1; accent-color: var(--accent); }
#aiChatRoot .slider-value { font-size: 0.82rem; color: var(--accent); font-weight: 600; min-width: 32px; text-align: center; }
#aiChatRoot .test-btn {
  padding: 8px 20px; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
  background: var(--accent); color: #fff; border: none; cursor: pointer;
  transition: all 0.2s; font-family: 'Vazirmatn', sans-serif;
}
#aiChatRoot .test-btn:hover { opacity: 0.85; }
#aiChatRoot .test-status { font-size: 0.78rem; margin-top: 8px; padding: 6px 10px; border-radius: 8px; display: none; }
#aiChatRoot .test-status.success { display: block; background: rgba(0,184,148,0.1); color: var(--success); }
#aiChatRoot .test-status.error { display: block; background: rgba(225,112,85,0.1); color: var(--danger); }

/* Usage Card */
#aiChatRoot .usage-card {
  background: var(--card); border: 1px solid var(--border); border-radius: 14px;
  padding: 16px; margin-bottom: 20px;
}
#aiChatRoot .usage-card h4 { font-size: 0.85rem; margin-bottom: 12px; color: var(--text); }
#aiChatRoot .usage-bar {
  height: 8px; background: var(--bg); border-radius: 4px; overflow: hidden; margin-bottom: 8px;
}
#aiChatRoot .usage-fill {
  height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.3s;
}
#aiChatRoot .usage-stats { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text2); }

/* Image lightbox */
#aiChatRoot .lightbox {
  display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 300;
  align-items: center; justify-content: center; cursor: pointer;
}
#aiChatRoot .lightbox.active { display: flex; }
#aiChatRoot .lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 12px; }

/* Drag overlay */
#aiChatRoot .drag-overlay {
  display: none; position: absolute; inset: 0; background: rgba(108,92,231,0.15);
  border: 2px dashed var(--accent); border-radius: 16px; z-index: 50;
  align-items: center; justify-content: center; font-size: 1.1rem; color: var(--accent);
  font-weight: 600; pointer-events: none;
}
#aiChatRoot .drag-overlay.active { display: flex; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

/* Responsive */
@media (max-width: 640px) {
  #aiChatRoot { font-size: 14px; }
  #aiChatRoot { height: 100vh; height: 100dvh; }
  #aiChatRoot .header { padding: 10px 14px; gap: 8px; }
  #aiChatRoot .header .logo { font-size: 1.1rem; }
  #aiChatRoot .header-right { gap: 6px; }
  #aiChatRoot .icon-btn { width: 34px; height: 34px; font-size: 1rem; }
  #aiChatRoot .chat-tabs { padding: 6px 14px; }
  #aiChatRoot .messages-container { padding: 10px; gap: 10px; }
  #aiChatRoot .input-area { padding: 10px 12px; }
  #aiChatRoot .message { max-width: 92%; }
  #aiChatRoot .message-bubble { padding: 10px 14px; font-size: 0.88rem; }
  #aiChatRoot .quick-prompts { padding: 10px; gap: 6px; }
  #aiChatRoot .quick-prompt { font-size: 0.75rem; padding: 6px 12px; }
  #aiChatRoot .settings-panel { padding: 16px; }
  #aiChatRoot .send-btn { width: 40px; height: 40px; font-size: 1.1rem; }
  #aiChatRoot .attach-btn { width: 32px; height: 32px; }
  #aiChatRoot .input-wrapper textarea { font-size: 16px; /* Prevent iOS zoom */ padding: 10px 14px; }
  #aiChatRoot .provider-badge { font-size: 0.7rem; padding: 3px 8px; }
  #aiChatRoot .quick-switch { padding: 4px 8px; gap: 4px; }
  #aiChatRoot .quick-switch-btn { font-size: 0.68rem; padding: 3px 8px; }
  #aiChatRoot .image-attached-bar { font-size: 0.72rem; padding: 6px 10px; }

  /* Fix mobile keyboard pushing input out of view */
  #aiChatRoot .main { flex: 1; min-height: 0; overflow: hidden; }
  #aiChatRoot .input-area { flex-shrink: 0; }
}

/* Extra small phones */
@media (max-width: 380px) {
  #aiChatRoot { font-size: 13px; }
  #aiChatRoot .header { padding: 8px 10px; }
  #aiChatRoot .quick-prompt { font-size: 0.7rem; padding: 5px 10px; }
  #aiChatRoot .chat-tab { padding: 5px 10px; font-size: 0.75rem; max-width: 120px; }
}

/* Quick Provider Switch Bar */
#aiChatRoot .quick-switch {
  display: flex; align-items: center; gap: 6px; padding: 6px 12px;
  background: var(--bg); border-top: 1px solid var(--border);
  overflow-x: auto; scrollbar-width: none; flex-shrink: 0;
}
#aiChatRoot .quick-switch::-webkit-scrollbar { display: none; }
#aiChatRoot .quick-switch-btn {
  padding: 4px 12px; border-radius: 14px; font-size: 0.72rem; font-weight: 500;
  background: var(--card); color: var(--text2); border: 1px solid var(--border);
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
#aiChatRoot .quick-switch-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
#aiChatRoot .quick-switch-btn:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

/* Image attached indicator */
#aiChatRoot .image-attached-bar {
  display: none; align-items: center; gap: 8px; padding: 8px 12px;
  background: rgba(108,92,231,0.1); border: 1px solid var(--accent);
  border-radius: 10px; margin-bottom: 8px; font-size: 0.78rem; color: var(--accent);
}
#aiChatRoot .image-attached-bar.active { display: flex; }
#aiChatRoot .image-attached-bar button {
  padding: 3px 10px; border-radius: 10px; font-size: 0.72rem; font-weight: 600;
  background: var(--accent); color: #fff; border: none; cursor: pointer;
}

/* Help Panel */
#aiChatRoot .help-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 300; align-items: center; justify-content: center; }
#aiChatRoot .help-overlay.active { display: flex; }
#aiChatRoot .help-panel {
  background: var(--bg2); border: 1px solid var(--border); border-radius: 16px;
  width: min(520px, 95vw); max-height: 85vh; overflow-y: auto; padding: 24px;
  animation: slideUp 0.3s ease;
}
#aiChatRoot .help-panel h2 { font-size: 1.1rem; color: var(--accent); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
#aiChatRoot .help-panel h3 { font-size: 0.9rem; color: var(--text); margin: 16px 0 8px; }
#aiChatRoot .help-panel p, #aiChatRoot .help-panel li { font-size: 0.82rem; color: var(--text2); line-height: 1.8; }
#aiChatRoot .help-panel ul { padding-right: 20px; }
#aiChatRoot .help-panel li { margin-bottom: 4px; }
#aiChatRoot .help-close {
  position: sticky; top: 0; float: left; background: var(--card); border: 1px solid var(--border);
  border-radius: 8px; width: 30px; height: 30px; cursor: pointer; color: var(--text);
  font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
}
#aiChatRoot .help-section { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
#aiChatRoot .help-section .emoji { font-size: 1.3rem; margin-left: 8px; }
`;

const AICHAT_HTML = `<div id="aiChatRoot" data-theme="dark">
<!-- Header -->
<div class="header">
  <div class="logo">AI Chat Pro <span>فارسی</span></div>
  <div class="header-right">
    <span class="provider-badge" id="providerBadge">Gemini</span>
    <a href="https://mohsen-niksirat.github.io/Free-AI-Chat/" target="_blank" rel="noopener" class="full-chat-link" title="نسخه کامل چت هوش مصنوعی — ۲۳+ ارائه‌دهنده، تصویرسازی و ابزارهای بیشتر" style="display:inline-block;padding:6px 10px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#7c6cf0);color:#fff;font-size:.72rem;font-weight:600;text-decoration:none;white-space:nowrap">🚀 نسخه کامل</a>
    <button class="icon-btn" id="helpBtn" title="راهنما">❓</button>
    <button class="icon-btn" id="themeToggle" title="تغییر تم">🌙</button>
    <button class="icon-btn" id="settingsBtn" title="تنظیمات">⚙️</button>
  </div>
</div>

<!-- Chat Tabs -->
<div class="chat-tabs" id="chatTabs">
  <button class="new-chat-btn" id="newChatBtn">+ چت جدید</button>
</div>

<!-- Main -->
<div class="main" id="mainArea">
  <div class="messages-container" id="messagesContainer">
    <div class="quick-prompts" id="quickPrompts">
      <button class="quick-prompt" data-prompt="ترجمه کن: ">ترجمه 🌐</button>
      <button class="quick-prompt" data-prompt="خلاصه کن: ">خلاصه 📝</button>
      <button class="quick-prompt" data-prompt="توضیح بده: ">توضیح 💡</button>
      <button class="quick-prompt" data-prompt="این متن رو اصلاح کن: ">اصلاح ✏️</button>
      <button class="quick-prompt" data-prompt="تصویر بساز: ">تصویر بساز 🎨</button>
      <button class="quick-prompt" data-prompt="این عکس رو ویرایش کن: ">ویرایش عکس ✏️</button>
      <button class="quick-prompt" data-prompt="یک سؤال جالب بساز درباره: ">سؤال بساز ❓</button>
      <button class="quick-prompt" data-prompt="یک مکالمه بنویس بین: ">مکالمه 💬</button>
      <button class="quick-prompt" data-prompt="تحلیل کن: ">تحلیل 📊</button>
    </div>
  </div>

  <!-- Quick Provider Switch -->
  <div class="quick-switch" id="quickSwitch">
    <button class="quick-switch-btn active" data-provider="gemini">Gemini</button>
    <button class="quick-switch-btn" data-provider="openrouter">OpenRouter</button>
    <button class="quick-switch-btn" data-provider="groq">Groq</button>
    <button class="quick-switch-btn" data-provider="pollinations">🎨 Pollinations</button>
  </div>

  <!-- Input Area -->
  <div class="input-area" id="inputArea">
    <div class="image-attached-bar" id="imageAttachedBar">
      🖼️ عکس ضمیمه شد — برای ویرایش، <button id="switchToGeminiEditBtn">🖼️ سوییچ به Gemini (رایگان)</button> یا <button id="switchToEditBtn" style="background:var(--text2)">✏️ Pollinations (نیاز به شارژ)</button>
    </div>
    <div class="attach-preview" id="attachPreview"></div>
    <div class="input-row">
      <div class="input-wrapper">
        <textarea id="messageInput" placeholder="پیام خود را بنویسید..." rows="1"></textarea>
        <div class="input-actions">
          <button class="attach-btn" id="attachBtn" title="پیوست فایل">📎</button>
        </div>
      </div>
      <button class="send-btn" id="sendBtn" title="ارسال">➤</button>
    </div>
    <input type="file" id="fileInput" multiple accept="image/*" style="display:none">
    <div style="text-align:center;font-size:0.68rem;color:var(--text2);margin-top:6px;opacity:0.7" id="pasteHint">📋 برای ضمیمه عکس: Ctrl+V یا 📎</div>
  </div>
</div>

<!-- Settings Panel -->
<div class="overlay" id="overlay"></div>
<div class="settings-panel" id="settingsPanel">
  <div class="settings-title">
    <span>تنظیمات</span>
    <button class="icon-btn" id="closeSettings" style="width:32px;height:32px;font-size:0.9rem">✕</button>
  </div>

  <div class="settings-section">
    <h3>ارائه‌دهنده</h3>
    <div class="provider-chips" id="providerChips">
      <button class="provider-chip active" data-provider="gemini">Gemini</button>
      <button class="provider-chip" data-provider="openrouter">OpenRouter</button>
      <button class="provider-chip" data-provider="groq">Groq</button>
      <button class="provider-chip" data-provider="pollinations">🎨 تصویرساز</button>
      <button class="provider-chip" data-provider="puter_img">Puter تصویرساز</button>
    </div>
  </div>

  <div class="settings-section">
    <h3>مدل</h3>
    <div class="form-group">
      <select id="modelSelect"></select>
    </div>
  </div>

  <div class="settings-section">
    <h3>کلید API <span style="font-size:0.7rem;font-weight:400;color:var(--text2)">(میتونی چند کلید اضافه کنی — چرخش خودکار هنگام محدودیت)</span></h3>

    <div class="form-group" id="geminiKeysGroup">
      <label>Gemini API Keys <span style="font-size:0.68rem;color:var(--accent)" id="geminiKeyCount"></span></label>
      <div id="geminiKeysList"></div>
      <button type="button" class="add-key-btn" onclick="addKeyField('gemini')" style="font-size:0.75rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:6px">+ افزودن کلید</button>
      <div style="font-size:0.68rem;color:var(--text2);margin-top:4px">
        🔗 <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--accent)">دریافت رایگان</a>
      </div>
    </div>

    <div class="form-group" id="openrouterKeysGroup">
      <label>OpenRouter API Keys <span style="font-size:0.68rem;color:var(--accent)" id="openrouterKeyCount"></span></label>
      <div id="openrouterKeysList"></div>
      <button type="button" class="add-key-btn" onclick="addKeyField('openrouter')" style="font-size:0.75rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:6px">+ افزودن کلید</button>
      <div style="font-size:0.68rem;color:var(--text2);margin-top:4px">
        🔗 <a href="https://openrouter.ai/keys" target="_blank" style="color:var(--accent)">دریافت</a>
      </div>
    </div>

    <div class="form-group" id="groqKeysGroup">
      <label>Groq API Keys <span style="font-size:0.68rem;color:var(--accent)" id="groqKeyCount"></span></label>
      <div id="groqKeysList"></div>
      <button type="button" class="add-key-btn" onclick="addKeyField('groq')" style="font-size:0.75rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:6px">+ افزودن کلید</button>
      <div style="font-size:0.68rem;color:var(--text2);margin-top:4px">
        🔗 <a href="https://console.groq.com/keys" target="_blank" style="color:var(--accent)">دریافت رایگان</a>
      </div>
    </div>

    <div class="form-group" id="pollinationsKeysGroup">
      <label>Pollinations API Key <span style="font-size:0.68rem;color:var(--text2)">(اختیاری — برای ویرایش تصویر)</span></label>
      <div id="pollinationsKeysList"></div>
      <button type="button" class="add-key-btn" onclick="addKeyField('pollinations')" style="font-size:0.75rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:6px">+ افزودن کلید</button>
      <div style="font-size:0.68rem;color:var(--text2);margin-top:4px">
        🔗 <a href="https://enter.pollinations.ai/keys" target="_blank" style="color:var(--accent)">دریافت</a> — ویرایش تصویر نیاز به شارژ داره
      </div>
    </div>
  </div>

  <div class="settings-section">
    <h3>پرامپت سیستم</h3>
    <div class="form-group">
      <textarea id="systemPrompt" placeholder="دستورالعمل سیستم...">شما یک دستیار هوش مصنوعی مفید و دقیق هستید. به فارسی پاسخ دهید مگر اینکه کاربر زبان دیگری بخواهد.</textarea>
    </div>
  </div>

  <div class="settings-section">
    <h3>پارامترها</h3>
    <div class="form-group">
      <label>دما (Temperature)</label>
      <div class="slider-group">
        <input type="range" id="tempSlider" min="0" max="2" step="0.1" value="0.7">
        <span class="slider-value" id="tempValue">0.7</span>
      </div>
    </div>
    <div class="form-group">
      <label>حداکثر توکن</label>
      <input type="number" id="maxTokens" value="4096" min="256" max="65536" step="256">
    </div>
  </div>

  <div class="settings-section">
    <h3>🌐 پروکسی سفارشی <span style="font-size:0.7rem;font-weight:400;color:var(--text2)">(Vortex Gateway)</span></h3>
    <div class="form-group">
      <label>Base URL</label>
      <input type="url" id="proxyUrlInput" placeholder="https://&lt;domain&gt;.up.railway.app" style="width:100%;padding:8px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.82rem;direction:ltr;text-align:left;outline:none">
    </div>
    <div class="form-group" style="margin-top:8px">
      <label>توکن Vortex <span style="font-size:0.68rem;color:var(--text2)">(اختیاری — Bearer / X-Vortex-Token)</span></label>
      <input type="password" id="proxyTokenInput" placeholder="توکن پروکسی" style="width:100%;padding:8px 12px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:monospace;outline:none">
    </div>
    <div style="font-size:0.68rem;color:var(--text2);margin-top:4px;line-height:1.7">
      درخواست‌های دارای کلید (Gemini/OpenRouter/Groq) فقط از این پروکسی و مستقیم می‌روند؛ بقیه از زنجیره عمومی هم استفاده می‌کنند.
    </div>
  </div>

  <div class="settings-section">
    <h3>تست اتصال</h3>
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button class="test-btn" id="saveKeysBtn" style="background:var(--success)">💾 ذخیره کلیدها</button>
      <button class="test-btn" id="testBtn">تست اتصال 🔗</button>
      <button class="test-btn" id="testProxyBtn" style="background:var(--text2);font-size:.75rem">تست پراکسی 🌐</button>
    </div>
    <div class="test-status" id="testStatus"></div>
  </div>

  <div class="settings-section">
    <h3>خروجی</h3>
    <div style="display:flex;gap:8px;">
      <button class="test-btn" id="exportTxt" style="background:var(--success)">خروجی TXT 📄</button>
      <button class="test-btn" id="exportJson" style="background:var(--warning);color:#1a1d2b">خروجی JSON 📦</button>
    </div>
  </div>

  <div class="settings-section">
    <h3>آمار مصرف</h3>
    <div class="usage-card">
      <h4>مصرف روزانه</h4>
      <div class="usage-bar"><div class="usage-fill" id="usageFill" style="width:0%"></div></div>
      <div class="usage-stats">
        <span id="usageCount">0 / 250 پیام</span>
        <span id="usageDate">-</span>
      </div>
      <div style="margin-top:12px;font-size:0.78rem;color:var(--text2)" id="providerUsage"></div>
    </div>
  </div>

  <div class="settings-section">
    <h3>🌐 ارائه‌دهنده‌های نسخه کامل <span style="font-size:0.7rem;font-weight:400;color:var(--text2)">(۲۳+)</span></h3>
    <div style="font-size:0.72rem;color:var(--text2);margin-bottom:8px;line-height:1.7">
      نسخه کامل در <a href="https://mohsen-niksirat.github.io/Free-AI-Chat/" target="_blank" rel="noopener" style="color:var(--accent)">Free-AI-Chat</a> — برای دریافت کلید هر ارائه‌دهنده روی نامش بزن.
    </div>
    <div id="fullProvidersTable"></div>
  </div>
</div>

<!-- Lightbox -->
<div class="lightbox" id="lightbox" onclick="this.classList.remove('active')">
  <img id="lightboxImg" src="" alt="">
</div>

<!-- Help Panel -->
<div class="help-overlay" id="helpOverlay">
  <div class="help-panel">
    <button class="help-close" id="closeHelp">✕</button>
    <h2>❓ راهنمای AI Chat Pro</h2>

    <div class="help-section">
      <h3><span class="emoji">💬</span> چت متنی</h3>
      <ul>
        <li>پیامت رو بنویس و ➤ بزن یا Enter بزن</li>
        <li>از <b>پرامپت‌های سریع</b> پایین صفحه استفاده کن</li>
        <li>هر provider مدل‌های خودش رو داره</li>
      </ul>
    </div>

    <div class="help-section">
      <h3><span class="emoji">🎨</span> تولید تصویر</h3>
      <ul>
        <li>Provider رو روی <b>Pollinations</b> بذار</li>
        <li>پرامپت بنویس: مثلاً «یک گربه با عینک آفتابی»</li>
        <li>بدون API key کار میکنه! ✅</li>
        <li>مدل‌های خوب: <code>flux</code>، <code>flux-realism</code>، <code>flux-anime</code></li>
      </ul>
    </div>

    <div class="help-section">
      <h3><span class="emoji">✏️</span> ویرایش تصویر با Pollinations</h3>
      <ul>
        <li>⚠️ ویرایش تصویر نیاز به <b>شارژ (pollen)</b> داره</li>
        <li>🔗 شارژ از <a href="https://enter.pollinations.ai" target="_blank" style="color:var(--accent)">enter.pollinations.ai</a></li>
        <li>💰 هر تصویر ~$0.04</li>
        <li>مدل‌های ویرایش: <code>kontext</code>، <code>nanobanana-2</code>، <code>seedream</code></li>
      </ul>
    </div>

    <div class="help-section" style="border-color:var(--success)">
      <h3><span class="emoji">🖼️</span> ویرایش تصویر با Gemini (✅ رایگان!)</h3>
      <ul>
        <li>🔑 API key رایگان از <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--accent)">aistudio.google.com</a></li>
        <li>مدل <code>gemini-3.6-flash</code> یا <code>gemini-3.1-flash-image</code> انتخاب کن</li>
        <li>عکس ضمیمه + پرامپت بنویس</li>
        <li>خودکار تصویر ویرایش‌شده برمیگرده ✅</li>
        <li>🎯 <b>بهترین گزینه رایگان برای ویرایش تصویر</b></li>
      </ul>
    </div>

    <div class="help-section">
      <h3><span class="emoji">📋</span> ضمیمه عکس</h3>
      <ul>
        <li>📎 دکمه پیوست</li>
        <li><b>Ctrl+V</b> پیست از کلیپ‌بورد</li>
        <li><b>Drag & Drop</b> کشیدن عکس به صفحه</li>
      </ul>
    </div>

    <div class="help-section">
      <h3><span class="emoji">⚡</span> سوییچ سریع</h3>
      <ul>
        <li>از نوار پایین صفحه بین provider‌ها سوییچ کن</li>
        <li>وقتی عکس ضمیمه کنی، پیام سوییچ خودکار نشون داده میشه</li>
      </ul>
    </div>

    <div class="help-section">
      <h3><span class="emoji">📤</span> خروجی</h3>
      <ul>
        <li>از تنظیمات: خروجی TXT یا JSON از چت‌ها</li>
        <li>دکمه کپی روی هر پیام</li>
      </ul>
    </div>
  </div>
</div>
</div>`;

function renderAiChat(c) {
  // Rebind the self-contained chat runtime whenever the tab is mounted again.
  window._aiChatInit = null;
  // Inject scoped CSS once
  if (!document.getElementById('aiChatProStyles')) {
    const s = document.createElement('style');
    s.id = 'aiChatProStyles';
    s.textContent = AICHAT_CSS;
    document.head.appendChild(s);
  }

  // Render HTML into container
  c.innerHTML = AICHAT_HTML;

  // Initialize AI Chat (only once per render)
  if (typeof window._aiChatInit === 'function') { window._aiChatInit(); }
  else {
    // First time: run the IIFE
    (function() {
'use strict';

// Lazy load Puter.js when needed
let puterLoaded = false;
function loadPuterScript() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.puter && window.puter.ai) return resolve();

    // Script tag exists but SDK not ready yet — wait
    if (document.querySelector('script[src*="puter.com"]')) {
      let tries = 0;
      const wait = setInterval(() => {
        if (window.puter && window.puter.ai) { clearInterval(wait); resolve(); }
        if (++tries > 50) { clearInterval(wait); reject(new Error('Puter SDK بارگذاری شد ولی آماده نشد. صفحه رو رفرش کنید.')); }
      }, 200);
      return;
    }

    // Load fresh
    const s = document.createElement('script');
    s.src = 'https://js.puter.com/v2/';
    s.onload = () => {
      // Wait for SDK to initialize (puter.ai becomes available)
      let tries = 0;
      const wait = setInterval(() => {
        if (window.puter && window.puter.ai) {
          clearInterval(wait);
          try { puter.quiet = true; } catch(e) {}
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

// --- STATE ---
const DEFAULT_STATE = {
  provider: 'gemini',
  model: 'gemini-3.6-flash',
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

const MODELS = {
  gemini: ['gemini-3.6-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.1-flash-image', 'gemini-3.5-flash'],
  openrouter: ['google/gemini-2.5-flash', 'deepseek/deepseek-chat-v3.1', 'anthropic/claude-sonnet-4', 'openai/gpt-oss-20b:free'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  pollinations: ['flux', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo', 'kontext', 'nanobanana', 'seedream'],
  puter_img: ['gpt-image-2', 'flux-2-pro', 'stable-diffusion-3', 'grok-imagine-image']
};

const IMAGE_KEYWORDS = ['تصویر', 'عکس', 'نقاشی', 'generate image', 'create image', 'draw', 'paint', 'تصویر بساز', 'عکس بساز', 'بکش', 'ویرایش عکس', 'ویرایش تصویر', 'edit image', 'edit photo'];

let state = {};
let abortController = null;
let isGenerating = false;

// --- DOM ---
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

// --- PERSISTENCE ---
function normalizeChatState(raw) {
  state = { ...DEFAULT_STATE, ...(raw || {}) };
  state.apiKeys = { ...DEFAULT_STATE.apiKeys, ...(state.apiKeys || {}) };
  // Backward compatibility: convert old single key values to arrays.
  ['gemini', 'openrouter', 'groq', 'pollinations', 'puter_img'].forEach(p => {
    if (typeof state.apiKeys[p] === 'string') state.apiKeys[p] = state.apiKeys[p] ? [state.apiKeys[p]] : [''];
    if (!Array.isArray(state.apiKeys[p])) state.apiKeys[p] = [''];
  });
  state.keyIndex = { ...DEFAULT_STATE.keyIndex, ...(state.keyIndex || {}) };
  state.providerUsageStats = { ...DEFAULT_STATE.providerUsageStats, ...(state.providerUsageStats || {}) };
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
  // Migrate the standalone chat store to the application IndexedDB once.
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
    // Do not put the full application state back into localStorage.
    console.warn('[AI] IndexedDB save failed; chat changes will retry on the next action.');
  });
}

// --- KEY ROTATION ---
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
  if (validKeys.length <= 1) return; // No rotation if only one key
  state.keyIndex[provider] = ((state.keyIndex[provider] || 0) + 1) % validKeys.length;
  saveState();
  console.log('[KeyRotation] Switched to key #' + (state.keyIndex[provider] + 1) + ' for ' + provider);
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

// --- THEME ---
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

// --- CHAT MANAGEMENT ---
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
      if (e.target.classList.contains('close-tab')) {
        deleteChat(e, e.target.dataset.id);
      } else {
        switchChat(chat.id);
      }
    });
    chatTabs.insertBefore(tab, btn);
  });
}

// --- MESSAGES ---
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

    // Images from attachments. Validate the scheme before inserting a URL into
    // markup; attachment data is user-controlled persisted state.
    if (msg.attachments && msg.attachments.length > 0) {
      content += '<div class="message-images">';
      msg.attachments.forEach(att => {
        const src = safeImageUrl(att && att.data);
        if (src) content += `<img src="${escapeAttr(src)}" alt="پیوست">`;
      });
      content += '</div>';
    }

    // Image data (generated)
    const imageSrc = safeImageUrl(msg.imageData);
    if (imageSrc) {
      content += `<img class="generated-image" src="${escapeAttr(imageSrc)}" alt="تصویر تولیدشده">`;
    }

    // Text is escaped by formatMessageText; no provider response is treated as HTML.
    content += `<div class="message-bubble">${formatMessageText(msg.text)}</div>`;

    // Meta
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
  // Basic code block formatting
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
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '');
}

// Typing indicator
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

// --- QUICK PROMPTS ---
function initQuickPrompts() {
  quickPrompts.querySelectorAll('.quick-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      messageInput.value = btn.dataset.prompt;
      messageInput.focus();
      autoResize();
    });
  });
}

// --- PROVIDER & MODEL ---
function updateModelOptions() {
  const select = $('modelSelect');
  const models = MODELS[state.provider] || [];
  select.innerHTML = models.map(m => `<option value="${m}" ${m === state.model ? 'selected' : ''}>${m}</option>`).join('');
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
    chip.addEventListener('click', () => {
      state.provider = chip.dataset.provider;
      state.model = MODELS[state.provider][0];
      updateModelOptions();
      updateProviderBadge();
      initProviderChips();
      // Show/hide provider-specific notes
      const isPuter = state.provider === 'puter_img';
      const puterNote = $('puterNote');
      if (puterNote) puterNote.style.display = isPuter ? 'block' : 'none';
      // Show pollinations note
      const pollNote = $('pollinationsNote');
      if (pollNote) pollNote.style.display = state.provider === 'pollinations' ? 'block' : 'none';
      saveState();
    });
  });
}

// --- SETTINGS ---

// Multi-key management
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
    // Show/hide toggle
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.textContent = '👁';
    toggle.style.cssText = 'background:none;border:none;cursor:pointer;font-size:0.85rem;padding:4px;';
    toggle.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      toggle.textContent = input.type === 'password' ? '👁' : '🙈';
    });
    // Remove button
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '✕';
    remove.style.cssText = 'background:var(--danger);color:#fff;border:none;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:0.7rem;display:flex;align-items:center;justify-content:center;';
    remove.addEventListener('click', () => {
      if (keys.length <= 1) return; // Keep at least one
      keys.splice(i, 1);
      state.apiKeys[provider] = keys;
      saveState();
      renderKeyFields(provider);
    });
    // Key number badge
    const badge = document.createElement('span');
    badge.textContent = '#' + (i + 1);
    badge.style.cssText = 'font-size:0.68rem;color:var(--text2);min-width:20px;text-align:center;';

    row.appendChild(badge);
    row.appendChild(input);
    row.appendChild(toggle);
    if (keys.length > 1) row.appendChild(remove);
    list.appendChild(row);
  });
  // Update count badge
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
// Expose to global scope for inline onclick handlers
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
  if (!wrapped) return;
  const P = [
    {id:'gemini',icon:'✦',name:'Google Gemini',free:true,keyUrl:'https://aistudio.google.com/app/apikey'},
    {id:'groq',icon:'⚡',name:'Groq',free:true,keyUrl:'https://console.groq.com'},
    {id:'openrouter',icon:'🔀',name:'OpenRouter',free:true,keyUrl:'https://openrouter.ai/keys'},
    {id:'cerebras',icon:'🧠',name:'Cerebras',free:true,keyUrl:'https://cloud.cerebras.ai'},
    {id:'cohere',icon:'🔮',name:'Cohere',free:true,keyUrl:'https://dashboard.cohere.com/api-keys'},
    {id:'mistral',icon:'🌊',name:'Mistral',free:true,keyUrl:'https://console.mistral.ai'},
    {id:'nvidia',icon:'💚',name:'NVIDIA NIM',free:true,keyUrl:'https://build.nvidia.com'},
    {id:'xai',icon:'⚡',name:'xAI (Grok)',free:true,keyUrl:'https://console.x.ai'},
    {id:'kimi',icon:'🌙',name:'Kimi (Moonshot)',free:true,keyUrl:'https://platform.kimi.ai/console/keys'},
    {id:'deepseek',icon:'🐋',name:'DeepSeek',free:'paid',keyUrl:'https://platform.deepseek.com/api_keys'},
    {id:'sambanova',icon:'🔥',name:'SambaNova',free:true,keyUrl:'https://cloud.sambanova.ai'},
    {id:'cloudflare',icon:'☁️',name:'Cloudflare Workers AI',free:true,keyUrl:'https://dash.cloudflare.com'},
    {id:'huggingface',icon:'🤗',name:'HuggingFace',free:true,keyUrl:'https://huggingface.co/settings/tokens'},
    {id:'fireworks',icon:'🎆',name:'Fireworks',free:true,keyUrl:'https://fireworks.ai/account/api-keys'},
    {id:'nebius',icon:'🌌',name:'Nebius',free:true,keyUrl:'https://studio.nebius.ai'},
    {id:'alibaba',icon:'🏮',name:'Alibaba (Qwen)',free:true,keyUrl:'https://bailian.console.alibabacloud.com'},
    {id:'upstage',icon:'☀️',name:'Upstage',free:true,keyUrl:'https://console.upstage.ai'},
    {id:'scaleway',icon:'🇫🇷',name:'Scaleway',free:true,keyUrl:'https://console.scaleway.com'},
    {id:'stability',icon:'🎨',name:'Stability AI (تصویرساز)',free:true,keyUrl:'https://platform.stability.ai/account/keys'},
    {id:'pollinations',icon:'🎨',name:'Pollinations (تصویرساز)',free:true,keyUrl:'https://enter.pollinations.ai/keys'},
    {id:'puter',icon:'🖼️',name:'Puter.js (تصویرساز)',free:true,keyUrl:''},
    {id:'opencode',icon:'🔮',name:'OpenCode Zen',free:true,keyUrl:''},
    {id:'kilo',icon:'🔑',name:'Kilo Gateway',free:true,keyUrl:''}
  ];
  const rows = P.map(p => {
    const badge = p.free === 'paid'
      ? '<span style="background:rgba(239,68,68,.15);color:#f87171;padding:1px 6px;border-radius:6px;font-size:.62rem">پولی</span>'
      : '<span style="background:rgba(34,197,94,.15);color:#4ade80;padding:1px 6px;border-radius:6px;font-size:.62rem">رایگان</span>';
    const link = p.keyUrl
      ? '<a href="' + p.keyUrl + '" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none;font-size:.68rem">🔗 کلید</a>'
      : '<span style="color:var(--text2);font-size:.65rem">بدون کلید</span>';
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-bottom:1px solid var(--border);border-radius:6px">'
      + '<span style="font-size:.72rem;color:var(--text)">' + p.icon + ' ' + p.name + '</span>'
      + '<span style="display:flex;align-items:center;gap:6px">' + badge + link + '</span></div>';
  }).join('');
  wrapped.innerHTML = rows;
}

function openSettings() {
  settingsPanel.classList.add('active');
  overlay.classList.add('active');
  // Render multi-key fields
  ['gemini', 'openrouter', 'groq', 'pollinations', 'puter_img'].forEach(p => renderKeyFields(p));
  renderFullProviders();
  $('systemPrompt').value = state.systemPrompt;
  $('tempSlider').value = state.temperature;
  $('tempValue').textContent = state.temperature;
  $('maxTokens').value = state.maxTokens;
  $('proxyUrlInput').value = (state.customProxy && state.customProxy.url) || '';
  // Never expose a saved proxy secret in the DOM unless the user explicitly
  // chooses to replace it; the password field remains blank on reopen.
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
    // A blank field means “keep the existing token”, while an explicit value
    // replaces it. This avoids rendering secrets back into the page.
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

// --- CONNECTION TEST ---
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
  saveSettingsInputs(); // Save current inputs to state first
  const status = $('testStatus');
  status.className = 'test-status';
  status.style.display = 'none';
  status.textContent = 'در حال تست...';
  status.className = 'test-status success';
  status.style.display = 'block';

  try {
    const apiKey = getCurrentKey(state.provider);
    const noKeyProviders = ['puter_img', 'pollinations'];
    if (!apiKey && !noKeyProviders.includes(state.provider)) throw new Error('کلید API تنظیم نشده');

    if (state.provider === 'pollinations') {
      // Test Pollinations image generation
      try {
        const testUrl = 'https://image.pollinations.ai/prompt/a%20cute%20cat?width=256&height=256&nologo=true';
        const r = await fetch(testUrl);
        if (r.ok) {
          let msg = '✅ اتصال موفق! تولید تصویر رایگان کار می‌کنه.';
          // Test API key if provided
          const pollKey = state.apiKeys?.pollinations || '';
          if (pollKey) {
            try {
              const modelsR = await fetch('https://gen.pollinations.ai/v1/models', {
                headers: { 'Authorization': 'Bearer ' + pollKey }
              });
              if (modelsR.ok) {
                msg += '\n✅ API key معتبره — ویرایش تصویر هم فعاله.';
              } else {
                msg += '\n⚠️ API key نامعتبره — فقط تولید تصویر کار می‌کنه.';
              }
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
      // Test Puter.js image generation
      try {
        await loadPuterScript();
        if (!window.puter || !window.puter.ai) throw new Error('SDK آماده نیست');
        const img = await puter.ai.txt2img('A cute cat', { provider: 'openai-image-generation', model: 'gpt-image-1-mini' });
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
      const r = await aiFetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'سلام' }] }] })
      });
      const data = await r.json();
      if (data.candidates) {
        status.textContent = '✅ اتصال موفق!';
        status.className = 'test-status success';
      } else {
        const locErr = (data.error && /location|region|country/i.test(JSON.stringify(data.error))) ? true : false;
        throw new Error(locErr
          ? 'Google این کلید را از منطقه/لوکیشن شما رد می‌کند.‌نحست: 1) از VPN/فیلترشکن با لوکیشن مجاز استفاده کنید 2) یا کلید جدید بسازید 3) یا از OpenRouter (با همین اتصال) استفاده کنید.\n(API: ' + (data.error.message || '') + ')'
          : JSON.stringify(data.error || data));
      }
    } else if (state.provider === 'openrouter') {
      const r = await aiFetch('https://openrouter.ai/api/v1/chat/completions', {
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
    } else if (state.provider === 'groq') {
      const r = await aiFetch('https://api.groq.com/openai/v1/chat/completions', {
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

// --- CORS PROXY ---
async function aiFetch(url, opts = {}, retries = 2) {
  // پروکسی سفارشی (مثل Vortex Gateway) اگر تنظیم شده باشد: اول امتحان می‌شود.
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
        // Provider responses contain useful quota/auth errors; do not hide them behind proxy retries.
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

// --- IMAGE DETECTION ---
function detectImageRequest(text) {
  const lower = text.toLowerCase();
  return IMAGE_KEYWORDS.some(kw => lower.includes(kw));
}

function hasImageAttachment(chat) {
  const lastMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  return lastMsg?.attachments && lastMsg.attachments.length > 0;
}

// --- SEND MESSAGE ---
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text && pendingAttachments.length === 0) return;
  if (isGenerating) return;

  // Daily limit check
  checkDailyReset();
  if (state.dailyUsage >= state.dailyLimit) {
    alert('محدودیت روزانه به پایان رسیده! فردا دوباره امتحان کنید.');
    return;
  }

  let chat = getActiveChat();
  if (!chat) chat = createChat();

  // Auto-title from first message
  if (chat.messages.length === 0) {
    chat.title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
    renderTabs();
  }

  // Build user message
  const userMsg = {
    role: 'user',
    text: text,
    timestamp: Date.now(),
    attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
  };
  chat.messages.push(userMsg);
  chat.updatedAt = Date.now();

  // Clear input
  messageInput.value = '';
  autoResize();
  clearAttachments();
  saveState();
  renderMessages();

  // Check API key (skip for providers that don't need one)
  const apiKey = getCurrentKey(state.provider);
  const noKeyProviders = ['puter_img', 'pollinations'];
  if (!apiKey && !noKeyProviders.includes(state.provider)) {
    const errMsg = { role: 'assistant', text: '❌ لطفاً ابتدا کلید API را در تنظیمات وارد کنید.', timestamp: Date.now(), isError: true };
    chat.messages.push(errMsg);
    saveState();
    renderMessages();
    return;
  }

  // Generate
  isGenerating = true;
  sendBtn.disabled = true;
  showTyping();

  try {
    const wantsImage = detectImageRequest(text);
    const response = await callAPI(chat, wantsImage);
    hideTyping();

    const assistantMsg = {
      role: 'assistant',
      text: response.text || '',
      timestamp: Date.now(),
      imageData: response.imageData || undefined
    };
    chat.messages.push(assistantMsg);
    chat.updatedAt = Date.now();
    state.dailyUsage++;
    state.providerUsageStats[state.provider] = (state.providerUsageStats[state.provider] || 0) + 1;
    saveState();
    renderMessages();
  } catch (e) {
    hideTyping();
    let errorMsg = '❌ خطا: ' + e.message;
    // Add helpful suggestions based on error type
    if (e.message.includes('500')) {
      errorMsg += '\n\n💡 سرور موقتاً مشکل داره. چند ثانیه صبر کن و دوباره امتحان کن.';
    } else if (e.message.includes('429') || e.message.includes('quota')) {
      errorMsg += '\n\n💡 محدودیت رایگان تمام شد. از provider دیگه‌ای استفاده کن.';
    } else if (e.message.includes('network') || e.message.includes('fetch')) {
      errorMsg += '\n\n💡 اتصال اینترنت رو بررسی کن.';
    }
    const errMsg = { role: 'assistant', text: errorMsg, timestamp: Date.now(), isError: true };
    chat.messages.push(errMsg);
    saveState();
    renderMessages();
  } finally {
    isGenerating = false;
    sendBtn.disabled = false;
  }
}

// --- API CALLS ---
async function callAPI(chat, wantsImage) {
  if (state.provider === 'gemini') return callGemini(chat, wantsImage);
  if (state.provider === 'openrouter') return callOpenRouter(chat);
  if (state.provider === 'groq') return callGroq(chat);
  if (state.provider === 'pollinations') return callPollinations(chat);
  if (state.provider === 'puter_img') return callPuterImg(chat);
  throw new Error('ارائه‌دهنده نامعتبر');
}

async function callGemini(chat, wantsImage) {
  const apiKey = getCurrentKey('gemini');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${apiKey}`;

  // Build contents
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

  // All current Gemini models support image output
  const supportsImage = state.model.includes('gemini-2.5') || state.model.includes('gemini-3') || state.model.includes('image') || state.model.includes('gemini-3.5') || state.model.includes('gemini-3.6');
  if (wantsImage || hasImageAttachment(chat)) {
    if (supportsImage) {
      body.generationConfig.responseModalities = ['TEXT', 'IMAGE'];
    }
  }

  // Use native system instruction for Gemini
  if (state.systemPrompt) {
    body.systemInstruction = { parts: [{ text: state.systemPrompt }] };
  }

  const r = await aiFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await r.json();

  if (!data.candidates || data.candidates.length === 0) {
    const errMsg = data.error?.message || 'پاسخی دریافت نشد (HTTP ' + (r.status || '?') + ')';
    if (data.error?.status === 'RESOURCE_EXHAUSTED' || r.status === 429 || errMsg.includes('429') || errMsg.includes('quota')) {
      // Try rotating to next key
      const keyCount = getKeyCount('gemini');
      if (keyCount > 1) {
        rotateKey('gemini');
        throw new Error('⚠️ کلید #' + ((state.keyIndex.gemini || 0)) + ' محدود شد — سوییچ به کلید بعدی. دوباره امتحان کنید.');
      }
      throw new Error('⚠️ محدودیت رایگان Gemini تمام شد. راه‌حل:\n' +
        '۱. کلید API جدید از aistudio.google.com بسازید\n' +
        '۲. یا از OpenRouter (رایگان) استفاده کنید\n' +
        '۳. یا از Pollinations برای تصویرسازی استفاده کنید');
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

async function callOpenRouter(chat) {
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

  const r = await aiFetch(url, {
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

async function callGroq(chat) {
  const apiKey = getCurrentKey('groq');
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const messages = [];
  if (state.systemPrompt) messages.push({ role: 'system', content: state.systemPrompt });

  chat.messages.forEach(msg => {
    messages.push({ role: msg.role, content: msg.text });
  });

  const r = await aiFetch(url, {
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

// --- POLLINATIONS (Free, no API key for generation; key for editing) ---
// Edit models that accept image input
const POLLINATIONS_EDIT_MODELS = ['kontext', 'nanobanana', 'nanobanana-2', 'seedream', 'gptimage', 'klein'];

// Retry wrapper for Pollinations API
async function pollinationsFetch(url, opts, retries = 2) {
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

async function callPollinations(chat) {
  const lastUserMsg = [...chat.messages].reverse().find(m => m.role === 'user');
  const prompt = lastUserMsg?.text || 'A beautiful landscape';
  const model = state.model || 'flux';
  const isEditModel = POLLINATIONS_EDIT_MODELS.includes(model);
  const hasImage = lastUserMsg?.attachments && lastUserMsg.attachments.length > 0;
  const pollKey = state.apiKeys?.pollinations || '';

  // If user attached an image — editing requires Pollinations credits
  if (hasImage && (isEditModel || model === 'flux')) {
    const editModel = isEditModel ? model : 'kontext';
    const imgData = lastUserMsg.attachments[0].data;

    // Try Pollinations API with key (requires credits)
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
          headers: { 'Authorization': '***' + pollKey },
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

        // Check if it's a balance error
        const errData = await response.json().catch(() => ({}));
        if (errData.error?.message?.includes('balance') || errData.error?.message?.includes('pollen')) {
          throw new Error('BALANCE_ZERO');
        }
        throw new Error(errData.error?.message || 'HTTP ' + response.status);
      } catch (e) {
        if (e.message === 'BALANCE_ZERO' || e.message?.includes('Insufficient balance')) {
          // Fall through to suggest Gemini
        } else {
          throw e;
        }
      }
    }

    // No key or no balance — suggest Gemini
    throw new Error(
      '⚠️ ویرایش تصویر با Pollinations نیاز به شارژ (pollen) داره.\n\n' +
      '✅ راه‌حل رایگان: از Gemini استفاده کن!\n' +
      '۱. API key از aistudio.google.com بگیر\n' +
      '۲. Provider رو به Gemini تغییر بده\n' +
      '۳. مدل gemini-3.6-flash یا gemini-3.1-flash-image انتخاب کن\n' +
      '۴. عکس + پرامپت بفرست\n\n' +
      '💰 یا Pollinations رو شارژ کن: enter.pollinations.ai'
    );
  }

  // Regular text-to-image generation (FREE, no key needed)
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

async function callPuterImg(chat) {
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

  // Map model names to Puter.js provider/model options
  const modelMap = {
    'gpt-image-2': { provider: 'openai-image-generation', model: 'gpt-image-2' },
    'flux-2-pro': { provider: 'replicate-image-generation', model: 'black-forest-labs/flux-2-pro' },
    'stable-diffusion-3': { provider: 'replicate-image-generation', model: 'stabilityai/stable-diffusion-3-medium' },
    'grok-imagine-image': { provider: 'xai', model: 'grok-imagine-image' }
  };
  const opts = modelMap[state.model] || modelMap['gpt-image-2'];

  // Use Puter.js txt2img API
  const imgElement = await puter.ai.txt2img(prompt, {
    provider: opts.provider,
    model: opts.model
  });

  // Convert the returned image element to base64
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

// --- ATTACHMENTS ---
let pendingAttachments = [];

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingAttachments.push({ data: e.target.result, type: file.type, name: file.name });
      renderAttachments();
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
    });
    attachPreview.appendChild(div);
  });
}

function clearAttachments() {
  pendingAttachments = [];
  attachPreview.innerHTML = '';
}

// --- AUTO RESIZE TEXTAREA ---
function autoResize() {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 150) + 'px';
}

// --- EXPORT ---
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
  const json = JSON.stringify(chat, null, 2);
  downloadFile(json, `chat-${chat.id}.json`, 'application/json');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// --- LIGHTBOX ---
window.showLightbox = function(src) {
  lightboxImg.src = src;
  lightbox.classList.add('active');
};

// --- COPY ---
document.addEventListener('click', function(e) {
  const btn = e.target.closest('.copy-btn');
  if (!btn || !btn.dataset.copy) return;
  const text = btn.dataset.copy
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#10;/g, '\n');
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = 'کپی شد ✅';
    setTimeout(() => { btn.textContent = 'کپی 📋'; }, 1500);
  });
});

// --- INIT ---
function init() {
  loadState();
  applyTheme();
  updateModelOptions();
  updateProviderBadge();
  initProviderChips();
  initQuickPrompts();

  // Ensure active chat
  if (!state.activeChat || !state.chats.find(c => c.id === state.activeChat)) {
    if (state.chats.length > 0) state.activeChat = state.chats[0].id;
    else createChat();
  }
  renderTabs();
  renderMessages();

  // Event listeners
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

  // Auto-save API keys on input (handled by renderKeyFields now)
  $('tempSlider').addEventListener('input', (e) => { $('tempValue').textContent = e.target.value; });
  $('modelSelect').addEventListener('change', (e) => { state.model = e.target.value; saveState(); });

  // Paste images — works on textarea and document
  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleFiles([file]);
          // Show brief feedback
          const toast = document.createElement('div');
          toast.textContent = '📋 تصویر چسبانده شد';
          toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:8px 16px;border-radius:8px;font-size:0.82rem;z-index:999;animation:fadeIn 0.3s;';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 1500);
        }
        break;
      }
    }
  }
  messageInput.addEventListener('paste', handlePaste);
  document.addEventListener('paste', (e) => {
    if (e.target !== messageInput) handlePaste(e);
  });

  // Drag and drop
  const mainArea = $('mainArea');
  let dragCounter = 0;
  mainArea.addEventListener('dragenter', (e) => { e.preventDefault(); dragCounter++; });
  mainArea.addEventListener('dragleave', (e) => { e.preventDefault(); dragCounter--; if (dragCounter <= 0) dragCounter = 0; });
  mainArea.addEventListener('dragover', (e) => e.preventDefault());
  mainArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  });

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('active')) lightbox.classList.remove('active');
      else if (settingsPanel.classList.contains('active')) closeSettings();
      else if ($('helpOverlay').classList.contains('active')) $('helpOverlay').classList.remove('active');
    }
  });

  // --- QUICK PROVIDER SWITCH ---
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

  // --- IMAGE ATTACHED DETECTION ---
  const origHandleFiles = window.handleFiles || handleFiles;
  function checkImageAttached() {
    const bar = $('imageAttachedBar');
    if (pendingAttachments.length > 0 && state.provider !== 'pollinations') {
      bar.classList.add('active');
    } else {
      bar.classList.remove('active');
    }
  }

  // Patch handleFiles to check for image attached
  const _origRenderAttachments = renderAttachments;
  window.renderAttachments = function() {
    _origRenderAttachments();
    checkImageAttached();
  };

  $('switchToGeminiEditBtn').addEventListener('click', () => {
    state.provider = 'gemini';
    state.model = 'gemini-3.6-flash';
    updateModelOptions();
    updateProviderBadge();
    initProviderChips();
    updateQuickSwitch();
    saveState();
    checkImageAttached();
    const toast = document.createElement('div');
    toast.textContent = '🖼️ سوییچ به Gemini (رایگان)';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;padding:8px 16px;border-radius:8px;font-size:0.82rem;z-index:999;animation:fadeIn 0.3s;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
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
    // Show feedback
    const toast = document.createElement('div');
    toast.textContent = '✏️ سوییچ به Pollinations + kontext';
    toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:8px 16px;border-radius:8px;font-size:0.82rem;z-index:999;animation:fadeIn 0.3s;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  });

  // --- HELP PANEL ---
  $('helpBtn').addEventListener('click', () => {
    $('helpOverlay').classList.add('active');
  });
  $('closeHelp').addEventListener('click', () => {
    $('helpOverlay').classList.remove('active');
  });
  $('helpOverlay').addEventListener('click', (e) => {
    if (e.target === $('helpOverlay')) $('helpOverlay').classList.remove('active');
  });
}

window._aiChatInit = init;
init();
})();
}
}

