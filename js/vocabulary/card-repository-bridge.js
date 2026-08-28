// Compatibility bridge for the classic-script composition root.
const createCardRepositoryFactory = window.__createCardRepositoryFactory;

let repository = null;
let boundState = null;
function getCardRepository() {
  const state = window.S;
  if (!state) throw new Error('Card repository is not ready: state is missing');
  if (repository && boundState === state) return repository;
  if (typeof createCardRepositoryFactory !== 'function') throw new Error('Card repository is not ready: factory is missing');
  repository = createCardRepositoryFactory({
    state,
    cardFactory: input => typeof window.createCard === 'function' ? window.createCard(input) : { ...input }
  });
  boundState = state;
  return repository;
}
function resetCardRepository() { repository = null; boundState = null; }
window.cardRepository = { get: getCardRepository, reset: resetCardRepository };
window.getCardRepository = getCardRepository;

// Safe add that keeps the repository index consistent. Falls back to a direct
// push (with duplicate guard) if the repository is not available yet.
function repoAdd(card, target) {
  const repo = window.cardRepository && typeof window.cardRepository.get === 'function' ? window.cardRepository.get() : null;
  if (repo) return repo.add(card, target || 'words');
  if (!card || !String(card.word || '').trim()) return { added: false, reason: 'invalid', card };
  const list = target === 'longTerm' ? window.S.longTerm : window.S.words;
  const key = String(card.word).trim().toLowerCase();
  if (list.some(c => String(c.word || '').trim().toLowerCase() === key)) return { added: false, reason: 'duplicate', card };
  list.push(card);
  return { added: true, reason: null, card };
}
window.repoAdd = repoAdd;
