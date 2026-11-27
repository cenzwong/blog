export const base = import.meta.env.BASE_URL;
export const route = (path = '') => `${base}${path.replace(/^\/+/, '')}`;
export const postRoute = (slug: string) => route(`posts/${encodeURIComponent(slug)}/`);
import { tagSlug } from './tags';
export { tagSlug } from './tags';
export const tagRoute = (tag: string) => route(`tags/${encodeURIComponent(tagSlug(tag))}/`);
