import type { APIRoute } from 'astro';
import { publishedArticles } from '../../lib/articles';
import { compileInteractiveHtml } from '../../compiler/interactive.mjs';
export async function getStaticPaths() {
  return (await publishedArticles()).filter(post => post.data.interactive && post.data.format === 'html').map(post => ({params:{slug:post.id},props:{post}}));
}
export const GET: APIRoute = async ({props}) => new Response(await compileInteractiveHtml(props.post.body ?? '', props.post.data), {headers:{'Content-Type':'text/html; charset=utf-8'}});
