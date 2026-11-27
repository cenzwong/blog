import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

async function markdownFiles(directory) {
  const entries = await readdir(directory,{withFileTypes:true});
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? markdownFiles(path.join(directory,entry.name)) : entry.name.endsWith('.md') ? [path.join(directory,entry.name)] : []))).flat();
}
test('maintained documentation links resolve relative to their referring files', async () => {
  const errors = [];
  for (const file of await markdownFiles('docs')) {
    // The handoff is an unchanged historical contract, not a maintained guide.
    if (path.basename(file) === 'astro-migration-handoff.md') continue;
    const text = await readFile(file,'utf8');
    for (const [, raw] of text.matchAll(/\]\(([^)]+)\)/g)) {
      const link = raw.split('#',1)[0].split('?',1)[0];
      if (!link || /^(?:[a-z][\w+.-]*:|\/)/i.test(link)) continue;
      try {await access(path.resolve(path.dirname(file),decodeURIComponent(link)));} catch {errors.push(`${file}: ${raw}`);}
    }
  }
  assert.deepEqual(errors,[]);
});
