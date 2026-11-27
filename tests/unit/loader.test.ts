import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { articleLoader } from '../../src/compiler/articles';
import { articleSchema } from '../../src/compiler/schema';

let root: string;
beforeEach(async () => {root = await mkdtemp(path.join(tmpdir(),'blog-loader-')); await mkdir(path.join(root,'content/2026/11'),{recursive:true});});
afterEach(async () => {await rm(root,{recursive:true,force:true});});
async function article(file: string, extra = '', body = 'Body') {
  const name = path.join(root, 'content', file); await mkdir(path.dirname(name), {recursive:true});
  const date = /^date:/m.test(extra) ? '' : 'date: 2026-11-27\n';
  const tags = /^tags:/m.test(extra) ? '' : 'tags: Python, Data\n';
  await writeFile(name, `---\ntitle: Example ${file}\ndescription: Summary\n${date}${tags}${extra}---\n${body}`);
}
async function load() {
  const entries = new Map();
  const store = {clear:() => entries.clear(), set:(entry: {id:string}) => entries.set(entry.id,entry)};
  const context = {config:{root:pathToFileURL(root + path.sep)}, store, parseData:async ({data}: {data:unknown}) => articleSchema.parse(data), generateDigest:(text:string) => text, logger:{info:() => {},error:() => {}}};
  await articleLoader().load(context as never);
  return entries;
}
describe('recursive article loader', () => {
  it('loads nested articles and drafts but ignores asset and draft directories', async () => {
    await article('2026/11/public.md'); await article('2026/11/hidden.md','draft: true\n');
    await mkdir(path.join(root,'content/2026/11/assets'),{recursive:true});
    await writeFile(path.join(root,'content/2026/11/assets/not-an-article.html'),'not metadata');
    const entries = await load();
    expect([...entries.keys()]).toEqual(['hidden','public']);
    expect(entries.get('hidden').data.draft).toBe(true);
    expect(entries.get('public').data.tags).toEqual(['Python','Data']);
  });
  it('rejects duplicate slugs across directories', async () => {
    await article('2026/11/a.md','slug: same\n'); await article('2026/11/b.md','slug: same\n');
    await expect(load()).rejects.toThrow(/duplicate slug same/);
  });
  it('rejects collisions between tag route identifiers', async () => {
    await article('2026/11/a.md','tags: C++, C\n');
    await expect(load()).rejects.toThrow(/tag C collides/);
  });
  it('rejects aliases that collide with another canonical slug', async () => {
    await article('2026/11/a.md','aliases: [b]\n'); await article('2026/11/b.md');
    await expect(load()).rejects.toThrow(/alias b collides/);
  });
  it('rejects impossible unquoted calendar dates and directory mismatches', async () => {
    await article('2026/11/a.md','date: 2026-02-30\n');
    await expect(load()).rejects.toThrow(/valid YYYY-MM-DD/);
    await rm(path.join(root,'content/2026/11/a.md'));
    await article('2026/10/b.md');
    await expect(load()).rejects.toThrow(/directory does not match/);
  });
});
