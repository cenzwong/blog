import test from 'node:test';
import assert from 'node:assert/strict';
import { compileArticle } from '../src/compiler/index.mjs';

const meta = {title: 'Example', description: 'A description.', format: 'md'};
test('Markdown compilation removes unambiguous repeated introduction and produces headings and math', async () => {
  const result = await compileArticle('# Example\n\n*A description.*\n\n## Details\n\nA table and $x^2$.\n\n| A | B |\n| - | - |\n| 1 | 2 |', meta);
  assert.doesNotMatch(result.html, /<h1|A description/);
  assert.match(result.html, /<table tabindex="0">/);
  assert.match(result.html, /class="katex"/);
  assert.deepEqual(result.headings, [{id: 'details', text: 'Details', depth: 2}]);
});
test('static HTML strips executable content, handlers and unsafe URLs', async () => {
  const result = await compileArticle('<h2 onclick="evil()">Safe</h2><script>alert(1)</script><style>body{display:none}</style><a href="javascript:evil()">Link</a><img src="x" onerror="evil()"><button>Execute</button><input value="1">', {...meta, format: 'html'});
  assert.match(result.html, /<h2 id="safe">Safe /);
  assert.doesNotMatch(result.html, /script|style|onclick|onerror|javascript:|alert\(1\)|<button|<input/);
});
test('Markdown raw HTML is not executable', async () => {
  const result = await compileArticle('<script>alert(1)</script>\n\n[bad](javascript:alert(1))', meta);
  assert.doesNotMatch(result.html, /<script|javascript:/);
});

