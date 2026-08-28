function keyOf(word) {
  return String(word ?? '').trim().toLocaleLowerCase();
}

function buildCardRepository({ state, cardFactory = value => ({ ...value }) } = {}) {
  if (!state || !Array.isArray(state.words) || !Array.isArray(state.longTerm)) {
    throw new TypeError('Card repository requires state.words and state.longTerm arrays');
  }

  function collection(target) {
    return target === 'longTerm' ? state.longTerm : state.words;
  }

  // Word index for O(1) duplicate checks (rebuilt only when arrays are replaced externally).
  let index = new Map();

  function rebuildIndex() {
    index = new Map();
    for (const list of [state.words, state.longTerm]) {
      for (const card of list) {
        const key = keyOf(card && card.word);
        if (key && !index.has(key)) index.set(key, card);
      }
    }
  }

  rebuildIndex();

  function exists(word) {
    const key = keyOf(word);
    return !!key && index.has(key);
  }

  function add(input, target = 'words') {
    const card = cardFactory(input);
    if (!card || !keyOf(card.word)) return { added: false, reason: 'invalid', card: null };
    const key = keyOf(card.word);
    if (index.has(key)) return { added: false, reason: 'duplicate', card };
    collection(target).push(card);
    index.set(key, card);
    return { added: true, reason: null, card };
  }

  function update(id, patch, target) {
    const collections = target ? [collection(target)] : [state.words, state.longTerm];
    for (const list of collections) {
      const indexInList = list.findIndex(card => String(card.id) === String(id));
      if (indexInList < 0) continue;
      const current = list[indexInList];
      const next = { ...current, ...(patch || {}) };
      if (!keyOf(next.word)) return { updated: false, reason: 'invalid', card: current };
      const nextKey = keyOf(next.word);
      const oldKey = keyOf(current.word);
      if (nextKey !== oldKey && index.has(nextKey) && index.get(nextKey) !== current) {
        return { updated: false, reason: 'duplicate', card: current };
      }
      list[indexInList] = next;
      if (nextKey !== oldKey) {
        index.delete(oldKey);
        index.set(nextKey, next);
      }
      return { updated: true, reason: null, card: next };
    }
    return { updated: false, reason: 'not-found', card: null };
  }

  function remove(id, target) {
    const lists = target ? [collection(target)] : [state.words, state.longTerm];
    for (const list of lists) {
      const indexInList = list.findIndex(card => String(card.id) === String(id));
      if (indexInList >= 0) {
        const card = list.splice(indexInList, 1)[0];
        const key = keyOf(card && card.word);
        if (key && index.get(key) === card) index.delete(key);
        return { removed: true, card };
      }
    }
    return { removed: false, card: null };
  }

  return Object.freeze({
    exists,
    add,
    update,
    remove,
    all: () => [...state.words, ...state.longTerm],
    rebuildIndex
  });
}

if (typeof window !== 'undefined') window.__createCardRepositoryFactory = buildCardRepository;