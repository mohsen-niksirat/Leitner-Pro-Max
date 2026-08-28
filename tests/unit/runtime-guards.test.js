const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function load(file, names) {
  let code = fs.readFileSync(path.join(__dirname, '..', '..', file), 'utf8');
  const context = { console, Math, Date, Promise, Set, Map };
  vm.createContext(context);
  vm.runInContext(`${code}\nthis.out={${names.map(n => `${n}:${n}`).join(',')}}`, context);
  return context.out;
}

const { buildCardRepository } = load('js/vocabulary/card-repository.js', ['buildCardRepository']);
assert.throws(() => buildCardRepository(), /requires state/);
const state = { words: [], longTerm: [] };
const repo = buildCardRepository({ state, cardFactory: value => ({ id: value.id || 'id', ...value }) });
assert.equal(repo.add({ word: null }).reason, 'invalid');
assert.equal(repo.add({ word: '  Alpha  ' }).added, true);
assert.equal(repo.add({ word: 'alpha' }).reason, 'duplicate');
assert.equal(repo.update('missing', { word: 'x' }).reason, 'not-found');
assert.equal(repo.update('id', { word: '' }).reason, 'invalid');
assert.equal(repo.remove('missing').removed, false);

const { createStateRepository, hydrateState } = load('js/storage/state-repository.js', ['createStateRepository', 'hydrateState']);
const hydrated = hydrateState({ words: 'bad', longTerm: [{ word: 'ok', tags: null }], settings: null });
assert.equal(hydrated.words.length, 0);
assert.equal(hydrated.longTerm[0].tags.length, 0);
let saved;
const repository = createStateRepository({ storage: { getItem: () => '{bad', removeItem: () => {} }, loadIdb: async () => null, saveIdb: async value => { saved = value; } });
(async () => {
  const result = await repository.load();
  assert.equal(result.words.length, 0);
  await repository.save();
  assert.equal(saved._version, 3);
  console.log('runtime guard unit tests: passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
