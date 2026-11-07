# Project Map — Leitner Pro Max

## Entry Points
- `index.html`: Main application HTML shell, metadata, CSS stylesheet links, viewport/PWA headers, root layout, and ES Module entry script.
- `js/app.js`: Master ES module entry point; imports submodules, binds global API methods onto `window`, registers the Service Worker, and triggers `bootMod.bootApp()`.
- `js/core/boot.js`: Bootstrap execution sequence; hydrates state from IndexedDB (or migrates legacy localStorage), binds navigation/sidebar DOM events, initializes theme, and restores active session state.
- `service-worker.js`: Cache manifest (`PRECACHE_URLS`), runtime caching strategy, cache activation, and offline network fallbacks.
- `manifest.json`: Web app manifest configuration (app name, theme colors, icons, display mode).
- `speakai/index.html`: Self-contained SpeakAI Coach SPA entry point (React/Vite bundle fallback).

## Directory Structure & Responsibilities

### `js/` — Application Modules
- **`js/core/`**: Core infrastructure and bootstrapping.
  - `boot.js`: Bootstrap logic, legacy migration, DOM event listeners for sidebar/theme.
  - `constants.js`: System constants (`MS_PER_DAY`, `PDF_DEFAULT_SCALE`, `PDF_THUMB_SCALE`, `FSRS_DECAY_COEFF`, `LIST_PAGE_SIZE`).
  - `dependencies.js`: Dynamic CDN script loaders for Chart.js, PDF.js, and JSZip.
  - `error-handler.js`: Error boundary wrapper (`withErrorBoundary`).
  - `events.js`: Central event bus / pub-sub utilities.
  - `utils.js`: Formatting, sanitization, UID generation (`esc`, `uid`, `fmtDate`, `todayKey`).
- **`js/storage/`**: Persistence and synchronization.
  - `indexeddb.js`: IndexedDB wrapper (`openDB`, `idbPut`, `idbGet`).
  - `state.js`: Global state management, reactive `S` object, `save()`, `hydrateState()`, legacy migration.
  - `backup.js`: Automated backups, snapshot management, shared deck import/export.
  - `local-storage.js`: LocalStorage accessor and fallbacks.
  - `migration.js`: State schema upgrade and migration helpers.
  - `state-repository.js`: State persistence abstraction.
- **`js/learning/`**: Learning algorithms, sessions, and drills.
  - `fsrs.js`: FSRS-5 spaced repetition model, weights, interval calculation, fuzzing, SM-2 compatibility.
  - `review.js`: Review session lifecycle, rating handlers, keyboard navigation, auto-play queue.
  - `quiz.js`: Four-choice, spelling, fill-in-the-blank, and English proficiency level tests.
  - `word-drill.js`: Focused drills, memory tricks, usage tips, and auto-generated quizzes.
  - `review-modes.js`: Speed review mode and listening practice mode.
  - `review-library.js`: Review queue assembly and filter helpers.
  - `progress.js`: XP calculations, level tracking, streak tracking.
  - `learning-service.js`: Domain service coordinating learning operations.
- **`js/vocabulary/`**: Vocabulary repository and card lifecycle.
  - `vocabulary.js`: Card factory (`createCard`), word existence checks, CEFR frequency tiers.
  - `card-repository.js`: O(1) indexed card repository with deduplication and collection management.
  - `card-repository-bridge.js`: Global singleton bridge for `cardRepository`.
  - `enrichment.js`: External dictionary lookups, Persian translation, etymology, collocations, morphology, and IndexedDB cache management.
  - `library.js`: Deck browser, active search/filter, card editing, and long-term memory archive.
  - `import.js`: Import wizard (plain text, CSV, JSON, Anki, DOCX).
  - `import-pdf.js`: Word extraction from PDF files.
  - `export.js`: Backup exporter (JSON, CSV, Anki).
  - `packs.js`: Bundled CEFR vocabulary pack installer.
  - `vocabulary-service.js`: Domain service coordinating card creation and updates.
- **`js/ai/`**: Artificial Intelligence & Assistant integrations.
  - `ai-manager.js`: AI chat manager, message streaming, provider key rotation, session persistence.
  - `providers.js`: Supported providers (Gemini, OpenRouter, Groq, Pollinations), model catalogs, and API payload formatters.
  - `speakai-coach.js`: Bridge for SpeakAI Coach voice assistant; manages iframe embed and postMessage card imports.
  - `chat-template.js`: Chat UI templates and message bubbles.
  - `image-generation.js`: AI image generation client (Puter/Gemini).
  - `prompts.js`: System prompts for vocabulary tutoring and language practice.
  - `quiz-ai.js`: Dynamic AI-generated quiz questions.
