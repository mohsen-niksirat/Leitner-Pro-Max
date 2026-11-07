# Module Index & Interface Specifications — Leitner Pro Max

## 1. Core Domain (`js/core/`)

### `js/core/boot.js`
- **Purpose**: Application lifecycle bootstrap, legacy storage migration, sidebar control, and theme synchronization.
- **Dependencies**: `js/storage/indexeddb.js`, `js/storage/state.js`, `js/vocabulary/vocabulary.js`, `js/ui/navigation.js`, `js/ui/tags-drive.js`, `js/ui/toast.js`.
- **Key Symbols**:
  - `bootApp()`: Hydrates state from IndexedDB or executes one-time migration from `localStorage`, then initializes UI and listeners.
  - `applyTheme()`: Applies active theme tokens to `document.documentElement`.
  - `syncSidebarUI()`: Synchronizes sidebar open/closed state with viewport width and mobile overlays.
  - `closeMobileSidebar()`: Closes sidebar on mobile viewport upon navigation.
  - `updateLockBtn()`: Updates UI state of the desktop sidebar lock button.

### `js/core/constants.js`
- **Purpose**: Centralized application constants.
- **Key Symbols**:
  - `MS_PER_DAY`: Milliseconds per day ($86,400,000$).
  - `PDF_DEFAULT_SCALE`: Default rendering scale ($1.2$) for desktop PDF canvas.
  - `PDF_THUMB_SCALE`: Thumbnail rendering scale ($0.2$).
  - `FSRS_DECAY_COEFF`: Power-law retention decay coefficient.
  - `LIST_PAGE_SIZE`: Standard pagination chunk size ($50$ items).

### `js/core/dependencies.js`
- **Purpose**: Asynchronous dynamic loading of heavy external CDN dependencies.
- **Key Symbols**:
  - `loadDep(url)`: Generic Promise-based script tag injector.
  - `ensureChartJs()`: Loads Chart.js v4 on demand when navigating to analytics.
  - `ensurePdfJs()`: Loads PDF.js v3 on demand when opening PDF readers.
  - `ensureJsZip()`: Loads JSZip on demand for Anki and archive imports/exports.

### `js/core/error-handler.js`
- **Purpose**: Global runtime error boundary and crash reporter.
- **Key Symbols**:
  - `withErrorBoundary(fn, fallback)`: Wraps asynchronous and synchronous execution blocks in safe try/catch handlers.

### `js/core/utils.js`
- **Purpose**: Pure utility functions for string escaping, IDs, and date math.
- **Key Symbols**:
  - `esc(str)`: Escapes HTML entities to prevent XSS injection.
  - `errMsg(err)`: Standardizes error messages from diverse error types.
  - `uid()`: Generates unique alphanumeric identifiers.
  - `fmtDate(d)`: Formats dates for human-readable display.
  - `todayKey()`: Returns ISO date string `YYYY-MM-DD` for daily tracking.

---

## 2. Storage & Persistence Domain (`js/storage/`)

### `js/storage/indexeddb.js`
- **Purpose**: Low-level IndexedDB abstraction.
- **Key Symbols**:
  - `openDB()`: Opens or initializes `leitnerDB` object store `data`.
  - `idbPut(key, value)`: Asynchronously writes a value by key.
  - `idbGet(key)`: Asynchronously retrieves a stored record by key.
  - Constants: `IDB_NAME`, `IDB_STORE`, `SCHEMA_VERSION`, `LS_KEY`, `LS_KEY_V1`.

### `js/storage/state.js`
- **Purpose**: Application state management, reactivity, and sanitization.
- **Dependencies**: `js/storage/indexeddb.js`, `js/core/constants.js`.
- **Key Symbols**:
  - `S`: Global reactive proxy / getter referencing the active application state.
  - `defaultState()`: Returns fresh default application state schema.
  - `hydrateState(raw)`: Validates and sanitizes raw state from storage.
  - `save()`: Debounced save trigger to persist `S` to IndexedDB.
  - `saveNow()`: Immediate un-debounced save trigger for critical paths.
  - `loadFromIDB()`: Retrieves persisted state from IndexedDB.
  - `loadLegacyState()`: Checks and parses legacy `localStorage` keys for migration.
  - `sanitizeCard(card)`: Validates flashcard fields, setting sane defaults for FSRS attributes.

### `js/storage/backup.js`
- **Purpose**: Automated backup snapshots, deck sharing, and rollback management.
- **Key Symbols**:
  - `autoBackup()`: Creates rotating local state snapshots in `leitner_backup_db`.
  - `listSnapshots()`: Enumerates available historical backups.
  - `restoreSnapshot(id)`: Replaces current state with an archived snapshot.
  - `exportStateSnapshot()`: Exports full database state to downloadable JSON.
  - `importStateSnapshot(json)`: Imports and hydrates a complete database snapshot.
  - `exportSharedDeck(cards)`: Packs a subset of cards for peer sharing.
  - `importSharedDeck(data)`: Merges shared deck cards into the active collection.

