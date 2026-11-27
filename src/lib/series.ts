import { tagSlug } from './tags';

// Preserve the original Hashnode path for this series.
export const seriesSlug = (name: string) => name === 'NLP & LLMs' ? 'nlp' : tagSlug(name);
export const seriesRoute = (name: string) => `${import.meta.env.BASE_URL}series/${encodeURIComponent(seriesSlug(name))}/`;
