import type { APIRoute } from 'astro';
import { publishedArticles } from '../lib/articles';
import { postRoute, route } from '../lib/routes';
const escape = (value: string) => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const GET: APIRoute = async ({site}) => {
 const posts = await publishedArticles();
 const items = posts.map(p => { const url = new URL(postRoute(p.id), site).href; return `<item><title>${escape(p.data.title)}</title><link>${escape(url)}</link><guid>${escape(url)}</guid><description>${escape(p.data.description)}</description><pubDate>${new Date(`${p.data.date}T00:00:00Z`).toUTCString()}</pubDate></item>`; }).join('');
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Cenz.Blog</title><link>${new URL(route(),site).href}</link><description>Technical knowledge from Cenz Wong</description>${items}</channel></rss>`, {headers:{'Content-Type':'application/rss+xml; charset=utf-8'}});
};
