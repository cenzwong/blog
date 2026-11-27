import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let timer;
let building = false;
let pending = false;
let stopped = false;
let preview;
let activeBuild;
let directoryWatcher;
const contentWatchers = new Map();

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, { cwd: root, stdio: 'inherit' });
    activeBuild = child;
    child.once('error', error => {
      if (activeBuild === child) activeBuild = undefined;
      reject(error);
    });
    child.once('exit', code => {
      if (activeBuild === child) activeBuild = undefined;
      code === 0 ? resolve() : reject(new Error(`npm ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function build(initial = false) {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  do {
    pending = false;
    try {
      await run(['run', 'build']);
    } catch (error) {
      console.error(`[dev] ${error.message}`);
      if (initial) throw error;
    }
  } while (pending && !stopped);
  building = false;
}

function scheduleBuild(filename) {
  if (!filename || !/\.(md|html?)$/i.test(filename)) return;
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`[dev] Content changed: ${filename}; rebuilding static site.`);
    void build();
  }, 250);
}

function stop() {
  if (stopped) return;
  stopped = true;
  clearTimeout(timer);
  directoryWatcher?.close();
  for (const watcher of contentWatchers.values()) watcher.close();
  activeBuild?.kill('SIGTERM');
  preview?.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

async function syncContentWatchers() {
  const entries = await readdir(contentDir, { withFileTypes: true });
  const files = new Set(entries.filter(entry => entry.isFile() && /\.(md|html?)$/i.test(entry.name)).map(entry => entry.name));
  for (const [name, watcher] of contentWatchers) {
    if (!files.has(name)) {
      watcher.close();
      contentWatchers.delete(name);
    }
  }
  for (const name of files) {
    if (contentWatchers.has(name)) continue;
    const watcher = watch(path.join(contentDir, name), () => scheduleBuild(name));
    watcher.on('error', error => console.error(`[dev] Watch failed for ${name}: ${error.message}`));
    contentWatchers.set(name, watcher);
  }
}

directoryWatcher = watch(contentDir, async (_event, filename) => {
  const name = String(filename || '');
  await syncContentWatchers();
  scheduleBuild(name);
});
directoryWatcher.on('error', error => console.error(`[dev] Content watcher failed: ${error.message}`));
await syncContentWatchers();

await build(true);
if (stopped) process.exit(0);
preview = spawn(npm, ['run', 'preview', '--', '--host', '127.0.0.1'], { cwd: root, stdio: 'inherit' });
preview.once('error', error => {
  console.error(`[dev] Unable to start preview: ${error.message}`);
  process.exitCode = 1;
});
preview.once('exit', code => {
  if (!stopped && code !== 0) process.exitCode = code ?? 1;
});
