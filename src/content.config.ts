import { defineCollection } from 'astro:content';
import { articleLoader } from './compiler/articles';
import { articleSchema } from './compiler/schema';
export const collections = {articles: defineCollection({loader:articleLoader(), schema:articleSchema})};
