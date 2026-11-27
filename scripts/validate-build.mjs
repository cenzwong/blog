import { readFile, access, readdir } from 'node:fs/promises';
import path from 'node:path';
const dist = path.resolve('dist');
const base = `${(process.env.VITE_BASE || '/blog/').replace(/\/+$/, '')}/`;
const meta = JSON.parse(await readFile(path.join(dist, 'metadata.json'), 'utf8'));
if (meta.schema_version !== 1) throw new Error('Unexpected metadata schema version');
if (meta.posts.some(p => 'content' in p)) throw new Error('Article bodies leaked into metadata catalogue');
const catalogueFields = ['author','date','description','slug','tags','title','url'];
const seenSlugs = new Set();
const seenTitles = new Set();
const seenCanonicals = new Set();
for (const p of meta.posts) {
  if (JSON.stringify(Object.keys(p).sort()) !== JSON.stringify(catalogueFields)) throw new Error(`Unexpected metadata fields for ${p.slug}`);
  if (seenSlugs.has(p.slug) || seenTitles.has(p.title)) throw new Error(`Duplicate catalogue entry: ${p.slug}`);
  const expectedUrl = `${base}posts/${encodeURIComponent(p.slug)}/`;
  if (p.url !== expectedUrl) throw new Error(`Catalogue URL for ${p.slug} must be ${expectedUrl}, got ${p.url}`);
  seenSlugs.add(p.slug);
  seenTitles.add(p.title);
  const file = path.join(dist, 'posts', p.slug, 'index.html');
  await access(file);
  const html = await readFile(file, 'utf8');
  const heading = html.match(/<h1 itemprop="headline"[^>]*>(.*?)<\/h1>/)?.[1] || '';
  if (!heading.includes(p.title.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'))) throw new Error(`Article title missing from static HTML: ${p.slug}`);
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical || seenCanonicals.has(canonical)) throw new Error(`Canonical missing or duplicated: ${p.slug}`);
  seenCanonicals.add(canonical);
  if (!html.includes('name="description"') || !html.includes('property="og:title"') || !html.includes('property="og:description"') || !html.includes('property="og:url"') || !html.includes('name="twitter:card"')) throw new Error(`Social metadata missing: ${p.slug}`);
  if (!html.includes('https://schema.org/Article') || !html.includes('itemprop="articleBody"')) throw new Error(`Article structured data missing: ${p.slug}`);
  if (!html.includes('itemprop="author"') || !html.includes('itemprop="datePublished"')) throw new Error(`Article author or date missing: ${p.slug}`);
  if (!p.title || !p.description || !p.date || !p.author || !Array.isArray(p.tags) || p.tags.length === 0) throw new Error(`Required article metadata missing: ${p.slug}`);
}
for (const file of ['index.html','about/index.html','search/index.html','404.html','rss.xml','sitemap.xml','robots.txt']) await access(path.join(dist,file));
await access(path.join(dist,'pagefind','pagefind.js'));
await access(path.join(dist,'pagefind','pagefind-entry.json'));
const rss = await readFile(path.join(dist,'rss.xml'), 'utf8');
const sitemap = await readFile(path.join(dist,'sitemap.xml'), 'utf8');
if ((rss.match(/<item>/g) || []).length !== meta.posts.length) throw new Error('RSS article count does not match published catalogue');
for (const canonical of seenCanonicals) if (!sitemap.includes(canonical.replaceAll('&amp;','&'))) throw new Error(`Article canonical missing from sitemap: ${canonical}`);
try { await access(path.join(dist,'search_index.json')); throw new Error('Legacy full-corpus index must not ship in the static distribution'); }
catch (error) { if (error.message.includes('must not ship')) throw error; if (error.code !== 'ENOENT') throw error; }
async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes:true});
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : entry.name.endsWith('.html') ? [path.join(dir,entry.name)] : []))).flat();
}
for (const source of await walk(dist)) {
  const html = await readFile(source,'utf8');
  for (const [,raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = raw.replaceAll('&amp;','&');
    if (/^(?:#|https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    const parsed = new URL(value, `https://static.invalid${base}`);
    if (!parsed.pathname.startsWith(base)) throw new Error(`Internal URL escapes configured base in ${path.relative(dist,source)}: ${value}`);
    let target = path.join(dist, decodeURIComponent(parsed.pathname.slice(base.length)));
    if (parsed.pathname.endsWith('/')) target = path.join(target,'index.html');
    try { await access(target); }
    catch { throw new Error(`Broken internal URL in ${path.relative(dist,source)}: ${value}`); }
  }
}
console.log(`Validated static distribution: ${meta.posts.length} article documents and catalogue without bodies.`);
