// ═══════════════════════════════════════════
// AI STUDIO PRO — Scoped CSS & HTML Templates (Redesigned v5.3)
// ═══════════════════════════════════════════

export const AICHAT_CSS = `
#aiChatRoot {
  --bg: #080b14;
  --bg2: #0f1422;
  --card: #161d30;
  --card-hover: #1d263f;
  --border: rgba(148, 163, 184, 0.16);
  --border-strong: rgba(124, 108, 240, 0.42);
  --text: #f1f5f9;
  --text2: #94a3b8;
  --accent: #7c6cf0;
  --accent2: #38bdf8;
  --accent-glow: rgba(124, 108, 240, 0.24);
  --success: #10b981;
  --danger: #f43f5e;
  --warning: #f59e0b;
  --user-bubble: linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 55%, #6366f1 100%);
  --shadow: 0 12px 36px rgba(0, 0, 0, 0.42);
  --input-bg: #111728;
  --scrollbar-thumb: #293452;
  --scrollbar-track: #0c101d;
}
#aiChatRoot[data-theme="light"] {
  --bg: #f4f6fb;
  --bg2: #ffffff;
  --card: #ffffff;
  --card-hover: #f8fafc;
  --border: rgba(15, 23, 42, 0.1);
  --border-strong: rgba(108, 92, 231, 0.35);
  --text: #0f172a;
  --text2: #64748b;
  --accent: #6c5ce7;
  --accent2: #0284c7;
  --accent-glow: rgba(108, 92, 231, 0.16);
  --success: #059669;
  --danger: #e11d48;
  --warning: #d97706;
  --user-bubble: linear-gradient(135deg, #6c5ce7 0%, #8b5cf6 100%);
  --shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
  --input-bg: #f8fafc;
  --scrollbar-thumb: #cbd5e1;
  --scrollbar-track: #f1f5f9;
}
#aiChatRoot, #aiChatRoot *::before, #aiChatRoot *::after { box-sizing: border-box; margin: 0; padding: 0; }
#aiChatRoot {
  font-size: 15px;
  font-family: 'Vazirmatn', sans-serif;
  background:
    radial-gradient(circle at 12% 10%, rgba(124, 108, 240, 0.12), transparent 36%),
    radial-gradient(circle at 88% 85%, rgba(56, 189, 248, 0.09), transparent 38%),
    var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: background 0.3s, color 0.3s;
  height: calc(100vh - 76px);
  border-radius: 18px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  position: relative;
}
#aiChatRoot ::-webkit-scrollbar { width: 6px; height: 6px; }
#aiChatRoot ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
#aiChatRoot ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 3px; }

/* Studio Header */
#aiChatRoot .header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 18px;
  background: rgba(15, 20, 34, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  flex-shrink: 0;
  flex-wrap: wrap;
}
#aiChatRoot[data-theme="light"] .header {
  background: rgba(255, 255, 255, 0.9);
}
#aiChatRoot .header .logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
#aiChatRoot .header .logo-orb {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  box-shadow: 0 4px 14px var(--accent-glow);
}
#aiChatRoot .header .logo {
  font-size: 1.08rem;
  font-weight: 800;
  color: var(--text);
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}
#aiChatRoot .header .logo span {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(124, 108, 240, 0.16);
  color: var(--accent);
  border: 1px solid rgba(124, 108, 240, 0.3);
}
#aiChatRoot .header-right {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-right: auto;
  flex-wrap: wrap;
}
#aiChatRoot .icon-btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  transition: all 0.2s;
}
#aiChatRoot .icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-1px);
}
#aiChatRoot .provider-badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent), #6366f1);
  color: #fff;
  white-space: nowrap;
  box-shadow: 0 3px 10px var(--accent-glow);
}
#aiChatRoot .policy-pill-select {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  outline: none;
  font-family: 'Vazirmatn', sans-serif;
  transition: border-color 0.2s;
}
#aiChatRoot .policy-pill-select:hover, #aiChatRoot .policy-pill-select:focus {
  border-color: var(--accent);
}
#aiChatRoot .studio-action-pill {
  padding: 5px 10px;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 600;
  background: rgba(124, 108, 240, 0.12);
  color: var(--accent);
  border: 1px solid rgba(124, 108, 240, 0.3);
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.2s;
}
#aiChatRoot .studio-action-pill:hover {
  background: var(--accent);
  color: #fff;
}

/* Chat Tabs */
#aiChatRoot .chat-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: rgba(15, 20, 34, 0.45);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}
#aiChatRoot .chat-tabs::-webkit-scrollbar { display: none; }
#aiChatRoot .chat-tab {
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--card);
  color: var(--text2);
  border: 1px solid var(--border);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  position: relative;
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
}
#aiChatRoot .chat-tab.active {
  background: linear-gradient(135deg, var(--accent), #6366f1);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 10px var(--accent-glow);
}
#aiChatRoot .chat-tab:hover:not(.active) { border-color: var(--accent); color: var(--text); }
#aiChatRoot .chat-tab .close-tab {
  margin-right: 6px;
  font-size: 0.68rem;
  opacity: 0.65;
  cursor: pointer;
  display: inline-block;
}
#aiChatRoot .chat-tab .close-tab:hover { opacity: 1; color: var(--danger); }
#aiChatRoot .new-chat-btn {
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  background: transparent;
  color: var(--accent);
  border: 1px dashed var(--accent);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;
  font-family: 'Vazirmatn', sans-serif;
}
#aiChatRoot .new-chat-btn:hover { background: var(--accent); color: #fff; }

/* Main Area */
#aiChatRoot .main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  padding: 0 !important;
  margin: 0 !important;
  min-width: 0 !important;
  background: transparent !important;
  width: 100% !important;
}
#aiChatRoot .messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Quick Prompts / Welcome Hub */
#aiChatRoot .quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 24px 16px;
  max-width: 760px;
  margin: auto;
  animation: fadeIn 0.4s;
}
#aiChatRoot .welcome-hero {
  width: 100%;
  text-align: center;
  margin-bottom: 14px;
}
#aiChatRoot .welcome-hero h3 {
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 6px;
  background: linear-gradient(135deg, var(--text), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
#aiChatRoot .welcome-hero p {
  font-size: 0.8rem;
  color: var(--text2);
}
#aiChatRoot .quick-prompt {
  padding: 9px 16px;
  border-radius: 14px;
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Vazirmatn', sans-serif;
}
#aiChatRoot .quick-prompt:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

/* Messages */
#aiChatRoot .message {
  display: flex;
  flex-direction: column;
  max-width: 82%;
  animation: slideUp 0.25s ease;
}
#aiChatRoot .message.user { align-items: flex-start; }
#aiChatRoot .message.assistant { align-items: flex-end; }
#aiChatRoot .message-bubble {
  padding: 13px 18px;
  border-radius: 18px;
  font-size: 0.91rem;
  line-height: 1.78;
  position: relative;
  word-break: break-word;
  white-space: pre-wrap;
}
#aiChatRoot .message.user .message-bubble {
  background: var(--user-bubble);
  color: #fff;
  border-bottom-right-radius: 5px;
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.24);
}
#aiChatRoot .message.assistant .message-bubble {
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-bottom-left-radius: 5px;
}
#aiChatRoot .message.error .message-bubble {
  background: rgba(244, 63, 94, 0.08);
  color: var(--danger);
  border: 1px solid rgba(244, 63, 94, 0.4);
  border-bottom-left-radius: 5px;
}
#aiChatRoot .message-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  font-size: 0.7rem;
  color: var(--text2);
  flex-wrap: wrap;
}
#aiChatRoot .copy-btn {
  padding: 2px 9px;
  border-radius: 7px;
  font-size: 0.68rem;
  background: var(--bg2);
  color: var(--text2);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Vazirmatn', sans-serif;
}
#aiChatRoot .copy-btn:hover { color: var(--accent); border-color: var(--accent); }

/* Message images */
#aiChatRoot .message-images { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
#aiChatRoot .message-images img, #aiChatRoot .attach-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  object-fit: cover;
}
#aiChatRoot .message-images img:hover, #aiChatRoot .attach-preview img:hover { transform: scale(1.02); }
#aiChatRoot .generated-image {
  max-width: min(420px, 100%);
  max-height: 420px;
  border-radius: 14px;
  margin: 8px 0;
  border: 1px solid var(--border);
}

/* Typing indicator */
#aiChatRoot .typing-indicator { display: flex; gap: 5px; padding: 14px 18px; align-items: center; }
#aiChatRoot .typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: typingBounce 1.4s infinite;
}
#aiChatRoot .typing-dot:nth-child(2) { animation-delay: 0.2s; }
#aiChatRoot .typing-dot:nth-child(3) { animation-delay: 0.4s; }

/* Quick Provider & Model Switch Bar */
#aiChatRoot .quick-switch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(15, 20, 34, 0.75);
  border-top: 1px solid var(--border);
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
#aiChatRoot[data-theme="light"] .quick-switch {
  background: rgba(248, 250, 252, 0.9);
}
#aiChatRoot .quick-switch::-webkit-scrollbar { display: none; }
#aiChatRoot .quick-switch-btn {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--card);
  color: var(--text2);
  border: 1px solid var(--border);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: 'Vazirmatn', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
#aiChatRoot .quick-switch-btn.active {
  background: linear-gradient(135deg, var(--accent), #6366f1);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 10px var(--accent-glow);
}
#aiChatRoot .quick-switch-btn:hover:not(.active) {
  border-color: var(--accent);
  color: var(--text);
}
#aiChatRoot .quick-model-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-right: auto;
  flex-shrink: 0;
}

/* Input Area */
#aiChatRoot .input-area {
  padding: 12px 18px;
  background: var(--bg2);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
#aiChatRoot .attach-preview {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
#aiChatRoot .attach-item { position: relative; display: inline-block; }
#aiChatRoot .attach-item .remove-attach {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--danger);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
#aiChatRoot .input-row { display: flex; gap: 10px; align-items: flex-end; }
#aiChatRoot .input-wrapper {
  flex: 1;
  position: relative;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
}
#aiChatRoot .input-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}
#aiChatRoot .input-wrapper textarea {
  flex: 1;
  width: 100%;
  padding: 11px 14px;
  background: transparent;
  border: none;
  color: var(--text);
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.9rem;
  resize: none;
  outline: none;
  min-height: 44px;
  max-height: 150px;
  line-height: 1.5;
}
#aiChatRoot .input-wrapper textarea::placeholder { color: var(--text2); }
#aiChatRoot .input-actions { display: flex; align-items: center; gap: 4px; padding: 6px 8px; }
#aiChatRoot .send-btn {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  background: linear-gradient(135deg, var(--accent), #6366f1);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 4px 14px var(--accent-glow);
}
#aiChatRoot .send-btn:hover { opacity: 0.92; transform: translateY(-1px); }
#aiChatRoot .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
#aiChatRoot .attach-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  color: var(--text2);
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
#aiChatRoot .attach-btn:hover { color: var(--accent); }

/* Settings Panel (AI Gateway Studio Drawer) */
#aiChatRoot .overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.65);
  backdrop-filter: blur(4px);
  z-index: 200;
}
#aiChatRoot .overlay.active { display: block; }
#aiChatRoot .settings-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: min(620px, 96vw);
  height: 100vh;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  z-index: 201;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  overflow-y: auto;
  padding: 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
}
#aiChatRoot .settings-panel.active { transform: translateX(0); }
#aiChatRoot .settings-title {
  font-size: 1.15rem;
  font-weight: 800;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}
#aiChatRoot .settings-section {
  margin-bottom: 18px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 15px;
}
#aiChatRoot .settings-section h3 {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
#aiChatRoot .form-group { margin-bottom: 12px; }
#aiChatRoot .form-group:last-child { margin-bottom: 0; }
#aiChatRoot .form-group label {
  display: block;
  font-size: 0.78rem;
  color: var(--text2);
  margin-bottom: 5px;
  font-weight: 600;
}
#aiChatRoot .form-group input,
#aiChatRoot .form-group select,
#aiChatRoot .form-group textarea {
  width: 100%;
  padding: 9px 12px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  color: var(--text);
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.83rem;
  outline: none;
  transition: border-color 0.2s;
}
#aiChatRoot .form-group input:focus,
#aiChatRoot .form-group select:focus,
#aiChatRoot .form-group textarea:focus {
  border-color: var(--accent);
}
#aiChatRoot .form-group textarea { min-height: 74px; resize: vertical; }

/* Provider Chips Grid */
#aiChatRoot .provider-chips {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
}
#aiChatRoot .provider-chip {
  padding: 9px 11px;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--input-bg);
  color: var(--text);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  text-align: right;
  font-family: 'Vazirmatn', sans-serif;
  position: relative;
}
#aiChatRoot .provider-chip:hover {
  border-color: var(--accent);
  transform: translateY(-1px);
}
#aiChatRoot .provider-chip.active {
  background: linear-gradient(135deg, rgba(124, 108, 240, 0.24), rgba(56, 189, 248, 0.14));
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 4px 14px var(--accent-glow);
}
#aiChatRoot .provider-chip-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
}
#aiChatRoot .provider-chip-sub {
  font-size: 0.65rem;
  color: var(--text2);
  font-weight: 400;
}

/* Policy Cards */
#aiChatRoot .policy-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}
#aiChatRoot .policy-card {
  padding: 10px 12px;
  border-radius: 11px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
  text-align: right;
}
#aiChatRoot .policy-card:hover { border-color: var(--accent); }
#aiChatRoot .policy-card.active {
  border-color: var(--accent);
  background: rgba(124, 108, 240, 0.14);
}
#aiChatRoot .policy-card-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 3px;
}
#aiChatRoot .policy-card-desc {
  font-size: 0.66rem;
  color: var(--text2);
  line-height: 1.5;
}

#aiChatRoot .slider-group { display: flex; align-items: center; gap: 12px; }
#aiChatRoot .slider-group input[type="range"] { flex: 1; accent-color: var(--accent); }
#aiChatRoot .slider-value { font-size: 0.82rem; color: var(--accent); font-weight: 700; min-width: 32px; text-align: center; }

#aiChatRoot .test-btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'Vazirmatn', sans-serif;
}
#aiChatRoot .test-btn:hover { opacity: 0.9; transform: translateY(-1px); }
#aiChatRoot .test-status {
  font-size: 0.78rem;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  display: none;
  white-space: pre-line;
  line-height: 1.65;
}
#aiChatRoot .test-status.success { display: block; background: rgba(16, 185, 129, 0.14); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }
#aiChatRoot .test-status.error { display: block; background: rgba(244, 63, 94, 0.14); color: var(--danger); border: 1px solid rgba(244, 63, 94, 0.3); }

/* Usage Card */
#aiChatRoot .usage-card {
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}
#aiChatRoot .usage-card h4 { font-size: 0.82rem; margin-bottom: 10px; color: var(--text); }
#aiChatRoot .usage-bar {
  height: 8px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}
#aiChatRoot .usage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  border-radius: 4px;
  transition: width 0.3s;
}
#aiChatRoot .usage-stats { display: flex; justify-content: space-between; font-size: 0.74rem; color: var(--text2); }

/* Custom Models & Key Chips */
#aiChatRoot .custom-models-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
#aiChatRoot .custom-model-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  background: rgba(124, 108, 240, 0.14);
  border: 1px solid rgba(124, 108, 240, 0.32);
  color: var(--text);
  cursor: pointer;
}
#aiChatRoot .custom-model-pill .del-model {
  color: var(--danger);
  font-weight: 700;
  cursor: pointer;
  padding: 0 2px;
}

/* Image attached indicator */
#aiChatRoot .image-attached-bar {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(124, 108, 240, 0.12);
  border: 1px solid var(--accent);
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 0.76rem;
  color: var(--accent);
  flex-wrap: wrap;
}
#aiChatRoot .image-attached-bar.active { display: flex; }
#aiChatRoot .image-attached-bar button {
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--accent);
  color: #fff;
  border: none;
  cursor: pointer;
}

/* Lightbox & Help Panel */
#aiChatRoot .lightbox {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 300;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
#aiChatRoot .lightbox.active { display: flex; }
#aiChatRoot .lightbox img { max-width: 90vw; max-height: 90vh; border-radius: 12px; }

#aiChatRoot .help-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 300;
  align-items: center;
  justify-content: center;
}
#aiChatRoot .help-overlay.active { display: flex; }
#aiChatRoot .help-panel {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 18px;
  width: min(560px, 95vw);
  max-height: 85vh;
  overflow-y: auto;
  padding: 24px;
  animation: slideUp 0.25s ease;
}
#aiChatRoot .help-panel h2 { font-size: 1.1rem; color: var(--accent); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
#aiChatRoot .help-panel h3 { font-size: 0.9rem; color: var(--text); margin: 12px 0 6px; }
#aiChatRoot .help-panel p, #aiChatRoot .help-panel li { font-size: 0.8rem; color: var(--text2); line-height: 1.8; }
#aiChatRoot .help-panel ul { padding-right: 18px; }
#aiChatRoot .help-close {
  position: sticky;
  top: 0;
  float: left;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: var(--text);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
#aiChatRoot .help-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 10px;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

@media (max-width: 640px) {
  #aiChatRoot { font-size: 14px; height: calc(100dvh - 64px); border-radius: 12px; }
  #aiChatRoot .header { padding: 9px 12px; gap: 6px; }
  #aiChatRoot .policy-grid { grid-template-columns: 1fr; }
  #aiChatRoot .provider-chips { grid-template-columns: repeat(2, 1fr); }
  #aiChatRoot .message { max-width: 92%; }
  #aiChatRoot .settings-panel { padding: 14px; }
}
`;

