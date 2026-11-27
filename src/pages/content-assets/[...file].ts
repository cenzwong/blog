import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { publishedArticles } from '../../lib/articles';
import { compileArticle } from '../../compiler/index.mjs';
export async function getStaticPaths() {
  const posts = await publishedArticles();
  const articles = posts.map(post => ({slug: post.id, sourcePath: post.data.sourcePath}));
  const assets = new Set<string>();
  for (const post of posts) {
    const compiled = await compileArticle(post.body ?? '', post.data, {base: import.meta.env.BASE_URL, articles});
    for (const asset of compiled.assetPaths) assets.add(asset);
  }
  return [...assets].map(file => ({params: {file}, props: {file}}));
}
export const GET: APIRoute = async ({props}) => new Response(await readFile(path.join(process.cwd(), 'content', props.file)));
