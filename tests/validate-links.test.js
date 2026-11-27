import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateLinks } from '../scripts/validate-links.mjs';

test('link validation resolves paths relative to each page and checks fragments', async () => {
  const root = await mkdtemp(path.join(tmpdir(),'blog-links-'));
  try {
    await mkdir(path.join(root,'posts/a'),{recursive:true});
    await mkdir(path.join(root,'posts/b'),{recursive:true});
    await writeFile(path.join(root,'posts/b/index.html'),'<h1 id="section">Target</h1>');
    const page = path.join(root,'posts/a/index.html');
    await writeFile(page,'<h1 id="here">Start</h1><a href="#here">Here</a><a href="../b/#section">There</a>');
    await validateLinks(root,'/blog/');
    await writeFile(page,'<a href="../b/#missing">Broken</a>');
    await assert.rejects(validateLinks(root,'/blog/'),/Broken fragment/);
    await writeFile(page,'<a href="/escape/">Outside</a>');
    await assert.rejects(validateLinks(root,'/blog/'),/escapes configured base/);
    await writeFile(page,'<a href="/blog/%2e%2e%2fsecret">Escape</a>');
    await assert.rejects(validateLinks(root,'/blog/'),/escapes output directory/);
  } finally {await rm(root,{recursive:true,force:true});}
});
