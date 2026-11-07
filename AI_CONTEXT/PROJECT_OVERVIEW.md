# Project Overview — Leitner Pro Max

## Purpose & Scope
Leitner Pro Max (نسخه ۵.۰ — مرور هوشمند واژگان) is a high-performance, privacy-first, client-side language learning platform and smart flashcard trainer. It integrates the scientific FSRS-5 (Free Spaced Repetition Scheduler) algorithm, multi-provider AI text and vision chat, an interactive speaking partner (SpeakAI Coach), dual-mode PDF reader (desktop and mobile), VocabForge automatic word extraction and enrichment engine, CEFR-graded vocabulary packs (A1 through C2), quiz modules, semantic word web, and detailed learning analytics.

The application runs entirely within the user's browser, persisting state locally without mandatory server infrastructure, and is deployed as an offline-first Progressive Web App (PWA) on GitHub Pages.

## Product Shape & Deployment
- **Deployment Target**: GitHub Pages (`https://mohsen-niksirat.github.io/Leitner-Pro-Max/`)
- **Distribution Model**: Static single-page application (SPA) with PWA installability (desktop and mobile)
- **Primary Interface**: Persian (RTL) localized UI with multi-theme support (Dark, Light, Ocean, Forest, Sunset, Lavender, High-Contrast, and Custom)
- **Documentation Languages**: Persian, English, German, Turkish, Russian

## Technology Stack & Runtime
- **Runtime**: Modern web browser supporting native ECMAScript 2022+ modules and Service Workers.
- **Languages**: Native JavaScript (ES6+ Modules), HTML5, CSS3.
- **Spaced Repetition Algorithm**: FSRS-5 with 17 tuned parameter weights (`FSRS_W`), interval fuzzing, and legacy SM-2 fallback.
- **Persistence Layer**:
  - Primary store: Browser IndexedDB (`leitnerDB`, store `data`) as the sole source of truth.
  - Backup store: Automatic snapshots in IndexedDB (`leitner_backup_db`).
  - Legacy migration: One-time automatic migration from legacy localStorage keys (`leitner_v2`, `leitner_v1`, `leitner_state`).
  - Cloud backup: Optional Google Drive integration via Google Identity Services (`GIS`).
- **Dynamic CDN Libraries**:
  - Chart.js v4 (Learning statistics, accuracy, XP, and forecasts)
  - PDF.js v3.11.174 (Desktop canvas and text layer PDF rendering)
  - JSZip v3.10.1 (Anki package and multi-file export/import)
- **AI Integrations**:
  - Google Gemini (Gemini 3.8 Flash, 3.7 Flash, 3.6 Flash, 3.5, 3.1 Pro/Flash, 2.5 Pro/Flash, 2.0 Flash)
  - OpenRouter (Free models: Nemotron, Gemma, DeepSeek R1/Chat, Llama 3.3, Qwen 2.5)
  - Groq (Llama 3.3 70B, Qwen 2.5)
  - Pollinations AI (Keyless free tier)
  - Puter (AI Image Generation)
  - Optional Vortex Gateway proxy (`vortex/`) for bypassing geo-restrictions with CORS and Bearer auth.
- **Integrated Sub-Apps**:
  - **SpeakAI Coach**: Standalone React/Vite SPA bundled in `speakai/` for voice conversation, IELTS examination simulations, and shadowing practice, with bidirectional message bridging.

## Verified Verification & Execution Commands
- **Local Development**:
  ```bash
  python -m http.server 8000
  ```
  *(Must be served over HTTP/HTTPS; `file://` protocol breaks ES Modules and Service Workers).*
- **Syntax Validation**:
  ```bash
  npm run syntax
  ```
  *(Runs `node --check` against `js/app.js`, `js/core/boot.js`, `js/learning/fsrs.js`, and `js/ai/ai-manager.js`).*
- **Unit Tests**:
  ```bash
  npm run test:unit
  ```
  *(Runs native `node --test tests/unit/*.test.js` covering contracts, modules, performance with 10,000 cards, repositories, runtime guards, and services).*
- **Playwright End-to-End Tests**:
  ```bash
  npm test
  # or
  npm run test:e2e
  ```
- **Headed Playwright Tests**:
  ```bash
  npm run test:headed
  ```
- **Playwright Browser Dependency Installation**:
  ```bash
  npm run test:install
  ```

## Major Constraints & Invariants
1. **Zero External Backend Mandatory**: All state must persist in client IndexedDB; no proprietary server is required for core learning features.
2. **Service Worker Precache Synchronization**: Any added, removed, or renamed module in `js/` or `css/` must be mirrored in `service-worker.js`'s `PRECACHE_URLS` array and versioned in `CACHE_NAME` aligned with `js/config.js`.
3. **Window Global Compatibility**: While modules use ES import/export internally, `js/app.js` binds key functions to `window` to support declarative inline HTML event handlers (`onclick=...`) and cross-module dispatch.
4. **Offline Capability**: Flashcard reviews, quizzes, library lookups, cached dictionary results, and reading functions must remain fully operational without network connectivity.

## Known Unknowns & External Dependencies
- Quota availability and geographic IP availability for user-provided API keys (Gemini, Groq, OpenRouter).
- Potential browser-specific IndexedDB quota evictions under extreme device storage pressure (mitigated by automated state snapshot downloads).
