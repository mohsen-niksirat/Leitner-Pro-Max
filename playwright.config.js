// @ts-check
const { defineConfig } = require('@playwright/test');

const PORT = 8795;
const BASE_URL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    serviceWorkers: 'block',
    viewport: { width: 1280, height: 800 },
    locale: 'fa-IR',
    // مرورگر سیستمی به‌جای دانلود chromium (cdn.playwright.dev در برخی مناطق در دسترس نیست)
    channel: process.env.PW_CHANNEL || 'msedge'
  },
  webServer: {
    command: `python -m http.server ${PORT}`,
    url: BASE_URL + '/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  }
});
