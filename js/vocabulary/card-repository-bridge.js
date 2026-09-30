// Compatibility bridge for the composition root.
import { buildCardRepository } from './card-repository.js';

let repository = null;
let boundState = null;
export function getCardRepository() {
  const state = window.S;
  if (!state) throw new Error('Card repository is not ready: state is missing');
  if (repository && boundState === state) return repository;
  const factory = typeof buildCardRepository === 'function' ? buildCardRepository : window.__createCardRepositoryFactory;
  if (typeof factory !== 'function') throw new Error('Card repository is not ready: factory is missing');
  repository = factory({
    state,
    cardFactory: input => typeof window.createCard === 'function' ? window.createCard(input) : { ...input }
  });
  boundState = state;
  return repository;
}
export function resetCardRepository() { repository = null; boundState = null; }

// Safe add that keeps the repository index consistent. Falls back to a direct
// push (with duplicate guard) if the repository is not available yet.
export function repoAdd(card, target) {
  const repo = window.cardRepository && typeof window.cardRepository.get === 'function' ? window.cardRepository.get() : null;
  if (repo) return repo.add(card, target || 'words');
  if (!card || !String(card.word || '').trim()) return { added: false, reason: 'invalid', card };
  const list = target === 'longTerm' ? window.S.longTerm : window.S.words;
  const key = String(card.word).trim().toLowerCase();
  if (list.some(c => String(c.word || '').trim().toLowerCase() === key)) return { added: false, reason: 'duplicate', card };
  list.push(card);
  return { added: true, reason: null, card };
}

export const cardRepository = { get: getCardRepository, reset: resetCardRepository };
if (typeof window !== 'undefined') {
  window.cardRepository = cardRepository;
  window.getCardRepository = getCardRepository;
  window.repoAdd = repoAdd;
}