---

## 3. Learning & Spaced Repetition Domain (`js/learning/`)

### `js/learning/fsrs.js`
- **Purpose**: Scientific spaced repetition algorithm implementation (FSRS-5).
- **Key Symbols**:
  - `FSRS_W`: 17-parameter weights array tuned for flashcard memory retention.
  - `fsrsRetrieveProbability(stability, elapsed)`: Calculates recall probability $R$.
  - `fsrsInitialDifficulty(rating)`: Determines initial difficulty $D_0 \in [1, 10]$.
  - `fsrsInitialStability(rating)`: Computes base stability for new cards.
  - `fuzzInterval(interval)`: Applies $\pm 5\%$ random jitter to prevent review clustering.
  - `fsrsNext(card, rating)`: Core FSRS state transition function returning next review date, updated stability, difficulty, reps, and lapses.
  - `sm2Legacy(card, grade)`: Legacy SuperMemo-2 calculation for backward compatibility.
  - `mapRating(key)`: Normalizes UI ratings (`Again`, `Hard`, `Good`, `Easy`).

### `js/learning/review.js`
- **Purpose**: Active review session controller, keyboard navigation, and card queue management.
- **Dependencies**: `js/learning/fsrs.js`, `js/storage/state.js`, `js/vocabulary/vocabulary.js`.
- **Key Symbols**:
  - `startReview()`: Initializes review queue based on due dates and priority filters.
  - `renderReview(container)`: Renders flashcard surface, front/back flip, and action controls.
  - `rateReview(rating)`: Applies grading, runs FSRS calculations, updates card state, and triggers `save()`.
  - `getDue()` / `dueCards()`: Filters words that have reached or passed their scheduled review time.
  - `prioritizeReviewQueue(cards)`: Sorts review queue prioritizing lapses and oldest due dates.
  - Auto-play controls: `startAutoPlay()`, `stopAutoPlay()`, `renderAutoPlayBar()`.

### `js/learning/quiz.js`
- **Purpose**: Quiz testing engine.
- **Key Symbols**:
  - `renderQuiz(container)`: Renders interactive quiz interface (Multiple choice, Spelling, Fill-in-the-blank).
  - `startQuiz(options)`: Initiates a scored quiz session.
  - `submitQuizAnswer(answer)`: Evaluates user input and records metrics into `S.quizStats`.
  - `renderEngQuiz(container)`: English proficiency CEFR assessment quiz.

### `js/learning/word-drill.js` & `js/learning/review-modes.js`
- **Purpose**: Specialized review mechanics.
- **Key Symbols**:
  - `openWordDrill(wordId)`: Modal drill for deep memory encoding.
  - `getMemoryTrick(word)` / `getUsageTip(word)`: Mnemonic generation.
  - `renderSpeedReview()`: Timed rapid-fire review mode.
  - `renderListening()`: Audio-only listening comprehension drill.

---

## 4. Vocabulary & Card Management Domain (`js/vocabulary/`)

### `js/vocabulary/vocabulary.js`
- **Purpose**: Flashcard creation, frequency categorization, and word indexing.
- **Key Symbols**:
  - `createCard(options)`: Factory for creating standardized card objects with default FSRS attributes.
  - `rebuildIndex()`: Re-indexes cards into internal lookup caches.
  - `wordExists(word)`: Checks if a word already exists in `words` or `longTerm`.
  - `getFrequencyTier(rank)`: Maps word rank to CEFR frequency tier (T1, T2, T3).

### `js/vocabulary/card-repository.js` & `card-repository-bridge.js`
- **Purpose**: In-memory indexed repository for $O(1)$ duplicate checks and CRUD operations.
- **Key Symbols**:
  - `buildCardRepository({ state, cardFactory })`: Factory producing an indexed repository over `state.words` and `state.longTerm`.
  - `getCardRepository()`: Returns the global repository singleton.
  - `repoAdd(card, target)`: Safe add operation validating uniqueness before mutation.

### `js/vocabulary/enrichment.js`
- **Purpose**: Multi-source dictionary and translation service.
- **Dependencies**: `js/storage/indexeddb.js` (for persistent cache).
- **Key Symbols**:
  - `fetchDictionary(word)`: Queries Free Dictionary API with retry and fallback.
  - `fetchTranslation(text, from, to)`: Queries translation endpoints with language detection.
  - `fetchPersianTranslation(word)`: Translates English lemmas into Persian.
  - `fetchEtymology(word)`: Retrieves etymological roots and morphological family.
  - `suggestCollocations(word)`: Returns common collocations.
  - `flushLookupCaches()`: Clears expired or all cached dictionary lookups from IndexedDB.

