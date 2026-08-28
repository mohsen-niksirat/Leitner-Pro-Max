export function build(days = 30) {
  return typeof window.buildForecast === 'function' ? window.buildForecast(days) : {labels: [], data: []};
}
