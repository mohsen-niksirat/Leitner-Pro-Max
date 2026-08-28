const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(file, names, extra = {}) {
  let code = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
  const context = { console, Math, Date, Promise, Set, Map, ...extra };
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.__exports={${names.map(n => `${n}: typeof ${n} !== 'undefined' ? ${n} : undefined`).join(',')}}`, context);
  return context.__exports;
}

{
  const { normalizeWordLookup, appCacheKey } = load('js/vocabulary/enrichment.js', ['normalizeWordLookup', 'appCacheKey'], { window: {}, document: { createElement: () => ({}) } });
  assert.equal(normalizeWordLookup("  World's! "), "world's");
  assert.equal(appCacheKey('dict', ' Hello '), 'app_cache_dict:en-fa:hello');
  assert.equal(appCacheKey('trans', 'Hello'), 'app_cache_trans:en-fa:hello');
}

{
  const { normalizeVocabularyWord, deduplicateVocabulary } = load('js/vocabulary/vocabulary-service.js', ['normalizeVocabularyWord', 'deduplicateVocabulary']);
  assert.equal(normalizeVocabularyWord('  Café! '), 'café');
  assert.equal(JSON.stringify(deduplicateVocabulary(['A', ' a ', 'B!', null])), JSON.stringify(['a', 'b']));
}

{
  const { fsrsNext } = load('js/learning/fsrs.js', ['fsrsNext'], { MS_PER_DAY: 86400000, FSRS_DECAY_COEFF: .5 });
  for (const rating of [1, 2, 3, 4]) {
    const card = { fsrsState: 'new', stability: 0, difficulty: 0, interval: 1, reps: 0, lapses: 0 };
    fsrsNext(card, rating);
    assert.ok(card.interval >= 1 && card.interval <= 365);
    assert.match(card.nextReviewDate, /^\d{4}-/);
    assert.equal(card.reps, 1);
  }
}

console.log('contract unit tests: cache, vocabulary, FSRS passed');
