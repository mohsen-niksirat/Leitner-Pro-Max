export const APP_CONFIG = Object.freeze({
  version: '5.0.0',
  repository: 'Leitner-Pro-Max',
  basePath: './',
  storage: Object.freeze({
    localStorageKey: 'leitner_v2',
    indexedDbName: 'leitnerDB',
    indexedDbStore: 'data',
    backupDbName: 'leitner_backup_db'
  }),
  dependencies: Object.freeze({
    chartJs: 'https://cdn.jsdelivr.net/npm/chart.js@4',
    pdfJs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    pdfWorker: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    jsZip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
  })
});

export function assetPath(path) {
  return new URL(path.replace(/^\.\//, ''), document.baseURI).toString();
}