export const AICHAT_HTML = `<div id="aiChatRoot" data-theme="dark">
<!-- Studio Header -->
<div class="header">
  <div class="logo-wrap">
    <div class="logo-orb" aria-hidden="true">✦</div>
    <div class="logo">AI Studio Pro <span>گیت‌وی هوشمند</span></div>
  </div>
  <div class="header-right">
    <span class="provider-badge" id="providerBadge">Gemini</span>
    <select id="quickPolicySelect" class="policy-pill-select" title="سیاست چرخش و توزیع کلیدهای API">
      <option value="round_robin">🔄 چرخش نوبتی (Round-Robin)</option>
      <option value="failover">🛡️ اولویت ترتیبی (Failover)</option>
      <option value="least_used">⚖️ کم‌مصرف‌ترین (Least-Used)</option>
      <option value="random">🎲 تصادفی متوازن (Random)</option>
    </select>
    <button type="button" class="studio-action-pill" id="quickAddModelBtn" title="افزودن مدل دستی به ارائه‌دهنده فعلی">+ مدل دستی</button>
    <button type="button" class="studio-action-pill" id="quickAddProviderBtn" title="افزودن ارائه‌دهنده سفارشی (Custom Provider با Base URL)">+ پروایدر سفارشی</button>
    <a href="https://mohsen-niksirat.github.io/Free-AI-Chat/" target="_blank" rel="noopener" class="full-chat-link" title="نسخه کامل چت هوش مصنوعی — ۲۳+ ارائه‌دهنده، تصویرسازی و ابزارهای بیشتر" style="display:inline-block;padding:6px 10px;border-radius:10px;background:linear-gradient(135deg,var(--accent),#7c6cf0);color:#fff;font-size:.72rem;font-weight:600;text-decoration:none;white-space:nowrap">🚀 نسخه کامل</a>
    <button class="icon-btn" id="helpBtn" title="راهنما">❓</button>
    <button class="icon-btn" id="themeToggle" title="تغییر تم">🌙</button>
    <button class="icon-btn" id="settingsBtn" title="تنظیمات و استخر کلیدها">⚙️</button>
  </div>
</div>

<!-- Chat Session Tabs -->
<div class="chat-tabs" id="chatTabs">
  <button class="new-chat-btn" id="newChatBtn">+ گفتگوی جدید</button>
</div>

<!-- Main Workspace -->
<div class="main" id="mainArea">
  <div class="messages-container" id="messagesContainer">
    <div class="quick-prompts" id="quickPrompts">
      <div class="welcome-hero">
        <h3>استودیو هوش مصنوعی لایتنر پرو-مکس</h3>
        <p>پشتیبانی از ۲۰+ ارائه‌دهنده معروف، افزودن پروایدر و مدل سفارشی، و استخر چندکلیدی با چرخش هوشمند (Round-Robin / Failover)</p>
      </div>
      <button class="quick-prompt" data-prompt="واژه زیر را کامل کالبدشکافی کن (معنی فارسی، فونتیک IPA، ریشه‌شناسی، هم‌خانواده‌ها، کالوکیشن‌ها و ۳ مثال کاربردی): ">کالبدشکافی واژه 📖</button>
      <button class="quick-prompt" data-prompt="ترجمه دقیق و طبیعی کن: ">ترجمه حرفه‌ای 🌐</button>
      <button class="quick-prompt" data-prompt="این متن انگلیسی را از نظر گرامر، طبیعی بودن و سطح آیلتس اصلاح کن و علت هر تغییر را بگو: ">تصحیح رایتینگ و گرامر ✏️</button>
      <button class="quick-prompt" data-prompt="یک داستان کوتاه و جذاب سطح B2 با این واژگان بساز و معنی فارسی آن را هم بنویس: ">داستان‌سازی با لغات 📚</button>
      <button class="quick-prompt" data-prompt="خلاصه و نکات کلیدی این متن را استخراج کن: ">خلاصه‌سازی هوشمند 📝</button>
      <button class="quick-prompt" data-prompt="توضیح ساده همراه با مثال بده درباره: ">توضیح مفهومی 💡</button>
      <button class="quick-prompt" data-prompt="تصویر بساز: ">تولید تصویر 🎨</button>
      <button class="quick-prompt" data-prompt="یک مکالمه کاربردی روزمره بنویس درباره: ">مکالمه کاربردی 💬</button>
      <button class="quick-prompt" data-prompt="۵ سوال چهارگزینه‌ای استاندارد (همراه با پاسخ تشریحی) طرح کن درباره: ">طراحی آزمون ❓</button>
    </div>
  </div>

  <!-- Quick Provider & Model Switch Bar -->
  <div class="quick-switch" id="quickSwitch">
    <div id="quickSwitchProviders" style="display:flex;align-items:center;gap:6px"></div>
    <div class="quick-model-wrap">
      <select id="quickModelSelect" title="انتخاب سریع مدل" style="padding:5px 10px;border-radius:10px;font-size:0.73rem;background:var(--card);color:var(--text);border:1px solid var(--border);outline:none;max-width:260px;cursor:pointer;direction:ltr"></select>
    </div>
  </div>

  <!-- Input Area -->
  <div class="input-area" id="inputArea">
    <div class="image-attached-bar" id="imageAttachedBar">
      🖼️ عکس ضمیمه شد — برای ویرایش، <button id="switchToGeminiEditBtn">🖼️ سوییچ به Gemini (رایگان)</button> یا <button id="switchToEditBtn" style="background:var(--text2)">✏️ Pollinations (نیاز به شارژ)</button>
    </div>
    <div class="attach-preview" id="attachPreview"></div>
    <div class="input-row">
      <div class="input-wrapper">
        <textarea id="messageInput" placeholder="پیام، واژه یا متن خود را بنویسید... (Enter = ارسال، Shift+Enter = خط جدید)" rows="1"></textarea>
        <div class="input-actions">
          <button class="attach-btn" id="attachBtn" title="پیوست تصویر">📎</button>
        </div>
      </div>
      <button class="send-btn" id="sendBtn" title="ارسال پیام">➤</button>
    </div>
    <input type="file" id="fileInput" multiple accept="image/*" style="display:none">
    <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.68rem;color:var(--text2);margin-top:6px;opacity:0.85;flex-wrap:wrap;gap:6px" id="pasteHint">
      <span>📋 پیوست تصویر با Ctrl+V یا کشیدن و رها کردن (Drag & Drop)</span>
      <span id="activePoolSummary"></span>
    </div>
  </div>
</div>

<!-- Settings & AI Gateway Drawer -->
<div class="overlay" id="overlay"></div>
<div class="settings-panel" id="settingsPanel">
  <div class="settings-title">
    <span>⚙️ تنظیمات هوش مصنوعی و گیت‌وی کلیدها</span>
    <button class="icon-btn" id="closeSettings" style="width:32px;height:32px;font-size:0.9rem">✕</button>
  </div>

  <!-- 1. Providers Grid -->
  <div class="settings-section">
    <h3>
      <span>۱. انتخاب ارائه‌دهنده (۲۰+ سرویس معروف + سفارشی)</span>
      <button type="button" class="studio-action-pill" id="toggleCustomProvFormBtn">+ افزودن پروایدر سفارشی</button>
    </h3>
    <div class="provider-chips" id="providerChips"></div>
  </div>

  <!-- 2. Custom Provider Creator / Editor -->
  <div class="settings-section" id="customProviderSection" style="border-color:var(--border-strong);background:linear-gradient(135deg,rgba(124,108,240,0.08),rgba(56,189,248,0.04))">
    <h3>
      <span>🛰️ افزودن / ویرایش ارائه‌دهنده سفارشی (Custom Provider)</span>
      <span style="font-size:0.68rem;color:var(--text2);font-weight:400">OpenAI / Ollama / vLLM / AvalAI / GapGPT / کلودفلر و...</span>
    </h3>
    <input type="hidden" id="customProvEditId" value="">
    <div style="display:grid;grid-template-columns:1fr 90px 1fr;gap:8px;margin-bottom:10px">
      <div class="form-group" style="margin-bottom:0">
        <label>نام ارائه‌دهنده</label>
        <input type="text" id="customProvName" placeholder="مثلاً AvalAI یا Ollama Local">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label>آیکون</label>
        <input type="text" id="customProvIcon" value="🛰️" style="text-align:center">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label>پروتکل API</label>
        <select id="customProvProtocol">
          <option value="openai">OpenAI Compatible (/v1/chat/completions)</option>
          <option value="gemini">Google Gemini Native (/v1beta/models)</option>
          <option value="anthropic">Anthropic Messages (/v1/messages)</option>
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>آدرس پایه (Base URL)</label>
      <input type="url" id="customProvBaseUrl" placeholder="https://api.avalai.ir/v1 یا http://localhost:11434/v1" dir="ltr" style="text-align:left;font-family:monospace">
    </div>
    <div class="form-group">
      <label>کلیدهای API (می‌توانید چند کلید وارد کنید — هر خط یک کلید)</label>
      <textarea id="customProvKeysInput" placeholder="sk-key-1&#10;sk-key-2&#10;(برای سرورهای محلی مثل Ollama می‌توانید خالی بگذارید)" dir="ltr" style="min-height:62px;font-family:monospace;font-size:0.78rem;text-align:left"></textarea>
    </div>
    <div class="form-group">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;gap:6px;flex-wrap:wrap">
        <label style="margin-bottom:0">لیست مدل‌ها (با کاما یا خط جدید جدا کنید)</label>
        <button type="button" class="studio-action-pill" id="fetchCustomProvModelsBtn" style="font-size:0.68rem;padding:3px 9px">🔄 استعلام خودکار مدل‌ها از Base URL</button>
      </div>
      <textarea id="customProvModelsInput" placeholder="gpt-4o-mini, claude-3-7-sonnet, deepseek-chat" dir="ltr" style="min-height:54px;font-family:monospace;font-size:0.78rem;text-align:left"></textarea>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:8px">
      <label style="display:flex;align-items:center;gap:6px;font-size:0.76rem;color:var(--text2);cursor:pointer">
        <input type="checkbox" id="customProvVision" checked style="width:auto;accent-color:var(--accent)"> پشتیبانی از ارسال تصویر (Vision)
      </label>
      <div style="display:flex;gap:6px">
        <button type="button" class="test-btn" id="resetCustomProvBtn" style="background:var(--card-hover);color:var(--text2);padding:7px 12px">پاک کردن فرم</button>
        <button type="button" class="test-btn" id="saveCustomProvBtn" style="background:var(--success)">➕ ثبت و فعال‌سازی پروایدر سفارشی</button>
      </div>
    </div>
    <div id="customProvidersManageList" style="margin-top:10px"></div>
  </div>

  <!-- 3. Model Selection & Manual Model Adder -->
  <div class="settings-section" id="modelManagerSection">
    <h3>
      <span>۲. انتخاب مدل و افزودن مدل دستی</span>
      <button type="button" class="studio-action-pill" id="fetchProviderModelsBtn" style="font-size:0.7rem;padding:3px 10px">🔄 دریافت لیست مدل‌ها از API</button>
    </h3>
    <div class="form-group">
      <label>مدل فعال برای <strong id="activeProviderModelLabel" style="color:var(--accent)">Gemini</strong></label>
      <select id="modelSelect" style="direction:ltr;text-align:left;font-family:monospace"></select>
    </div>
    <div style="background:var(--bg);border:1px dashed var(--border-strong);border-radius:11px;padding:11px;margin-top:10px">
      <div style="font-size:0.76rem;font-weight:700;color:var(--text);margin-bottom:8px">➕ افزودن مدل دلخواه / دستی به این ارائه‌دهنده</div>
      <div style="display:grid;grid-template-columns:1.3fr 1fr auto;gap:6px;align-items:center">
        <input type="text" id="customModelIdInput" placeholder="شناسه مدل (مثلاً gpt-4.1-mini یا gemini-2.5-pro)" dir="ltr" style="padding:8px 10px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.78rem;font-family:monospace">
        <input type="text" id="customModelLabelInput" placeholder="نام نمایشی (اختیاری)" style="padding:8px 10px;background:var(--input-bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.78rem">
        <button type="button" class="test-btn" id="addCustomModelBtn" style="padding:8px 12px;white-space:nowrap">+ افزودن مدل</button>
      </div>
      <div class="custom-models-chips" id="customModelsList"></div>
    </div>
  </div>

  <!-- 4. Multi-Key Pool & Rotation Policy Engine -->
  <div class="settings-section" id="keyPoolSection">
    <h3>
      <span>۳. سیاست چرخش کلیدها و استخر چندکلیدی (Multi-Key Pool)</span>
      <button type="button" class="studio-action-pill" id="resetCooldownsBtn" style="font-size:0.68rem;padding:3px 9px">♻️ ریست وضعیت استراحت کلیدها</button>
    </h3>

    <div class="form-group">
      <label>سیاست توزیع و چرخش کلید (Key Routing Policy)</label>
      <select id="keyPolicySelect" style="margin-bottom:8px">
        <option value="round_robin">🔄 چرخش نوبتی (Round-Robin) — توزیع نوبتی هر درخواست بین کلیدها</option>
        <option value="failover">🛡️ اولویت ترتیبی (Failover / Sticky) — کلید بعدی فقط در صورت خطا یا 429</option>
        <option value="least_used">⚖️ کم‌مصرف‌ترین کلید (Least-Used) — انتخاب کلید با کمترین مصرف</option>
        <option value="random">🎲 توزیع تصادفی (Random Load-Balance) — انتخاب تصادفی کلید سالم</option>
      </select>
      <div class="policy-grid" id="policyCardsGrid"></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;background:var(--bg);padding:10px;border-radius:10px;border:1px solid var(--border)">
      <div class="form-group" style="margin-bottom:0">
        <label>مدت استراحت کلید محدودشده (ثانیه)</label>
        <input type="number" id="keyCooldownSec" value="60" min="5" max="3600" step="5">
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label>ارائه‌دهنده پشتیبان (Fallback)</label>
        <select id="fallbackProviderSelect"></select>
      </div>
      <label style="grid-column:1 / -1;display:flex;align-items:center;gap:8px;font-size:0.76rem;color:var(--text);cursor:pointer">
        <input type="checkbox" id="autoRetryKeysToggle" checked style="width:auto;accent-color:var(--accent)">
        <span>تلاش مجدد خودکار و نامحسوس با کلید بعدی در صورت خطای 429 یا اتمام سهمیه (بدون توقف پیام)</span>
      </label>
    </div>

    <!-- Dynamic Active Provider Key Pool -->
    <div id="activeProviderKeyPoolBox" style="background:var(--bg);border:1px solid var(--border-strong);border-radius:12px;padding:12px;margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:8px">
        <label id="activeProviderKeyTitle" style="font-size:0.82rem;font-weight:700;color:var(--accent);margin:0">کلیدهای ارائه‌دهنده فعلی</label>
        <div style="display:flex;gap:6px;align-items:center">
          <a id="activeProviderKeyLink" href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="font-size:0.7rem;color:var(--accent);text-decoration:none">🔗 دریافت کلید API</a>
          <button type="button" class="studio-action-pill" id="toggleBulkKeysBtn" style="font-size:0.68rem;padding:2px 8px">📋 افزودن گروهی کلیدها</button>
        </div>
      </div>
      <div id="bulkKeysBox" style="display:none;margin-bottom:10px;padding:10px;background:var(--card);border-radius:10px;border:1px dashed var(--accent)">
        <div style="font-size:0.72rem;color:var(--text2);margin-bottom:6px">هر تعداد کلید API را وارد کنید (در هر خط یک کلید یا جداشده با ویرگول):</div>
        <textarea id="bulkKeysTextarea" placeholder="key-1&#10;key-2&#10;key-3" dir="ltr" style="width:100%;min-height:68px;padding:8px;border-radius:8px;background:var(--input-bg);color:var(--text);border:1px solid var(--border);font-family:monospace;font-size:0.76rem;text-align:left"></textarea>
        <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:6px">
          <button type="button" class="test-btn" id="applyBulkKeysBtn" style="padding:5px 12px;font-size:0.73rem;background:var(--success)">➕ افزودن همه به استخر کلید</button>
        </div>
      </div>
      <div id="activeProviderKeysDynamic"></div>
    </div>

    <!-- Quick Key Lists for Core Providers (also preserves #geminiKeysList, #openrouterKeysList, #groqKeysList, #pollinationsKeysList) -->
    <details id="allProvidersKeysAccordion" open style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:10px 12px">
      <summary style="cursor:pointer;font-size:0.78rem;font-weight:700;color:var(--text2);margin-bottom:10px">🔑 مدیریت سریع کلیدهای Gemini / OpenRouter / Groq / Pollinations</summary>
      <div class="form-group" id="geminiKeysGroup">
        <label>Gemini API Keys <span style="font-size:0.68rem;color:var(--accent)" id="geminiKeyCount"></span></label>
        <div id="geminiKeysList"></div>
        <button type="button" class="add-key-btn" onclick="addKeyField('gemini')" style="font-size:0.74rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:5px">+ افزودن کلید Gemini</button>
      </div>

      <div class="form-group" id="openrouterKeysGroup">
        <label>OpenRouter API Keys <span style="font-size:0.68rem;color:var(--accent)" id="openrouterKeyCount"></span></label>
        <div id="openrouterKeysList"></div>
        <button type="button" class="add-key-btn" onclick="addKeyField('openrouter')" style="font-size:0.74rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:5px">+ افزودن کلید OpenRouter</button>
      </div>

      <div class="form-group" id="groqKeysGroup">
        <label>Groq API Keys <span style="font-size:0.68rem;color:var(--accent)" id="groqKeyCount"></span></label>
        <div id="groqKeysList"></div>
        <button type="button" class="add-key-btn" onclick="addKeyField('groq')" style="font-size:0.74rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:5px">+ افزودن کلید Groq</button>
      </div>

      <div class="form-group" id="pollinationsKeysGroup">
        <label>Pollinations API Key <span style="font-size:0.68rem;color:var(--text2)">(اختیاری — برای ویرایش تصویر)</span> <span style="font-size:0.68rem;color:var(--accent)" id="pollinationsKeyCount"></span></label>
        <div id="pollinationsKeysList"></div>
        <button type="button" class="add-key-btn" onclick="addKeyField('pollinations')" style="font-size:0.74rem;color:var(--accent);background:none;border:1px dashed var(--accent);border-radius:8px;padding:4px 12px;cursor:pointer;margin-top:5px">+ افزودن کلید Pollinations</button>
      </div>
    </details>
  </div>

  <!-- 5. System Prompt & Generation Parameters -->
  <div class="settings-section">
    <h3>۴. پرامپت سیستم و پارامترهای تولید</h3>
    <div class="form-group">
      <label>دستورالعمل سیستم (System Prompt)</label>
      <textarea id="systemPrompt" placeholder="دستورالعمل سیستم...">شما یک دستیار هوش مصنوعی و استاد زبان مفید و دقیق هستید. به فارسی پاسخ دهید مگر اینکه کاربر زبان دیگری بخواهد.</textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-group" style="margin-bottom:0">
        <label>دما (Temperature)</label>
        <div class="slider-group">
          <input type="range" id="tempSlider" min="0" max="2" step="0.1" value="0.7">
          <span class="slider-value" id="tempValue">0.7</span>
        </div>
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label>حداکثر توکن خروجی</label>
        <input type="number" id="maxTokens" value="4096" min="256" max="65536" step="256">
      </div>
    </div>
  </div>

  <!-- 6. Custom Proxy (Vortex Gateway) -->
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
      درخواست‌های دارای کلید فقط از این پروکسی و مستقیم می‌روند و هرگز به پروکسی‌های عمومی ارسال نمی‌شوند.
    </div>
  </div>

  <!-- 7. Connection Test & Save -->
  <div class="settings-section">
    <h3>تست اتصال و ذخیره‌سازی</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
      <button class="test-btn" id="saveKeysBtn" style="background:var(--success)">💾 ذخیره کلیدها و تنظیمات</button>
      <button class="test-btn" id="testBtn">تست اتصال 🔗</button>
      <button class="test-btn" id="testProxyBtn" style="background:var(--card-hover);color:var(--text);border:1px solid var(--border);font-size:.75rem">تست پراکسی 🌐</button>
    </div>
    <div class="test-status" id="testStatus"></div>
  </div>

  <!-- 8. Export & Usage Statistics -->
  <div class="settings-section">
    <h3>خروجی و آمار مصرف</h3>
    <div style="display:flex;gap:8px;margin-bottom:12px">
      <button class="test-btn" id="exportTxt" style="background:var(--success)">خروجی TXT 📄</button>
      <button class="test-btn" id="exportJson" style="background:var(--warning);color:#1a1d2b">خروجی JSON 📦</button>
    </div>
    <div class="usage-card">
      <h4>مصرف روزانه</h4>
      <div class="usage-bar"><div class="usage-fill" id="usageFill" style="width:0%"></div></div>
      <div class="usage-stats">
        <span id="usageCount">0 / 500 پیام</span>
        <span id="usageDate">-</span>
      </div>
      <div style="margin-top:10px;font-size:0.75rem;color:var(--text2);line-height:1.7" id="providerUsage"></div>
    </div>
  </div>

  <!-- 9. Full Providers Reference Table -->
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
    <h2>❓ راهنمای AI Studio Pro</h2>

    <div class="help-section">
      <h3>🔄 استخر چندکلیدی و سیاست‌های چرخش (Key Pool Policies)</h3>
      <ul>
        <li>برای هر ارائه‌دهنده می‌توانید <b>بی‌نهایت کلید API</b> (تکی یا گروهی) ثبت کنید.</li>
        <li><b>Round-Robin (چرخش نوبتی):</b> هر پیام به نوبت با کلید بعدی ارسال می‌شود تا سقف محدودیت در تعداد کلیدها ضرب شود.</li>
        <li><b>Failover (اولویت ترتیبی):</b> همیشه از کلید اول استفاده می‌کند و در صورت خطای 429 به کلید بعدی می‌رود.</li>
        <li><b>Least-Used (کم‌مصرف‌ترین):</b> کلیدی که کمترین مصرف را داشته انتخاب می‌شود.</li>
        <li><b>Random (تصادفی):</b> ترافیک را تصادفی بین کلیدهای سالم پخش می‌کند.</li>
      </ul>
    </div>

    <div class="help-section">
      <h3>🛰️ افزودن پروایدر سفارشی و مدل دستی</h3>
      <ul>
        <li>در بخش تنظیمات می‌توانید هر سرویسی که از <b>OpenAI API</b>، <b>Gemini</b> یا <b>Anthropic</b> پشتیبانی می‌کند (مثل AvalAI، GapGPT، Ollama، LM Studio، OpenWebUI) را با <b>Base URL</b>، <b>کلیدهای API</b> و <b>مدل‌ها</b> اضافه کنید.</li>
        <li>با دکمه <b>«🔄 استعلام خودکار مدل‌ها»</b> لیست مدل‌های سرور به طور خودکار از <code>/v1/models</code> دریافت می‌شود.</li>
        <li>برای هر ارائه‌دهنده پیش‌فرض هم می‌توانید <b>مدل دستی</b> اضافه کنید.</li>
      </ul>
    </div>

    <div class="help-section" style="border-color:var(--success)">
      <h3>🖼️ تولید و ویرایش تصویر</h3>
      <ul>
        <li>برای تولید تصویر رایگان بدون کلید از <b>Pollinations</b> یا <b>Puter.js</b> استفاده کنید.</li>
        <li>برای ویرایش تصویر رایگان با کلید، <b>Gemini</b> و مدل <code>gemini-3.1-flash-image</code> را انتخاب کنید.</li>
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
