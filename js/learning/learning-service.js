function createLearningService({ reviewFn, now = () => new Date() } = {}) {
  if (typeof reviewFn !== 'function') throw new TypeError('Learning service requires a review function');
  function rate(card, rating) {
    if (!card || !Number.isInteger(rating) || rating < 1 || rating > 4) return { ok: false, reason: 'invalid-rating', card };
    return { ok: true, card: reviewFn({ ...card }, rating) };
  }
  function due(cards, at = now()) {
    const timestamp = new Date(at).getTime();
    return (Array.isArray(cards) ? cards : []).filter(card => {
      if (!card || !card.nextReviewDate) return true;
      const dueAt = new Date(card.nextReviewDate).getTime();
      return Number.isNaN(dueAt) || dueAt <= timestamp;
    });
  }
  return Object.freeze({ rate, due });
}

if (typeof window !== 'undefined') window.__createLearningService = createLearningService;
