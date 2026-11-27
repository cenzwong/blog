import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../scripts/markdown.mjs';

test('Markdown renderer drops unsafe link and image schemes', () => {
  const html = renderMarkdown('[run](javascript:alert(1)) ![image](data:text/html,boom)');
  assert.doesNotMatch(html, /href="javascript:/i);
  assert.doesNotMatch(html, /src="data:/i);
  assert.doesNotMatch(html, /<a\b/);
  assert.doesNotMatch(html, /<img\b/);
  assert.match(html, /run/);
  assert.match(html, /image/);
});

test('Markdown renderer escapes raw HTML while preserving code fences', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\n```html\n<script>example</script>\n```');
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /<code class="language-html">&lt;script&gt;example&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
