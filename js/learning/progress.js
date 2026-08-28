export function dailyChallenge() {
  return typeof window.getDailyChallenge === 'function' ? window.getDailyChallenge() : null;
}

export function leaderboard() {
  return typeof window.getLeaderboard === 'function' ? window.getLeaderboard() : [];
}
