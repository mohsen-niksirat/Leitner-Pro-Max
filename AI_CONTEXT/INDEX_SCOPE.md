# Index Scope & Coverage — Leitner Pro Max

## Scope Summary
- **Analysis Mode**: INITIALIZE
- **Date of Indexing**: 2026-11-07
- **Git Commit Indexed**: `078a8623fd5186133a64edf4e54bbd7a7f585a37`
- **Working Tree State**: Clean (`main` branch)

## Inspected Components & Files
1. **Application Shell & Manifests**:
   - `index.html` (Application structure, viewports, script loaders)
   - `manifest.json` (PWA web manifest)
   - `service-worker.js` (PWA precache list and caching strategies)
   - `package.json` (Project metadata, scripts, test dependencies)
   - `playwright.config.js` (E2E test setup, headless server, ports)
   - `.gitignore` (Ignored files and build artifacts)
   - `README.md` (Project documentation in Persian, English, German, Turkish, Russian)
2. **Architecture Documentation**:
   - `docs/ARCHITECTURE.md` (Module extraction history and design notes)
   - `docs/architecture-graph.svg` (Visual architecture diagram)
3. **Core Modules (`js/core/`)**:
   - `js/app.js` (Root ES module, window global binding, SW registration)
   - `js/config.js` (App configuration, CDN URLs, storage keys)
   - `js/core/boot.js` (Bootstrap sequence, IDB hydration, theme listeners)
   - `js/core/constants.js` (System constants)
   - `js/core/dependencies.js` (Dynamic CDN script loading)
   - `js/core/error-handler.js` (Error boundary)
   - `js/core/utils.js` (Sanitization, esc, uid, date helpers)
4. **Storage & State (`js/storage/`)**:
   - `js/storage/indexeddb.js` (Low-level IndexedDB methods)
   - `js/storage/state.js` (Global state `S`, default schema, hydration, debounced save)
   - `js/storage/backup.js` (Local backup snapshots, shared deck exports)
5. **Learning & Algorithms (`js/learning/`)**:
   - `js/learning/fsrs.js` (FSRS-5 weights, retrievability, difficulty, stability, interval fuzzing)
   - `js/learning/review.js` (Review session management, rating handling)
   - `js/learning/quiz.js` (Interactive quizzes and proficiency tests)
   - `js/learning/word-drill.js` (Drills and memory tricks)
   - `js/learning/review-modes.js` (Speed review and listening mode)
6. **Vocabulary & Content (`js/vocabulary/`)**:
   - `js/vocabulary/card-repository.js` (In-memory indexed card repository)
   - `js/vocabulary/card-repository-bridge.js` (Singleton bridge)
   - `js/vocabulary/vocabulary.js` (Card creation, CEFR tiers, indexing)
   - `js/vocabulary/enrichment.js` (Dictionary and translation services, caching)
   - `js/vocabulary/library.js` (Card explorer and long-term memory view)
   - `js/vocabulary/import.js` & `export.js` (Multi-format import/export)
   - `js/vocabulary/packs.js` (CEFR graded vocabulary packs)
   - `data/cefr.json` & `All_Vocabulary_Packs/SUMMARY.md` (Vocabulary pack statistics)
7. **AI & Speech (`js/ai/`)**:
   - `js/ai/providers.js` (LLM provider specifications, models, key rotation)
   - `js/ai/ai-manager.js` (AI chat controller, streaming output)
   - `js/ai/speakai-coach.js` (SpeakAI Coach bridge)
   - `speakai/index.html` (Bundled offline SpeakAI Coach SPA)
   - `vortex/README-fa.md` (Vortex CORS/proxy gateway)
8. **PDF, Reading & UI (`js/pdf/`, `js/reading/`, `js/ui/`)**:
   - `js/pdf/reader.js` & `js/pdf/pdf-mobile.js` (Desktop and mobile PDF readers)
   - `js/reading/reading.js` (Text reading comprehension)
   - `js/ui/navigation.js` (Navigation groups and view rendering dispatch)
   - `js/ui/dashboard.js`, `js/ui/settings.js`, `js/ui/toast.js`, `js/ui/translation-popup.js`
   - `js/ui/vocabforge-ui.js` & `js/ui/help-vocabforge.js` (VocabForge UI and extraction engine)
9. **Tests**:
   - `tests/smoke.spec.js`, `tests/audit.spec.js`
   - `tests/unit/*.test.js` (All 6 unit test files)

## Deliberately Excluded
- `node_modules/` (Third-party npm packages).
- `test-results/` & `playwright-report/` (Ephemeral test output and traces).
- Minified compilation bundles in `speakai/assets/` (`index-BGdXxZBY.js`, `index-D7YQiTcT.css`).
- Static screenshot image files (`screenshots/`).
- Binary icon files (`icons/`).

## Verification Commands Executed
- `npm run syntax` — Confirmed syntax validity across core modules.
- `npm run test:unit` — Confirmed passing status across all 6 unit test suites.
- `git status` — Confirmed clean git working tree on `main`.

## Known Coverage Limitations & Uncertainties
- Playwright E2E suites were verified by static configuration inspection rather than a full headless browser execution in this turn to avoid long-running background tasks.
- Remote Google Drive sync and live AI provider APIs require valid runtime credentials configured by the user at runtime.
