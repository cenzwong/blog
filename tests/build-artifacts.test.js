import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import path from 'node:path';

test('catalogue excludes article bodies and static articles contain content', async () => {
  const root = path.resolve('dist');
  const catalogue = JSON.parse(await readFile(path.join(root, 'metadata.json'), 'utf8'));
  assert.equal(catalogue.schema_version, 1);
  assert.ok(catalogue.posts.length > 0);
  const base = `${(process.env.VITE_BASE || '/blog/').replace(/\/+$/, '')}/`;
  for (const post of catalogue.posts) {
    assert.equal('content' in post, false);
    assert.equal(post.url, `${base}posts/${encodeURIComponent(post.slug)}/`);
    const html = await readFile(path.join(root, 'posts', post.slug, 'index.html'), 'utf8');
    assert.ok(html.includes(post.title.replaceAll('&', '&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')));
    assert.ok(html.includes('rel="canonical"'));
    assert.match(html, /property="og:image"/);
    assert.match(html, /name="twitter:image"/);
  }
});

test('crawler and static route artifacts exist', async () => {
  for (const file of ['index.html','about/index.html','search/index.html','404.html','rss.xml','sitemap.xml','robots.txt']) await access(path.resolve('dist', file));
  const about = await readFile(path.resolve('dist', 'about/index.html'), 'utf8');
  assert.match(about, /knowledge through collaboration/i);
  assert.match(about, /Pagefind/);
});

test('interactive HTML is isolated and has a searchable static copy', async () => {
  const slug = 'iceberg-pyspark-bloom-filter-deep-dive';
  const html = await readFile(path.join('dist', 'posts', slug, 'index.html'), 'utf8');
  assert.match(html, /<iframe[^>]*sandbox="allow-scripts"/);
  assert.doesNotMatch(html, /<iframe[^>]*sandbox="[^"]*allow-same-origin/);
  assert.match(html, /data-pagefind-body/);
  assert.match(html, /Bloom Filter/i);
});

test('migrated linked diagram renders as an image', async () => {
  const html = await readFile(path.join('dist', 'posts', 'why-you-should-use-functional-programming-for-writing-data-pipeline', 'index.html'), 'utf8');
  assert.match(html, /<img[^>]+src="https:\/\/www\.researchgate\.net\/profile\/Oscar-Pereira-2\/publication\/270448794\/figure\/fig6\/AS:295098651824130@1447368409317\/Word-count-program-flow-executed-with-MapReduce-5\.png"/);
});
