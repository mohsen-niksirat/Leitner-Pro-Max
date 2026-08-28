function normalizeVocabularyWord(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}'-]+$/gu, '');
}

function deduplicateVocabulary(words) {
  const seen = new Set();
  return (Array.isArray(words) ? words : []).reduce((result, value) => {
    const word = normalizeVocabularyWord(value);
    if (word && !seen.has(word)) {
      seen.add(word);
      result.push(word);
    }
    return result;
  }, []);
}

function createVocabularyService({ repository, cardFactory = value => ({ ...value }) } = {}) {
  if (!repository || typeof repository.add !== 'function') {
    throw new TypeError('Vocabulary service requires a card repository');
  }
  function prepareCard(input = {}) {
    const word = normalizeVocabularyWord(input.word);
    return word ? cardFactory({ ...input, word }) : null;
  }
  function addWord(input, target = 'words') {
    const card = prepareCard(typeof input === 'string' ? { word: input } : input);
    return card ? repository.add(card, target) : { added: false, reason: 'invalid', card: null };
  }
  function importWords(words, target = 'words') {
    return deduplicateVocabulary(words).map(word => addWord({ word }, target));
  }
  return Object.freeze({ normalize: normalizeVocabularyWord, deduplicate: deduplicateVocabulary, prepareCard, addWord, importWords });
}

if (typeof window !== 'undefined') window.__createVocabularyService = createVocabularyService;
