import { readdir, readFile, mkdir, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { load, JSON_SCHEMA } from 'js-yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import puppeteer from 'puppeteer';
import { renderMermaid } from '@mermaid-js/mermaid-cli';

const root = path.resolve('content');
const output = path.resolve('.generated/diagrams');
async function discover(dir) {
  const files = [];
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    if (entry.name.startsWith('.') || ['assets','drafts'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await discover(file));
    else if (entry.isFile() && /\.md$/i.test(entry.name)) files.push(file);
  }
  return files;
}
const diagrams = new Map();
for (const file of await discover(root)) {
  const parsed = matter(await readFile(file, 'utf8'), {engines:{yaml: text => load(text, {schema:JSON_SCHEMA})}});
  if (parsed.data.draft) continue;
  const tree = unified().use(remarkParse).parse(parsed.content);
  visit(tree, 'code', node => {
    if (node.lang?.toLowerCase() !== 'mermaid') return;
    const hash = createHash('sha256').update(node.value).digest('hex').slice(0, 20);
    diagrams.set(hash, {source: node.value, file});
  });
}
await rm(output, {recursive:true, force:true});
await mkdir(output, {recursive:true});
const dimensions = {};
if (diagrams.size) {
  const candidates = [process.env.PUPPETEER_EXECUTABLE_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
  let executablePath;
  for (const candidate of candidates) { try {await access(candidate); executablePath = candidate; break;} catch {} }
  let browser;
  try {
    browser = await puppeteer.launch({headless:true, ...(executablePath ? {executablePath} : {}), ...(process.env.PUPPETEER_NO_SANDBOX === '1' ? {args:['--no-sandbox']} : {})});
    for (const [hash, {source, file}] of diagrams) for (const theme of ['light','dark']) {
      try {
        const {data} = await renderMermaid(browser, source, 'svg', {backgroundColor:'transparent', svgId:`diagram-${hash}-${theme}`, mermaidConfig:{theme:theme === 'dark' ? 'dark' : 'default', securityLevel:'strict'}});
        const svg = Buffer.from(data);
        const box = svg.toString('utf8').match(/\bviewBox="[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)"/);
        if (!box || Number(box[1]) <= 0 || Number(box[2]) <= 0) throw new Error('Rendered SVG has no valid viewBox');
        dimensions[hash] ??= {};
        dimensions[hash][theme] = {width:Math.ceil(Number(box[1])),height:Math.ceil(Number(box[2]))};
        await writeFile(path.join(output, `${hash}-${theme}.svg`), svg);
      } catch (error) {throw new Error(`${path.relative(process.cwd(),file)}: Mermaid ${theme} rendering failed: ${error.message}`, {cause:error});}
    }
  } catch (error) {
    throw new Error(`Unable to build Mermaid diagrams: ${error.message}. Install Chrome for Puppeteer or set PUPPETEER_EXECUTABLE_PATH.`, {cause:error});
  } finally {await browser?.close();}
}
await writeFile(path.resolve('.generated/diagram-dimensions.json'), JSON.stringify(dimensions) + '\n');
console.log(`Rendered ${diagrams.size} Mermaid diagrams in light and dark themes.`);
