import type { APIRoute } from 'astro';
import { route } from '../lib/routes';
export const GET: APIRoute = ({site}) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(route('sitemap.xml'), site).href}\n`, {headers:{'Content-Type':'text/plain; charset=utf-8'}});
