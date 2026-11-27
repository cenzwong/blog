import type { APIRoute } from 'astro';
import { publishedArticles } from '../lib/articles';
import { postRoute } from '../lib/routes';
export const GET: APIRoute = async () => {
  const posts = await publishedArticles();
  return new Response(JSON.stringify({schema_version: 1, posts: posts.map(({id, data}) => ({slug:id, title:data.title, description:data.description, date:data.date, author:data.author, tags:data.tags, url:postRoute(id)}))}, null, 2) + '\n', {headers:{'Content-Type':'application/json; charset=utf-8'}});
};
