import { getCollection } from 'astro:content';
export async function publishedArticles() {
  return (await getCollection('articles', ({data}) => !data.draft)).sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}