- **`js/pdf/`**: PDF viewer and interaction layer.
  - `reader.js`: Desktop PDF reader utilizing PDF.js canvas and selectable text layer.
  - `pdf-mobile.js`: Mobile-tailored PDF viewing and tap-to-translate interface.
  - `renderer.js`: PDF page rendering coordination.
  - `selection.js`: PDF text selection and range extraction.
  - `translation.js`: Selected text translation overlay.
- **`js/reading/`**: Reading comprehension.
  - `reading.js`: Text reader view with click-to-translate and vocabulary extraction.
  - `reading-export-stats.js`: Reading statistics and vocabulary export helpers.
- **`js/statistics/`**: Progress tracking and analytics.
  - `statistics.js`: Activity charts, review heatmap, retention forecast.
  - `calendar.js`: Daily review calendar view.
  - `charts.js`: Chart.js rendering wrappers.
  - `forecast.js`: Future workload prediction model.
  - `heatmap.js`: Contribution/activity heatmap visualizer.
  - `leaderboard.js`: Local score leaderboard.
- **`js/ui/`**: User interface components and presentation.
  - `navigation.js`: Navigation groups (`NAV_GROUPS`), active tab switching (`render()`), sidebar control.
  - `dashboard.js`: Daily challenge widget, release notes, and about page.
  - `settings.js`: User preferences, theme switching, storage meter, backup triggers.
  - `settings-tools.js`: Diagnostic and maintenance tools.
  - `toast.js`: Toast notifications and word addition feedback.
  - `translation-popup.js`: Floating translation popup for highlighted text.
  - `tags-drive.js`: Tag manager and Google Drive cloud synchronization.
  - `vocabforge-ui.js` & `help-vocabforge.js`: VocabForge text extraction and auto-enrichment wizard.
  - `modals.js`: Reusable modal dialogs.
  - `learning-ui.js`: Learning UI presentation helpers.
  - `vocabulary-ui.js`: Vocabulary table UI helpers.
  - `pdf-ui.js`: PDF toolbars and control bindings.
- **`js/word-web/`**: Semantic relationship graph.
  - `word-web.js`: Interactive canvas-based concept map showing word relationships.

### Supporting Directories
- **`css/`**: Component and layout styles (`app.css`, `base.css`, `learning.css`, `accessibility.css`, `statistics.css`, `reading.css`, `components.css`, `responsive.css`).
- **`data/`**: Static datasets (`cefr.json` with CEFR word frequencies and levels).
- **`docs/`**: Architecture diagrams and documentation (`ARCHITECTURE.md`, `architecture-graph.svg`, `architecture-graph.png`).
- **`icons/`**: PWA icons (`icon-192.png`, `icon-512.png`).
- **`speakai/`**: Self-contained React/Vite bundle of the SpeakAI Coach application.
- **`tests/`**: Playwright E2E suites (`smoke.spec.js`, `audit.spec.js`, `pdf.spec.js`, `vocabforge.spec.js`, `ai-chat.spec.js`, `vortex-proxy.spec.js`, `runtime-tabs.spec.js`, `pdf-hit-test.spec.js`, `pdf-selection.spec.js`).
- **`tests/unit/`**: Node.js unit tests (`contracts.test.js`, `modules.test.js`, `performance.test.js`, `repositories.test.js`, `runtime-guards.test.js`, `services.test.js`).
- **`vortex/`**: Configuration and scripts for deploying a self-hosted Vortex Gateway CORS/proxy server (`apply-patch.py`, `deploy-railway.sh`, `deploy-docker.sh`, `docker-compose.yml`, `README-fa.md`).
- **`All_Vocabulary_Packs/`**: Pre-built vocabulary packs documentation (`SUMMARY.md`).

## Where to Look for Common Changes
- **Spaced Repetition / FSRS logic**: Check `js/learning/fsrs.js` and `js/learning/review.js`.
- **Card Schema & Deduplication**: Check `js/storage/state.js` and `js/vocabulary/card-repository.js`.
- **Adding or modifying AI providers/models**: Check `js/ai/providers.js` and `js/ai/ai-manager.js`.
- **SpeakAI Coach integration**: Check `js/ai/speakai-coach.js` and `speakai/`.
- **Navigation tabs and page dispatch**: Check `js/ui/navigation.js` and `index.html`.
- **PWA offline caching**: Check `service-worker.js` (`PRECACHE_URLS`) and `js/config.js` (`version`).
- **Dictionary & Translation APIs**: Check `js/vocabulary/enrichment.js`.