### `js/vocabulary/library.js`
- **Purpose**: Interactive card deck explorer, bulk operations, and long-term memory archive.
- **Key Symbols**:
  - `renderLibrary(container)`: Renders searchable, filterable paginated card table.
  - `renderLongterm(container)`: Renders mastered long-term memory archive.
  - Card edit/delete/move actions: `editCardModal()`, `moveToLongTerm()`, `restoreToActive()`.

### `js/vocabulary/import.js`, `import-pdf.js`, `export.js`, `packs.js`
- **Purpose**: Multi-format data ingress and egress.
- **Key Symbols**:
  - `renderImport()`: Multi-step wizard supporting Plain Text, CSV, JSON, Anki (.apkg), and DOCX.
  - `renderExport()`: Exporter supporting JSON backup, CSV spreadsheet, and Anki package formats.
  - `renderPacks()`: One-click installer for built-in CEFR vocabulary packs (A1 to C2).

---

## 5. AI & Voice Domain (`js/ai/`)

### `js/ai/ai-manager.js`
- **Purpose**: AI chat coordinator, streaming response handler, and multi-session chat manager.
- **Dependencies**: `js/ai/providers.js`, `js/ai/speakai-coach.js`.
- **Key Symbols**:
  - `renderAiChat(container)`: Main AI chat interface with markdown formatting, code highlights, and token meters.
  - `sendAiMessage(prompt)`: Dispatches prompt to active provider with fallback and streaming rendering.

### `js/ai/providers.js`
- **Purpose**: Unified API drivers and model definitions for LLM providers.
- **Key Symbols**:
  - `PROVIDERS`: Manifest of supported providers (Gemini, OpenRouter, Groq, Pollinations).
  - `MODELS`: Comprehensive model catalogs for each provider.
  - `DEFAULT_CHAT_STATE`: Default configuration schema for AI sessions.
  - Key rotation mechanisms: Cycles across configured API keys upon hitting rate limit (HTTP 429) errors.

### `js/ai/speakai-coach.js`
- **Purpose**: Voice speaking partner and shadowing coach integration.
- **Key Symbols**:
  - `renderSpeakAi(container)`: Embeds SpeakAI Coach in an iframe, resolving live GitHub Pages deployment or local `speakai/index.html` fallback.
  - `importSpeakAiCardsToLeitner(rawCards)`: Converts words captured during spoken conversation into Leitner flashcards.

---

## 6. Document & Reading Domain (`js/pdf/`, `js/reading/`)

### `js/pdf/reader.js` & `pdf-mobile.js`
- **Purpose**: PDF reading and instant word lookup.
- **Dependencies**: PDF.js (dynamically loaded via `dependencies.js`).
- **Key Symbols**:
  - `renderPdfReader(container)`: Desktop PDF viewer with canvas rendering, zoom controls, and text layer selection.
  - `renderPdfMobile(container)`: Optimized mobile PDF reading interface.
  - `loadPdf(fileOrUrl)`: Asynchronously parses PDF documents.

### `js/reading/reading.js`
- **Purpose**: Clean text reading environment with tap-to-translate.
- **Key Symbols**:
  - `renderReading(container)`: Formats loaded text with word-by-word interactive lookup.

---

## 7. Statistics & Analytics Domain (`js/statistics/`)

### `js/statistics/statistics.js`, `calendar.js`, `leaderboard.js`
- **Purpose**: Gamification and visual metrics tracking.
- **Key Symbols**:
  - `renderStats(container)`: Renders Chart.js charts for recall accuracy, XP levels, and retention forecasts.
  - `buildHeatmap()`: GitHub-style daily learning activity heatmap.
  - `renderCalendar(container)`: Monthly view showing past and scheduled reviews.
  - `renderLeaderboard(container)`: Local achievement leaderboard.

---

## 8. User Interface & Orchestration Domain (`js/ui/`)

### `js/ui/navigation.js`
- **Purpose**: Primary router and view dispatcher.
- **Key Symbols**:
  - `NAV_GROUPS`: Structural hierarchy of navigation groups (یادگیری, منابع, ورود/خروج, خواندن, ابزارها, سیستم).
  - `currentTab`: State property tracking the active tab identifier.
  - `renderNav()`: Renders sidebar navigation buttons.
  - `render()`: Central view dispatching function that renders the active tab into `#content`.

### `js/ui/vocabforge-ui.js` & `help-vocabforge.js`
- **Purpose**: VocabForge text extraction and auto-enrichment studio.
- **Key Symbols**:
  - `renderVocabforge(container)`: VocabForge workbench UI.
  - `extractWords(text)`: Tokenizes text, filters stop words, and matches against CEFR database.
  - Auto-enrichment queue: Fetches phonetics, translations, and examples for selected word candidates.

### `js/ui/tags-drive.js`
- **Purpose**: Tag taxonomy management and Google Drive synchronization.
- **Key Symbols**:
  - `openTagManager()`: Modal tag editor.
  - `syncNow()` / `restoreFromDrive()`: Google Drive cloud sync operations via GIS client.
