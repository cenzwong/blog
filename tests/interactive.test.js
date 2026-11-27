import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { compileInteractiveHtml } from '../src/compiler/interactive.mjs';

test('interactive adapter embeds local images, scripts and stylesheet assets within the sandbox policy', async () => {
  const root = await mkdtemp(path.join(tmpdir(),'blog-demo-'));
  try {
    const dir = path.join(root,'content/2026/11'); await mkdir(path.join(dir,'assets'),{recursive:true});
    await writeFile(path.join(dir,'assets/image.png'),'image bytes');
    await writeFile(path.join(dir,'assets/demo.js'),'document.body.dataset.ready = "yes";');
    await writeFile(path.join(dir,'assets/demo.css'),'.example { background: url("image.png") }');
    const source = '<!doctype html><html><head><link rel="stylesheet" href="assets/demo.css"></head><body><img src="assets/image.png"><script src="assets/demo.js"></script></body></html>';
    const html = await compileInteractiveHtml(source,{sourcePath:'content/2026/11/demo.html'},{projectRoot:root,siteCss:''});
    assert.match(html,/Content-Security-Policy/); assert.match(html,/connect-src (?:'|&#x27;)none(?:'|&#x27;)/);
    assert.equal((html.match(/data:image\/png;base64,/g) ?? []).length,2);
    assert.match(html,/document\.body\.dataset\.ready/); assert.doesNotMatch(html,/src="assets\/demo\.js"/);
    assert.equal((html.match(/<html/g) ?? []).length,1);
    await writeFile(path.join(root,'outside.png'),'secret'); await symlink(path.join(root,'outside.png'),path.join(dir,'assets/escape.png'));
    await assert.rejects(compileInteractiveHtml('<img src="assets/escape.png">',{sourcePath:'content/2026/11/demo.html'},{projectRoot:root,siteCss:''}),/escapes content root/);
    await assert.rejects(compileInteractiveHtml('<img src="https://example.com/image.png">',{sourcePath:'content/2026/11/demo.html'},{projectRoot:root,siteCss:''}),/must be relative/);
    await assert.rejects(compileInteractiveHtml('<img srcset="assets/image.png 1x">',{sourcePath:'content/2026/11/demo.html'},{projectRoot:root,siteCss:''}),/srcset is not supported/);
    await assert.rejects(compileInteractiveHtml('<style>@IMPORT "https://example.com/a.css";</style>',{sourcePath:'content/2026/11/demo.html'},{projectRoot:root,siteCss:''}),/@import is not supported/);
  } finally {await rm(root,{recursive:true,force:true});}
});
