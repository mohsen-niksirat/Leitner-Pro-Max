const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file, names, extra = {}) {
  let code = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
  code = code.replace(/^\s*export\s+const\s+/gm, 'const ');
  code = code.replace(/^\s*export\s+function\s+/gm, 'function ');
  code = code.replace(/^\s*export\s+\{[^}]+\};?\s*$/m, '');
  code = code.replace(/^\s*export\s+\{[^}]+\};?\s*$/m, '');
  const context = { console, Math, Date, Blob, Set, Map, Promise, ...extra };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.__exports = {${names.map(n => `${n}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(',')}};`, context, { filename: file });
  return context.__exports;
}

{
  const { fsrsNext, fsrsRetrieveProbability, fsrsInitialDifficulty, fuzzInterval, mapRating } = load('js/learning/fsrs.js', ['fsrsNext', 'fsrsRetrieveProbability', 'fsrsInitialDifficulty', 'fuzzInterval', 'mapRating'], { MS_PER_DAY: 86400000, FSRS_DECAY_COEFF: .5 });
  for (const rating of [1, 2, 3, 4]) {
    const card = { fsrsState: 'new', lapses: 0, reps: 0, stability: 0, difficulty: 0, interval: 1 };
    fsrsNext(card, rating);
    assert.ok(card.interval >= 1 && card.interval <= 365);
    assert.ok(card.nextReviewDate);
    assert.equal(card.reps, 1);
    assert.equal(card.fsrsState, rating === 1 ? 'learning' : 'review');
  }
  const review = { fsrsState: 'review', stability: 5, difficulty: 5, interval: 5, lapses: 0, reps: 2, elapsedDays: 2 };
  fsrsNext(review, 1);
  assert.equal(review.fsrsState, 'relearning');
  assert.equal(review.lapses, 1);
  assert.ok(fsrsRetrieveProbability(5, 0) > fsrsRetrieveProbability(5, 10));
  assert.ok(fsrsInitialDifficulty(1) >= 1 && fsrsInitialDifficulty(4) <= 10);
  assert.equal(fuzzInterval(1), 1);
  assert.deepEqual([1, 2, 3, 4, 5].map(mapRating), [1, 2, 2, 3, 4]);
}

{
  const { createCard, rebuildIndex, wordExists, getFrequencyTier, tierLabel } = load('js/vocabulary/vocabulary.js', ['createCard', 'rebuildIndex', 'wordExists', 'getFrequencyTier', 'tierLabel'], { S: { words: [], longTerm: [] }, sanitizeCard: x => x, uid: () => 'id' });
  const first = createCard({ word: ' Hello ', translation: 'سلام', box: 99, easeFactor: 0.2 });
  assert.equal(first.word, ' Hello '); // factory delegates canonical trimming to sanitizeCard
  assert.equal(first.box, 99);
  const state = { words: [first], longTerm: [] };
  // The classic module closes over its own S binding; exercise the index lifecycle
  // with the same object used by the module context.
  const vocabulary = load('js/vocabulary/vocabulary.js', ['rebuildIndex', 'wordExists', 'getFrequencyTier', 'tierLabel'], { S: state });
  vocabulary.rebuildIndex();
  assert.equal(vocabulary.wordExists(' Hello '), true);
  assert.equal(getFrequencyTier('the'), 1);
  assert.equal(tierLabel(1), 'پرکاربرد');
}

{
  const { parseWords } = load('js/vocabulary/import.js', ['parseWords'], { window: {}, document: {}, localStorage: { getItem: () => null }, indexedDB: {} });
  assert.equal(JSON.stringify(parseWords("Hello, hello world's 123!")), JSON.stringify(['hello', "world's"]));
}

{
  const { migrate, needsMigration } = load('js/storage/migration.js', ['migrate', 'needsMigration']);
  assert.equal(needsMigration({ version: 1 }), true);
  assert.equal(needsMigration({ version: 3 }), false);
  assert.equal(migrate({ words: [] })._version, 3);
  assert.equal(migrate(null), null);
}

console.log('unit modules: FSRS, storage/card index, vocabulary, migration passed');
