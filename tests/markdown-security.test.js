import test from 'node:test';
import assert from 'node:assert/strict';
import { compileArticle } from '../src/compiler/index.mjs';
const meta = {title:'Security', description:'Security fixture', format:'md'};

test('Markdown drops unsafe link and image schemes', async () => {
  const {html} = await compileArticle('[run](javascript:alert(1)) ![image](data:text/html,boom)', meta);
  assert.doesNotMatch(html, /(?:href="javascript:|src="data:)/i);
  assert.match(html, /run/);
  assert.match(html, /image/);
});

test('authored raw HTML cannot execute and fenced HTML remains visible as code', async () => {
  const {html} = await compileArticle('<script>alert(1)</script>\n\n```html\n<script>example</script>\n```', meta);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /(?:&lt;|&#x3C;)/i);
  assert.match(html, /example/);
});
