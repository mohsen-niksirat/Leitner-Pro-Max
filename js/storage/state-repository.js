const CURRENT_STATE_VERSION = 3;
const DEFAULT_CATEGORY = 'پیش‌فرض';

function createDefaultState() {
  return {
    words: [],
    longTerm: [],
    stats: { reviewed: 0, correct: 0, wrong: 0, streak: 0, xp: 0, lastReviewDate: null, history: {} },
    quizStats: { sessions: [], totalCorrect: 0, totalWrong: 0, wordPerformance: {}, currentSession: null },
    categories: [DEFAULT_CATEGORY],
    settings: { theme: 'dark', sourceLang: 'en', targetLang: 'fa', sidebarLocked: false },
    _version: CURRENT_STATE_VERSION
  };
}

function finite(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeCard(input = {}, idFactory = () => `${Date.now()}-${Math.random()}`) {
  const source = input && typeof input === 'object' ? input : {};
  const word = String(source.word ?? source.text ?? '').trim();
  return {
    ...source,
    id: String(source.id || idFactory()),
    word,
    translation: String(source.translation || '').trim(),
    box: Math.max(0, Math.min(10, finite(source.box, 0))),
    interval: Math.max(1, finite(source.interval, 1)),
    repetitions: Math.max(0, finite(source.repetitions, 0)),
    easeFactor: Math.max(1.3, finite(source.easeFactor, 2.5)),
    definitions: Array.isArray(source.definitions) ? source.definitions : [],
    examples: Array.isArray(source.examples) ? source.examples : [],
    synonyms: Array.isArray(source.synonyms) ? source.synonyms : [],
    antonyms: Array.isArray(source.antonyms) ? source.antonyms : [],
    tags: Array.isArray(source.tags) ? source.tags : [],
    fsrsState: String(source.fsrsState || 'new')
  };
}

function hydrateState(raw, idFactory) {
  const base = createDefaultState();
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    ...base,
    ...source,
    words: (Array.isArray(source.words) ? source.words : []).map(card => normalizeCard(card, idFactory)).filter(card => card.word),
    longTerm: (Array.isArray(source.longTerm) ? source.longTerm : []).map(card => normalizeCard(card, idFactory)).filter(card => card.word),
    stats: { ...base.stats, ...(source.stats && typeof source.stats === 'object' ? source.stats : {}) },
    quizStats: { ...base.quizStats, ...(source.quizStats && typeof source.quizStats === 'object' ? source.quizStats : {}) },
    categories: Array.isArray(source.categories) && source.categories.length ? source.categories.filter(Boolean) : base.categories,
    settings: { ...base.settings, ...(source.settings && typeof source.settings === 'object' ? source.settings : {}) },
    _version: CURRENT_STATE_VERSION
  };
}

function readLegacySnapshot(storage, keys = ['leitner_v2', 'leitner_v1', 'leitner_state'], idFactory) {
  for (const key of keys) {
    try {
      const raw = storage?.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return { key, state: hydrateState(parsed, idFactory) };
    } catch { /* corrupt legacy keys are intentionally skipped */ }
  }
  return null;
}

function createStateRepository({ storage, loadIdb, saveIdb, legacyKeys } = {}) {
  let current = createDefaultState();
  return {
    get() { return current; },
    replace(raw) { current = hydrateState(raw); return current; },
    async load() {
      const persisted = await loadIdb?.();
      if (persisted) return (current = hydrateState(persisted));
      const legacy = readLegacySnapshot(storage, legacyKeys, undefined);
      if (!legacy) return current;
      current = legacy.state;
      await saveIdb?.(current);
      for (const key of legacyKeys || ['leitner_v2', 'leitner_v1', 'leitner_state']) storage?.removeItem?.(key);
      return current;
    },
    async save() { await saveIdb?.(current); return current; }
  };
}
