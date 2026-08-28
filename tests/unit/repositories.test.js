const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function load(file, names, extra = {}) {
  let code = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
  const exports = [];
  code = code.replace(/^export\s+function\s+/gm, 'function ')
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+\{[^}]+\};?\s*$/gm, '');
  const context = { console, Math, Date, Promise, Set, Map, ...extra };
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.__exports={${names.map(n => `${n}:${n}`).join(',')}}`, context, { filename: file });
  return context.__exports;
}

(async () => {
  const { createDefaultState, normalizeCard, hydrateState, readLegacySnapshot, createStateRepository } = load('js/storage/state-repository.js', ['createDefaultState', 'normalizeCard', 'hydrateState', 'readLegacySnapshot', 'createStateRepository']);
  const { buildCardRepository } = load('js/vocabulary/card-repository.js', ['buildCardRepository']);

  const state = createDefaultState();
  const cards = buildCardRepository({ state, cardFactory: input => normalizeCard(input, () => 'generated') });
  const added = cards.add({ word: ' Hello ', translation: 'سلام' });
  assert.equal(added.added, true);
  assert.equal(cards.add({ word: 'hello' }).reason, 'duplicate');
  assert.equal(cards.exists(' HELLO '), true);
  assert.equal(cards.update(added.card.id, { translation: 'درود' }).updated, true);
  assert.equal(cards.all()[0].translation, 'درود');
  assert.equal(cards.update(added.card.id, { word: '   ' }).reason, 'invalid');
  assert.equal(cards.remove(added.card.id).removed, true);
  assert.equal(cards.remove('missing').removed, false);

  const hydrated = hydrateState({ words: [{ word: 'word', box: 999, definitions: 'bad' }], longTerm: null });
  assert.equal(hydrated.words.length, 1);
  assert.equal(hydrated.words[0].box, 10);
  assert.equal(JSON.stringify(hydrated.words[0].definitions), '[]');
  assert.equal(JSON.stringify(hydrated.longTerm), '[]');

  const storage = new Map([['leitner_v2', '{bad'], ['leitner_v1', JSON.stringify({ words: [{ word: 'survive' }] })]]);
  const legacy = readLegacySnapshot({ getItem: key => storage.get(key) });
  assert.equal(legacy.key, 'leitner_v1');
  assert.equal(legacy.state.words[0].word, 'survive');

  let persisted = null;
  const repository = createStateRepository({ storage: { getItem: () => null }, loadIdb: async () => null, saveIdb: async value => { persisted = value; } });
  await repository.load();
  await repository.save();
  assert.equal(persisted._version, 3);
  console.log('repository unit tests: passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
