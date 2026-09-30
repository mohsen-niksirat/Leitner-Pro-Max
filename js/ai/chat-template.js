// ═══════════════════════════════════════════
// AI CHAT PRO — Scoped CSS & HTML Templates
// ═══════════════════════════════════════════

export const AICHAT_CSS = `
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
  #aiChatRoot .input-wrapper textarea { font-size: 16px; padding: 10px 14px; }
  #aiChatRoot .provider-badge { font-size: 0.7rem; padding: 3px 8px; }
  #aiChatRoot .quick-switch { padding: 4px 8px; gap: 4px; }
  #aiChatRoot .quick-switch-btn { font-size: 0.68rem; padding: 3px 8px; }
  #aiChatRoot .image-attached-bar { font-size: 0.72rem; padding: 6px 10px; }
  #aiChatRoot .main { flex: 1; min-height: 0; overflow: hidden; }
  #aiChatRoot .input-area { flex-shrink: 0; }
}

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

export const AICHAT_HTML = `<div id="aiChatRoot" data-theme="dark">
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

export const FULL_PROVIDERS_LIST = Object.freeze([
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
]);

export function renderFullProvidersHtml() {
  return FULL_PROVIDERS_LIST.map(p => {
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
}
