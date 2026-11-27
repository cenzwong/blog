import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { load as loadYaml, JSON_SCHEMA } from 'js-yaml';
import type { Loader } from 'astro/loaders';
import { tagSlug } from '../lib/tags';

const extensions = new Set(['.md', '.html', '.htm']);

async function discover(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'assets' || entry.name === 'drafts') continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await discover(file));
    else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) result.push(file);
  }
  return result.sort();
}

export function articleLoader(): Loader {
  return {
    name: 'article-loader',
    async load({ config, store, parseData, generateDigest, watcher, logger }) {
      const root = path.join(fileURLToPath(config.root), 'content');
      const sync = async () => {
        const files = await discover(root);
        const records: Array<{id: string; data: Record<string, unknown>; body: string; filePath: string; digest: string}> = [];
        const slugs = new Map<string, string>();
        const tagIds = new Map<string, string>();
        for (const file of files) {
          const text = await readFile(file, 'utf8');
          const isHtml = /\.html?$/i.test(file);
          let parsed;
          try {
            parsed = matter(text, { ...(isHtml ? { delimiters: ['<!--', '-->'] } : {}), engines: {yaml: input => loadYaml(input, {schema: JSON_SCHEMA}) as object} });
          } catch (error) { throw new Error(`${file}: invalid metadata: ${String(error)}`); }
          if (!parsed.matter) throw new Error(`${file}: missing metadata block`);
          const slug = String(parsed.data.slug ?? path.basename(file, path.extname(file))).trim();
          if (slugs.has(slug)) throw new Error(`${file}: duplicate slug ${slug}; already used by ${slugs.get(slug)}`);
          slugs.set(slug, file);
          const raw: Record<string, unknown> = { ...parsed.data, slug, format: isHtml ? 'html' : 'md', sourcePath: path.relative(fileURLToPath(config.root), file).split(path.sep).join('/') };
          const data = await parseData({ id: slug, filePath: file, data: raw });
          const canonicalTags: string[] = [];
          for (const tag of data.tags as string[]) {
            const key = tagSlug(tag);
            const previous = tagIds.get(key);
            if (!key || (previous && previous.toLowerCase() !== tag.toLowerCase())) throw new Error(`${file}: tag ${tag} collides with ${previous ?? 'an empty tag route'}`);
            tagIds.set(key, previous ?? tag);
            if (!canonicalTags.includes(previous ?? tag)) canonicalTags.push(previous ?? tag);
          }
          data.tags = canonicalTags;
          const relative = path.relative(root, file).split(path.sep);
          if (relative.length >= 3 && /^\d{4}$/.test(relative[0]) && /^\d{2}$/.test(relative[1]) && `${relative[0]}-${relative[1]}` !== String(data.date).slice(0, 7)) throw new Error(`${file}: directory does not match publication date ${data.date}`);
          records.push({ id: slug, data, body: parsed.content, filePath: path.relative(fileURLToPath(config.root), file), digest: generateDigest(text) });
        }
        const usedRoutes = new Map(slugs);
        for (const record of records) for (const alias of record.data.aliases as string[]) {
          const existing = usedRoutes.get(alias);
          if (existing) throw new Error(`${record.filePath}: alias ${alias} collides with ${existing}`);
          usedRoutes.set(alias, record.filePath);
        }
        store.clear();
        for (const record of records) store.set(record);
        logger.info(`Loaded ${records.length} articles`);
      };
      await sync();
      if (watcher) {
        let pending: ReturnType<typeof setTimeout> | undefined;
        watcher.add(root);
        watcher.on('all', (_event, file) => {
          if (!file.startsWith(root + path.sep)) return;
          clearTimeout(pending);
          pending = setTimeout(() => { void sync().catch(error => logger.error(String(error))); }, 100);
        });
      }
    },
  };
}
