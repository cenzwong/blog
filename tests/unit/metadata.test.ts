import { describe, it, expect } from 'vitest';
import { tagSlug } from '../../src/lib/tags';
import { articleSchema } from '../../src/compiler/schema';
const base = {title:'Example', description:'Summary', date:'2026-11-27', tags:'Python, Data Engineering', slug:'example', sourcePath:'content/2026/11/example.md', format:'md'};
describe('article metadata', () => {
  it('normalises legacy tags and supplies defaults without shifting dates', () => {
    const data = articleSchema.parse(base);
    expect(data.tags).toEqual(['Python','Data Engineering']);
    expect(data.date).toBe('2026-11-27');
    expect(data.draft).toBe(false);
    expect(data.author).toBe('Cenz Wong');
  });
  it.each(['2026-02-30','2026-13-01','2026-1-01','2025-02-29'])('rejects invalid date %s', date => {
    expect(articleSchema.safeParse({...base,date}).success).toBe(false);
  });
  it('creates stable ASCII and Unicode tag routes', () => {
    expect(tagSlug('Node.js')).toBe('node-js');
    expect(tagSlug('資料 工程')).toBe('資料-工程');
  });
  it('rejects missing required metadata', () => {
    for (const field of ['title','description','date','tags']) {const data = {...base} as Record<string, unknown>; delete data[field]; expect(articleSchema.safeParse(data).success).toBe(false);}
  });
  it('rejects earlier updates, empty tags and unsafe aliases', () => {
    expect(articleSchema.safeParse({...base,updated:'2026-11-26'}).success).toBe(false);
    expect(articleSchema.safeParse({...base,tags:[' ']}).success).toBe(false);
    expect(articleSchema.safeParse({...base,aliases:['../escape']}).success).toBe(false);
    expect(articleSchema.safeParse({...base,interactive:true}).success).toBe(false);
    expect(articleSchema.safeParse({...base,interactive:true,format:'html'}).success).toBe(true);
  });
});
