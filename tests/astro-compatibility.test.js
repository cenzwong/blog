import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('Astro production build builds each existing published route with a stable canonical URL', async () => {
  const manifest = await readFile('docs/migration-compatibility.md', 'utf8');
  const slugs = [...manifest.matchAll(/`\/blog\/posts\/([^/]+)\/`/g)].map(match => match[1]);
  assert.equal(slugs.length, 8);
  assert.equal(new Set(slugs).size, slugs.length);
  const base = `${(process.env.VITE_BASE || '/blog/').replace(/\/+$/, '')}/`;
  const origin = new URL(process.env.SITE_URL || 'https://cenzwong.github.io/blog').origin;
  for (const slug of slugs) {
    const html = await readFile(path.join('dist/posts', slug, 'index.html'), 'utf8');
    assert.ok(html.includes(`${origin}${base}posts/${slug}/`));
    assert.match(html, /<article\b/);
  }
});

test('Astro production build retains the interactive sandbox and static article', async () => {
  const slug = 'iceberg-pyspark-bloom-filter-deep-dive';
  const html = await readFile(path.join('dist/posts', slug, 'index.html'), 'utf8');
  const demo = await readFile(path.join('dist/demos', `${slug}.html`), 'utf8');
  assert.match(html, /<iframe[^>]*sandbox="allow-scripts"/);
  assert.doesNotMatch(html, /<iframe[^>]*allow-same-origin/);
  assert.match(html, /data-pagefind-body/);
  assert.match(html, /Bloom Filter/);
  assert.match(demo, /Content-Security-Policy/);
  assert.match(demo, /connect-src (?:'|&#x27;)none(?:'|&#x27;)/);
  assert.match(demo, /<script>/);
});

test('Astro production build sitemap, feed, archive and topic pages match the published catalogue', async () => {
  const root = 'dist';
  const catalogue = JSON.parse(await readFile(path.join(root,'metadata.json'), 'utf8'));
  const rss = await readFile(path.join(root,'rss.xml'), 'utf8');
  const sitemap = await readFile(path.join(root,'sitemap.xml'), 'utf8');
  const archive = await readFile(path.join(root,'archive/index.html'), 'utf8');
  assert.equal((rss.match(/<item>/g) ?? []).length, catalogue.posts.length);
  assert.doesNotMatch(sitemap, /\/search\/|\/demos\//);
  for (const post of catalogue.posts) {
    assert.ok(rss.includes(post.url), `${post.slug} missing from RSS`);
    assert.ok(sitemap.includes(post.url), `${post.slug} missing from sitemap`);
    assert.ok(archive.includes(post.url), `${post.slug} missing from archive`);
    const [year, month] = post.date.split('-');
    const monthly = await readFile(path.join(root,'archive',year,month,'index.html'), 'utf8');
    assert.ok(monthly.includes(post.url), `${post.slug} missing from monthly archive`);
    for (const tag of post.tags) {
      const slug = tag.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
      const page = await readFile(path.join(root,'tags',slug,'index.html'), 'utf8');
      assert.ok(page.includes(post.url), `${post.slug} missing from ${tag}`);
    }
  }
});

test('existing Mermaid diagrams have static light and dark SVGs with readable source', async () => {
  const html = await readFile('dist/posts/rolling-toolbox-pinned-workspace/index.html', 'utf8');
  const images = [...html.matchAll(/src="[^\"]*\/diagrams\/([a-f0-9]{20}-(?:light|dark)\.svg)"/g)].map(match => match[1]);
  assert.equal(images.length, 8);
  assert.match(html, /<summary>Diagram source<\/summary>/);
  for (const file of images) assert.match(await readFile(path.join('dist/diagrams',file), 'utf8'), /<svg\b/);
});
