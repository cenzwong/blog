import { z } from 'zod';

const calendarDate = z.string().refine(value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value, 'Expected a valid YYYY-MM-DD calendar date');
const text = z.string().trim().min(1);
export const articleSchema = z.object({
  title: text, description: text, date: calendarDate,
  tags: z.union([z.string().transform(value => value.split(',').map(tag => tag.trim())), z.array(text)]).pipe(z.array(text).min(1)),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  subtitle: z.string().optional(), author: text.default('Cenz Wong'),
  draft: z.boolean().default(false), interactive: z.boolean().default(false),
  updated: calendarDate.optional(), category: text.optional(), featured: z.boolean().default(false),
  series: z.object({name: text, order: z.number().int().positive()}).optional(),
  sourcePath: text, cover: text.optional(), aliases: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Aliases must be article slugs')).default([]), format: z.enum(['html', 'md']),
}).refine(value => !value.updated || value.updated >= value.date, {message:'updated must not precede date',path:['updated']}).refine(value => !value.interactive || value.format === 'html', {message:'interactive content must be HTML',path:['interactive']});
