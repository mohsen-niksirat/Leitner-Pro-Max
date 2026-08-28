const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file, names, extra = {}) {
  let code = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
  code = code.replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+\{[^}]+\};?\s*$/gm, '');
  const context = { console, Math, Date, Promise, Set, Map, ...extra };
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.__exports={${names.map(n => `${n}:${n}`).join(',')}}`, context, { filename: file });
  return context.__exports;
}

function timed(label, fn) {
  const start = Date.now();
  const result = fn();
  const ms = Date.now() - start;
  console.log(`  [perf] ${label}: ${ms}ms`);
  return { result, ms };
}

const N = 10_000;

(async () => {
  // ── 1. Repository scale: 10k cards ──────────────────────────────
  const { createDefaultState, normalizeCard, hydrateState } = load('js/storage/state-repository.js', ['createDefaultState', 'normalizeCard', 'hydrateState']);
  const { buildCardRepository } = load('js/vocabulary/card-repository.js', ['buildCardRepository']);

  const state = createDefaultState();
  const cards = buildCardRepository({ state, cardFactory: input => normalizeCard(input, () => `id-${Math.random().toString(36).slice(2)}`) });

  const { result: bulkAdd, ms: addMs } = timed(`add ${N} cards`, () => {
    let added = 0;
    for (let i = 0; i < N; i++) {
      const r = cards.add({ word: `word${i}`, translation: `ترجمه ${i}` });
      if (r.added) added++;
    }
    return added;
  });
  assert.equal(bulkAdd, N);
  assert.ok(addMs < 5000, `bulk add too slow: ${addMs}ms`);

  const { result: dupCheck, ms: dupMs } = timed(`duplicate check x${N}`, () => {
    let dup = 0;
    for (let i = 0; i < N; i++) {
      if (!cards.add({ word: `word${i}` }).added) dup++;
    }
    return dup;
  });
  assert.equal(dupCheck, N);
  assert.ok(dupMs < 5000, `duplicate check too slow: ${dupMs}ms`);

  const { result: existsMs, ms: exMs } = timed(`exists lookup x${N}`, () => {
    let found = 0;
    for (let i = 0; i < N; i += 7) if (cards.exists(`word${i}`)) found++;
    return found;
  });
  assert.ok(existsMs > 0);
  assert.ok(exMs < 3000, `exists lookup too slow: ${exMs}ms`);

  const { result: allCount, ms: allMs } = timed(`all() snapshot`, () => cards.all().length);
  assert.equal(allCount, N);
  assert.ok(allMs < 1000, `all() too slow: ${allMs}ms`);

  // ── 2. hydrateState with 10k cards (IndexedDB-independent path) ─
  const raw = { words: Array.from({ length: N }, (_, i) => ({ word: `hydrate${i}`, box: i === 0 ? 999 : i % 12, definitions: 'bad' })), longTerm: null };
  const { result: hydrated, ms: hydMs } = timed(`hydrateState ${N} cards`, () => hydrateState(raw));
  assert.equal(hydrated.words.length, N);
  assert.equal(hydrated.words[0].box, 10);
  assert.equal(JSON.stringify(hydrated.words[0].definitions), '[]');
  assert.ok(hydMs < 3000, `hydrateState too slow: ${hydMs}ms`);

  // ── 3. Import: parseWords on a large text ───────────────────────
  const { parseWords } = load('js/vocabulary/import.js', ['parseWords'], { window: {}, document: {}, localStorage: { getItem: () => null }, indexedDB: {} });
  const bigText = Array.from({ length: 3000 }, (_, i) => `The quick brown fox jumps over word${i} and lazy dogs.`).join(' ');
  const { result: parsed, ms: parseMs } = timed(`parseWords on ${bigText.length} chars`, () => parseWords(bigText));
  assert.ok(parsed.length >= 3000, `expected >=3000 unique words, got ${parsed.length}`);
  assert.ok(parseMs < 3000, `parseWords too slow: ${parseMs}ms`);

  // ── 4. Pagination bounds with large totals ──────────────────────
  const { paginate } = load('js/vocabulary/library.js', ['paginate'], { S: { words: [], longTerm: [] } });
  const { result: pageOut, ms: pageMs } = timed('paginate 10k with pageSize 50', () => {
    let last = null;
    for (let page = 0; page < 400; page++) last = paginate(10000, page, 50);
    return last;
  });
  assert.equal(pageOut.totalPages, 200);
  assert.equal(pageOut.start, 199 * 50);
  assert.equal(pageOut.end, 199 * 50 + 50);
  assert.ok(pageMs < 500, `paginate too slow: ${pageMs}ms`);

  // ── 5. Vocabulary dedup scale ───────────────────────────────────
  const { deduplicateVocabulary } = load('js/vocabulary/vocabulary-service.js', ['deduplicateVocabulary']);
  const many = Array.from({ length: N }, (_, i) => (i % 2 ? `Word${i % 5000}` : `word${i % 5000}`));
  const { result: deduped, ms: dedupMs } = timed(`deduplicateVocabulary ${N} entries`, () => deduplicateVocabulary(many));
  assert.ok(deduped.length <= 5000);
  assert.ok(dedupMs < 3000, `dedup too slow: ${dedupMs}ms`);

  console.log('performance unit tests: passed');
})().catch(error => { console.error(error); process.exitCode = 1; });