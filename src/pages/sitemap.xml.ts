import type { APIRoute } from 'astro';
import { seriesRoute } from '../lib/series';
import { publishedArticles } from '../lib/articles';
import { postRoute, route, tagRoute } from '../lib/routes';
const escape = (value: string) => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export const GET: APIRoute = async ({site}) => {
 const posts = await publishedArticles();
 const tags = [...new Set(posts.flatMap(post => post.data.tags))];
 const dates = [...new Set(posts.flatMap(post => [post.data.date.slice(0,4), post.data.date.slice(0,7).replace('-', '/')]))];
 const paths = [route(), route('about/'), route('archive/'), route('tags/'), route('series/'), ...[...new Set(posts.flatMap(post => post.data.series ? [post.data.series.name] : []))].map(seriesRoute), ...dates.map(date => route(`archive/${date}/`)), ...tags.map(tagRoute)];
 const entries = paths.map(url => ({url})).concat(posts.map(post => ({url:postRoute(post.id), lastmod:post.data.updated ?? post.data.date})));
 const xml = entries.map(entry => `<url><loc>${escape(new URL(entry.url,site).href)}</loc>${'lastmod' in entry ? `<lastmod>${entry.lastmod}</lastmod>` : ''}</url>`).join('');
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`, {headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
