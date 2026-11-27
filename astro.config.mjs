import { defineConfig } from 'astro/config';
import { spawn } from 'node:child_process';
import path from 'node:path';

// Refresh the derived SVGs after Markdown changes while Astro watches content.
function watchDiagrams() {
  return {name:'watch-diagrams', hooks:{'astro:server:setup':({server}) => {
    const root = path.resolve('content') + path.sep;
    let timer, active = false, pending = false;
    function regenerate() {
      if (active) {pending = true; return;}
      active = true;
      const child = spawn(process.execPath, ['scripts/render-diagrams.mjs'], {stdio:'inherit'});
      child.on('error', error => {console.error(`Diagram regeneration failed: ${error.message}`);});
      child.on('close', code => {active = false; if (code !== 0) console.error('Diagram regeneration failed; check the source and browser setup.'); if (pending) {pending = false; regenerate();}});
    }
    server.watcher.on('all', (_event, file) => {
      if (!path.resolve(file).startsWith(root) || !/\.md$/i.test(file)) return;
      clearTimeout(timer); timer = setTimeout(regenerate, 300);
    });
  }}};
}
export default defineConfig({
  site: new URL(process.env.SITE_URL || 'https://cenzwong.github.io/blog').origin,
  base: process.env.VITE_BASE || '/blog/',
  output: 'static',
  outDir: './dist/',
  integrations: [watchDiagrams()],
});