test('only explicit Python run fences are marked executable and code is highlighted at build time', async () => {
  const result = await compileArticle('```python\nprint(1)\n```\n\n```python run title="Example"\nprint(2)\n```', meta);
  assert.equal((result.html.match(/data-runnable="python"/g) ?? []).length, 1);
  assert.match(result.html, /data-title="Example"/);
  assert.match(result.html, /class="shiki/);
  assert.equal(result.features.runnablePython, true);
});

test('relative asset and article references resolve from the authored file and reject traversal', async () => {
  const { mkdtemp, mkdir, writeFile, symlink, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os'); const path = await import('node:path');
  const root = await mkdtemp(path.join(tmpdir(), 'blog-content-'));
  try {
    const dir = path.join(root, 'content/2026/11'); await mkdir(path.join(dir, 'assets'), {recursive:true});
    await writeFile(path.join(dir, 'assets/diagram.png'), 'image');
    const metadata = {...meta, sourcePath:'content/2026/11/example.md', cover:'./assets/diagram.png'};
    const options = {projectRoot:root, base:'/blog/', articles:[{slug:'other', sourcePath:'content/2026/11/other.md'}]};
    const result = await compileArticle('![Diagram](./assets/diagram.png) [Other](./other.md#section)', metadata, options);
    assert.match(result.html, /src="\/blog\/content-assets\/2026\/11\/assets\/diagram.png"/);
    assert.match(result.html, /href="\/blog\/posts\/other\/#section"/);
    assert.equal(result.cover, '/blog/content-assets/2026/11/assets/diagram.png');
    assert.ok(result.assetPaths.includes('2026/11/assets/diagram.png'));
    await assert.rejects(compileArticle('Body', {...metadata, cover:'javascript:alert(1)'}, options), /unsafe cover URL/);
    await assert.rejects(compileArticle('![bad](../../../secret.png)', metadata, options), /escapes content root/);
    await assert.rejects(compileArticle('![missing](assets/missing.png)', metadata, options), /missing asset/);
    await writeFile(path.join(root, 'secret.png'), 'secret');
    await symlink(path.join(root, 'secret.png'), path.join(dir, 'assets/escape.png'));
    await assert.rejects(compileArticle('![bad](assets/escape.png)', metadata, options), /asset escapes content root/);
  } finally {await rm(root, {recursive:true, force:true});}
});

test('static HTML cannot opt itself into the Python runner', async () => {
  const result = await compileArticle('<pre><code class="language-python" data-runnable="true">print(1)</code></pre>', {...meta, format:'html'});
  assert.equal(result.features.runnablePython, false);
  assert.doesNotMatch(result.html, /data-runnable/);
});

test('HTML math is rendered at build time without changing code or currency', async () => {
  const result = await compileArticle('<p>Time is $O(n)$ and price is $10 today.</p><pre><code>cost = "$10"</code></pre>', {...meta, format:'html'});
  assert.match(result.html, /class="katex"/);
  assert.match(result.html, /price is \$10 today/);
  assert.match(result.html, /\$10/);
});

test('Mermaid source compiles to theme-aware static images and a readable source fallback', async () => {
  const {createHash} = await import('node:crypto');
  const hash = createHash('sha256').update('flowchart LR\n A-->B').digest('hex').slice(0,20);
  const result = await compileArticle('```Mermaid\nflowchart LR\n A-->B\n```', meta, {base:'/blog/',diagramDimensions:{[hash]:{light:{width:600,height:400},dark:{width:600,height:400}}}});
  assert.match(result.html, /class="diagram-light" src="\/blog\/diagrams\/[a-f0-9]{20}-light\.svg"/);
  assert.match(result.html, /class="diagram-dark" src="\/blog\/diagrams\/[a-f0-9]{20}-dark\.svg"/);
  assert.match(result.html, /width="600" height="400"/);
  assert.match(result.html, /<summary>Diagram source<\/summary>/);
  assert.equal(result.features.diagrams, true);
});

test('complete HTML imports only body content, discarding document wrappers and head', async () => {
  const html = '<!doctype html><html><head><title>Hidden head title</title><style>body{display:none}</style></head><body><h2>Body heading</h2><p>Visible body</p></body></html>';
  const result = await compileArticle(html, {...meta, format:'html'});
  assert.match(result.html, /Visible body/);
  assert.doesNotMatch(result.html, /Hidden head title|<html|<head|<body|<style/);
});

test('currency pairs stay literal while inline mathematical expressions still render', async () => {
  const result = await compileArticle('Prices are $10 and $20; the bound is $O(n)$.', meta);
  assert.match(result.html, /Prices are \$10 and \$20/);
  assert.match(result.html, /class="katex"/);
});

test('duplicate leading title and description are removed inside an HTML wrapper', async () => {
  const result = await compileArticle('<div><h1>Example</h1><p>A description.</p><h2>Content</h2></div>', {...meta, format:'html'});
  assert.doesNotMatch(result.html, /Example|A description/);
  assert.match(result.html, /Content/);
});

test('supported directives become callouts and image titles become captions', async () => {
  const result = await compileArticle(':::warning\nBe careful.\n:::\n\n![Diagram](https://example.com/a.png "A caption")', meta);
  assert.match(result.html, /<aside class="callout-warning">/);
  assert.match(result.html, /<strong>Warning<\/strong>/);
  assert.match(result.html, /<figcaption>A caption<\/figcaption>/);
});

test('duplicate imported IDs are unique and links target the first sanitized ID', async () => {
  const result = await compileArticle('<h2 id="part">First</h2><h2 id="part">Second</h2><a href="#part">Jump</a>', {...meta,format:'html'});
  assert.match(result.html, /id="user-content-part"/);
  assert.match(result.html, /id="user-content-part-2"/);
  assert.match(result.html, /href="#user-content-part"/);
  assert.ok(result.warnings.some(warning => warning.includes('Duplicate ID')));
});

test('heading hierarchy jumps are reported without deleting content', async () => {
  const result = await compileArticle('## First\n\n#### Skipped', meta);
  assert.match(result.html, /Skipped/);
  assert.ok(result.warnings.some(warning => warning.includes('jumps from h2 to h4')));
});

test('footnote links resolve to generated IDs without adding the hidden footnote label to the table of contents', async () => {
  const result = await compileArticle('Text[^1].\n\n[^1]: Footnote.', meta);
  const ids = new Set([...result.html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, target] of result.html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.has(target), target);
  assert.equal(result.headings.length, 0);
});
