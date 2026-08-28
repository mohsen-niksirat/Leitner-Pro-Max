export function ensureLoaded() {
  return typeof window.ensureChartJs === 'function' ? window.ensureChartJs() : Promise.resolve(false);
}
