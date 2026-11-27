import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:net';
import puppeteer from 'puppeteer';

const base = `${(process.env.VITE_BASE || '/blog/').replace(/\/+$/, '')}/`;
const probe = createServer();
await new Promise((resolve, reject) => {probe.once('error', reject); probe.listen(0, '127.0.0.1', resolve);});
const port = probe.address().port;
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
const origin = `http://127.0.0.1:${port}`;
const output = path.resolve('.generated/lighthouse');
await mkdir(output, {recursive:true});
const candidates = [process.env.CHROME_PATH, process.env.PUPPETEER_EXECUTABLE_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser', puppeteer.executablePath()].filter(Boolean);
let chrome;
for (const file of candidates) {try {await access(file); chrome = file; break;} catch {}}
if (!chrome) throw new Error('Chrome is required for Lighthouse; run pnpm run setup:browser or set CHROME_PATH.');
const server = spawn(process.execPath, ['node_modules/astro/astro.js','preview','--host','127.0.0.1','--port',String(port)], {stdio:'ignore'});
try {
  let ready = false;
  for (let i=0; i<100; i++) {
    try {if ((await fetch(origin + base)).ok) {ready = true; break;}} catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Production preview did not become ready on the selected local port.');
  const pages = [['article','posts/rolling-toolbox-pinned-workspace/'], ['interactive','posts/iceberg-pyspark-bloom-filter-deep-dive/']];
  const summary = {};
  for (const [name, relative] of pages) {
    const report = path.join(output,`${name}.json`);
    const result = spawnSync(process.execPath, ['node_modules/lighthouse/cli/index.js', `${origin}${base}${relative}`, '--only-categories=performance,accessibility,seo', '--chrome-flags=--headless', '--output=json', `--output-path=${report}`, '--quiet'], {stdio:'inherit', env:{...process.env, CHROME_PATH:chrome}});
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Lighthouse failed for ${name} (exit ${result.status}).`);
    const data = JSON.parse(await readFile(report,'utf8'));
    summary[name] = {scores:Object.fromEntries(Object.entries(data.categories).map(([key,value]) => [key, value.score === null ? null : Math.round(value.score * 100)])), lcpMs:data.audits['largest-contentful-paint'].numericValue, cls:data.audits['cumulative-layout-shift'].numericValue, tbtMs:data.audits['total-blocking-time'].numericValue, bytes:data.audits['total-byte-weight'].numericValue};
    console.log(`${name}: ${JSON.stringify(summary[name])}`);
  }
  await writeFile(path.join(output,'summary.json'), JSON.stringify(summary,null,2)+'\n');
} finally {server.kill('SIGTERM');}
