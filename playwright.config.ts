import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
const localChrome = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'].find(existsSync);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || localChrome;
const base = `${(process.env.VITE_BASE || '/blog/').replace(/\/+$/, '')}/`;
export default defineConfig({
  testDir:'./tests/e2e', outputDir:'test-results', fullyParallel:true, workers:2, timeout:60000,
  forbidOnly:!!process.env.CI, retries:process.env.CI ? 1 : 0, reporter:process.env.CI ? 'github' : 'list',
  use:{baseURL:`http://127.0.0.1:4322${base}`, trace:'retain-on-failure', screenshot:'only-on-failure', launchOptions:executablePath ? {executablePath} : {}},
  projects:[{name:'desktop', use:{...devices['Desktop Chrome']}}, {name:'mobile', use:{...devices['iPhone 13'], defaultBrowserType:'chromium'}}],
  webServer:{command:'pnpm exec astro preview --host 127.0.0.1 --port 4322', url:`http://127.0.0.1:4322${base}`, reuseExistingServer:!process.env.CI, timeout:30000},
});
