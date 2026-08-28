export function review(container = document.getElementById('content')) {
  return typeof window.renderReview === 'function' ? window.renderReview(container) : undefined;
}

export function quiz(container = document.getElementById('content')) {
  return typeof window.renderQuiz === 'function' ? window.renderQuiz(container) : undefined;
}
