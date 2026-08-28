export function build(days = 365) {
  return typeof window.buildHeatmap === 'function' ? window.buildHeatmap(days) : '';
}
