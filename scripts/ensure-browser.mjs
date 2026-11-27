import { access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer';
const candidates = [process.env.PUPPETEER_EXECUTABLE_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', puppeteer.executablePath()].filter(Boolean);
let found = false;
for (const file of candidates) {try {await access(file); found = true; break;} catch {}}
if (found) console.log('A browser is available for Mermaid rendering.');
else {
  console.log('Installing the Chrome version pinned by Puppeteer for Mermaid rendering.');
  const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['exec', 'puppeteer', 'browsers', 'install', 'chrome'], {stdio:'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
