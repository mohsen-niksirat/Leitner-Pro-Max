const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(file, names, extra = {}) {
  let code = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
  code = code.replace(/^\s*export\s+(?=function|const|let|var|\{)/gm, '');
  const context = { console, Date, Set, Map, Promise, Math, ...extra };
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.__exports={${names.map(name => `${name}: typeof ${name} !== 'undefined' ? ${name} : undefined`).join(',')}}`, context, { filename: file });
  return context.__exports;
}

{
  const { normalizeVocabularyWord, deduplicateVocabulary, createVocabularyService } = load('js/vocabulary/vocabulary-service.js', ['normalizeVocabularyWord', 'deduplicateVocabulary', 'createVocabularyService']);
  assert.equal(normalizeVocabularyWord("  Hello! "), 'hello');
  assert.equal(normalizeVocabularyWord("World's"), "world's");
  assert.equal(JSON.stringify(deduplicateVocabulary(['Hello', ' hello ', '', null, "WORLD'S", "world's"])), JSON.stringify(['hello', "world's"]));
  const state = { words: [], longTerm: [] };
  const repository = {
    add(card, target) { state[target].push(card); return { added: true, card }; }
  };
  const service = createVocabularyService({ repository, cardFactory: value => ({ id: state.words.length + 1, ...value }) });
  assert.equal(service.addWord('  TEST! ').card.word, 'test');
  assert.equal(service.addWord('   ').reason, 'invalid');
  assert.equal(service.importWords(['One', 'one', 'Two'], 'longTerm').length, 2);
  assert.equal(JSON.stringify(state.longTerm.map(card => card.word)), JSON.stringify(['one', 'two']));
}

{
  const { createLearningService } = load('js/learning/learning-service.js', ['createLearningService']);
  const service = createLearningService({
    reviewFn: (card, rating) => ({ ...card, rating }),
    now: () => new Date('2026-01-10T00:00:00.000Z')
  });
  assert.equal(service.rate({ word: 'x' }, 4).card.rating, 4);
  assert.equal(service.rate({ word: 'x' }, 5).reason, 'invalid-rating');
  const due = service.due([
    { word: 'new' },
    { word: 'past', nextReviewDate: '2026-01-09T00:00:00.000Z' },
    { word: 'future', nextReviewDate: '2026-01-11T00:00:00.000Z' },
    { word: 'bad-date', nextReviewDate: 'invalid' }
  ]);
  assert.equal(JSON.stringify(due.map(card => card.word)), JSON.stringify(['new', 'past', 'bad-date']));
}

console.log('service unit tests: vocabulary and learning passed');
