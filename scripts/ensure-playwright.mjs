import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';
const candidates = [process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, ...(process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'] : []), chromium.executablePath()].filter(Boolean);
let found = false;
for (const file of candidates) {try {await access(file); found = true; break;} catch {}}
if (found) console.log('A Chromium browser is available for Playwright.');
else {
  console.log('Installing the Chromium version pinned by Playwright.');
  const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['exec','playwright','install','chromium'], {stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
