# Current State — Leitner Pro Max

## Repository State
- **Branch**: `main`
- **Base Commit**: `078a8623fd5186133a64edf4e54bbd7a7f585a37`
- **PWA / App Release Version**: `5.0.0` (aligned across `package.json`, `js/config.js`, and `service-worker.js`).

## Recent Improvements & Bug Fixes
1. **High-Precision PDF Word Layer (`js/pdf/reader.js`, `css/reading.css`, `js/core/dependencies.js`)**:
   - Replaced the conflicting dual text layer implementation with `buildPdfWordLayer(textContent, viewport, textLayer)`, which merges kerned PDF text fragments on the same baseline and renders each word as an individually positioned `<span class="pdf-word-span" data-word="...">` using percentage-locked coordinates (`left%`, `top%`, `width%`, `height%`).
   - Added high-DPI (`devicePixelRatio`) canvas rendering, zoom controls (`−`, `100%`, `＋`), instant single-click lookup toggle (`⚡ کلیک آنی`), and in-canvas word search with match cycling.
   - Removed duplicate `extractPdfTextPages` call during `openPDF(file)` and configured minified `pdf.worker.min.js`.
2. **Non-Blocking Boot & Sidebar Initialization (`index.html`, `js/core/boot.js`)**:
   - Made Google Fonts loading non-render-blocking (`media="print" onload="this.media='all'"`) and deferred `#hamBtn` visibility until `bootApp()` finishes wiring navigation handlers.
3. **Design System, Dark/Light Theme Tokens & Fluid Motion (`css/*.css`)**:
   - Unified semantic theme tokens (`--accent-gradient`, `--sidebar-bg`, `--sidebar-border`, `--spring`) across all 7 themes (`dark`, `light`, `ocean`, `forest`, `sunset`, `lavender`, `high-contrast`).
   - Eliminated hardcoded purple gradients/glows (`#7c6cf0`, `rgba(108,92,231,...)`) and duplicate CSS rule blocks in `css/base.css` and `css/learning.css`.

## Observed Technical & Build Status
- **Syntax Check**: Passing (`npm run syntax`)
- **Unit Test Suite**: Passing (`npm run test:unit` — 6/6 test files passed: `contracts.test.js`, `modules.test.js`, `performance.test.js`, `repositories.test.js`, `runtime-guards.test.js`, `services.test.js`).
- **Playwright E2E Verification**:
  - `tests/pdf.spec.js`, `tests/pdf-hit-test.spec.js`, `tests/pdf-selection.spec.js`: 7/7 passing.
  - `tests/smoke.spec.js`: Full tab navigation and review workflow verified.
