import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeParse from 'rehype-parse';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { createHighlighter } from 'shiki';
import katex from 'katex';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { realpath, stat } from 'node:fs/promises';

const schema = {
  ...defaultSchema,
  tagNames: [...defaultSchema.tagNames, 'aside', 'figure', 'figcaption'],
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-[\w-]+$/, 'math-inline', 'math-display'], 'dataRunnable', 'dataTitle'],
    span: [...(defaultSchema.attributes?.span ?? []), ['className', 'math-inline', 'math-display']],
    aside: [['className', 'callout-note', 'callout-tip', 'callout-warning']],
  },
};
const textOf = node => node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join('');
const comparable = value => value.replace(/\s+/g, ' ').trim();

const languages = ['python', 'sql', 'bash', 'javascript', 'typescript', 'json', 'yaml', 'toml', 'rust', 'text'];
let highlighterPromise;
// Dollar-delimited math may otherwise consume two currency amounts, such as
// "$10 and $20". Preserve clear currency pairs and whitespace-bounded spans.
function preserveCurrency() {
  return tree => visit(tree, 'inlineMath', (node, index, parent) => {
    if (!parent || index === undefined) return;
    const next = parent.children[index + 1];
    const closesBeforeAmount = /^\d/.test(node.value) && next?.type === 'text' && /^\d/.test(next.value);
    if (/^\s|\s$/.test(node.value) || closesBeforeAmount) parent.children[index] = {type:'text', value:`$${node.value}$`};
  });
}
function callouts() {
  return tree => visit(tree, 'containerDirective', node => {
    if (!['note','tip','warning'].includes(node.name)) return;
    node.data ??= {};
    node.data.hName = 'aside';
    node.data.hProperties = {className:[`callout-${node.name}`]};
    node.children.unshift({type:'paragraph', children:[{type:'strong',children:[{type:'text',value:node.name[0].toUpperCase() + node.name.slice(1)}]}]});
  });
}
function captions() {
  return tree => visit(tree, 'element', (node, index, parent) => {
    if (node.tagName !== 'p' || !parent || index === undefined || node.children.length !== 1) return;
    const image = node.children[0];
    if (image.type !== 'element' || image.tagName !== 'img' || typeof image.properties.title !== 'string') return;
    const caption = image.properties.title; delete image.properties.title;
    parent.children[index] = {type:'element', tagName:'figure', properties:{}, children:[image,{type:'element',tagName:'figcaption',properties:{},children:[{type:'text',value:caption}]}]};
  });
}
function codeMetadata() {
  return tree => visit(tree, 'code', node => {
    if (node.lang) node.lang = node.lang.toLowerCase();
    const options = (node.meta ?? '').trim();
    const runnable = /(?:^|\s)run(?:\s|$)/.test(options) && /^(?:python|py)$/i.test(node.lang ?? '');
    const title = options.match(/(?:^|\s)title="([^"\n]+)"/)?.[1];
    node.data ??= {};
    node.data.hProperties = { ...(node.data.hProperties ?? {}), ...(runnable ? {dataRunnable: 'true'} : {}), ...(title ? {dataTitle: title} : {}) };
  });
}
function highlight(result) {
  return async tree => {
    const blocks = [];
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || index === undefined) return;
      const code = node.children.find(child => child.type === 'element' && child.tagName === 'code');
      if (code) blocks.push({node, code, parent, index});
    });
    if (!blocks.length) return;
    highlighterPromise ??= createHighlighter({ themes: ['github-light', 'github-dark-high-contrast'], langs: languages });
    const highlighter = await highlighterPromise;
    for (const {code, parent, index} of blocks) {
      const classes = code.properties.className ?? [];
      const language = classes.find(name => name.startsWith('language-'))?.slice(9) ?? 'text';
      if (language === 'mermaid' || classes.includes('math-display')) continue;
      const aliases = {py: 'python', js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', yml: 'yaml'};
      const selected = aliases[language] ?? language;
      const supported = languages.includes(selected) ? selected : 'text';
      const rendered = highlighter.codeToHast(textOf(code), {lang: supported, themes: {light: 'github-light', dark: 'github-dark-high-contrast'}}).children[0];
      rendered.properties['data-language'] = language;
      if (code.properties.dataRunnable === 'true') { rendered.properties['data-runnable'] = 'python'; result.features.runnablePython = true; }
      if (code.properties.dataTitle) rendered.properties['data-title'] = code.properties.dataTitle;
      parent.children[index] = rendered;
    }
  };
}

// HTML documents and fragments share the same HAST pipeline. Discard active and
// global styling elements entirely before applying the conservative allowlist.
function extractBody() {
  return tree => {
    const html = tree.children.find(node => node.type === 'element' && node.tagName === 'html');
    const body = html?.children.find(node => node.type === 'element' && node.tagName === 'body');
    tree.children = body?.children ?? [];
  };
}
function stripActive(metadata) {
  return tree => visit(tree, 'element', (node, index, parent) => {
    if (metadata.format === 'html') { delete node.properties.dataRunnable; delete node.properties.dataTitle; }
    if (parent && index !== undefined && ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'button', 'input', 'select', 'textarea'].includes(node.tagName)) {
      parent.children.splice(index, 1);
      return index;
    }
  });
}
function normalize(metadata) {
  return tree => {
    function leadingElement() {
      let parent = tree;
      let node = parent.children.find(child => child.type === 'element');
      while (node && ['div', 'section', 'article'].includes(node.tagName)) {
        parent = node;
        node = parent.children.find(child => child.type === 'element');
      }
      return {parent, node};
    }
    let leading = leadingElement();
    if (leading.node?.tagName === 'h1' && comparable(textOf(leading.node)) === comparable(metadata.title)) leading.parent.children.splice(leading.parent.children.indexOf(leading.node), 1);
    leading = leadingElement();
    if (leading.node?.tagName === 'p' && comparable(textOf(leading.node)) === comparable(metadata.description)) leading.parent.children.splice(leading.parent.children.indexOf(leading.node), 1);
    visit(tree, 'element', node => { if (node.tagName === 'h1') node.tagName = 'h2'; if (node.tagName === 'table') node.properties.tabIndex = 0; });
  };
}
// Deduplicate imported IDs after slug generation and repair references to
// IDs prefixed by the sanitizer. Ambiguous links continue to target the first.
function normalizeIds(result) {
  return (tree, file) => {
    const nodes = [];
    visit(tree, 'element', node => {if (typeof node.properties.id === 'string') nodes.push(node);});
    const reserved = new Set(nodes.map(node => node.properties.id));
    const seen = new Set();
    for (const node of nodes) {
      const original = node.properties.id;
      if (seen.has(original)) {
        let suffix = 2; let candidate = `${original}-${suffix}`;
        while (reserved.has(candidate) || seen.has(candidate)) candidate = `${original}-${++suffix}`;
        node.properties.id = candidate; reserved.add(candidate);
        const message = `Duplicate ID "${original}" renamed to "${candidate}"; links to the original target the first occurrence.`;
        file.message(message, node); result.warnings.push(message);
      }
      seen.add(node.properties.id);
    }
    visit(tree, 'element', node => {
      const href = node.properties.href;
      if (typeof href !== 'string' || !href.startsWith('#')) return;
      let id; try {id = decodeURIComponent(href.slice(1));} catch {return;}
      if (!seen.has(id) && seen.has(`user-content-${id}`)) node.properties.href = `#user-content-${id}`;
    });
    let lastDepth = 1;
    visit(tree, 'element', node => {
      if (!/^h[2-6]$/.test(node.tagName) || (node.properties.className ?? []).includes('sr-only')) return;
      const depth = Number(node.tagName[1]);
      if (depth > lastDepth + 1) {
        const message = `Heading level jumps from h${lastDepth} to h${depth}: ${textOf(node)}`;
        file.message(message, node); result.warnings.push(message);
      }
      lastDepth = depth;
    });
  };
}
// Resolve local references against the source file, not its canonical URL.
// realpath prevents symlinks from escaping the repository's content root.
function resolveReferences(metadata, options, result) {
  return async tree => {
    if (!metadata.sourcePath) return;
    const projectRoot = await realpath(options.projectRoot ?? process.cwd());
    const contentRoot = await realpath(path.join(projectRoot, 'content'));
    const source = path.resolve(projectRoot, metadata.sourcePath);
    const base = options.base ?? '/blog/';
    const records = new Map((options.articles ?? []).map(article => [path.resolve(projectRoot, article.sourcePath), article.slug]));
    const references = [];
    const coverNode = metadata.cover ? {properties:{src:metadata.cover}} : null;
    if (coverNode) {
      const value = coverNode.properties.src;
      if (/^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(value) && !/^https:\/\//i.test(value)) throw new Error(`${metadata.sourcePath}: unsafe cover URL`);
      if (!/^https:\/\//i.test(value)) references.push({node:coverNode, property:'src', value});
    }
    visit(tree, 'element', node => {
      for (const property of ['src', 'href']) {
        const value = node.properties[property];
        if (typeof value === 'string' && value && !/^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(value)) references.push({node, property, value});
      }
    });
    for (const {node, property, value} of references) {
      let url;
      try {url = new URL(value, 'https://content.invalid/');} catch {throw new Error(`${metadata.sourcePath}: invalid relative reference ${value}`);}
      let target;
      try {target = path.resolve(path.dirname(source), decodeURIComponent(value.split(/[?#]/, 1)[0]));} catch {throw new Error(`${metadata.sourcePath}: invalid encoded reference ${value}`);}
      const relative = path.relative(contentRoot, target);
      if (!relative || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error(`${metadata.sourcePath}: reference escapes content root: ${value}`);
      const slug = records.get(target);
      if (slug && property === 'href') {node.properties[property] = `${base}posts/${encodeURIComponent(slug)}/${url.search}${url.hash}`; continue;}
      if (/\.(?:md|html?)$/i.test(target)) throw new Error(`${metadata.sourcePath}: unresolved article reference ${value}`);
      let actual;
      try {actual = await realpath(target); if (!(await stat(actual)).isFile()) throw new Error('not a file');} catch {throw new Error(`${metadata.sourcePath}: missing asset ${value}`);}
      const safe = path.relative(contentRoot, actual);
      if (!safe || safe.startsWith('..' + path.sep) || path.isAbsolute(safe)) throw new Error(`${metadata.sourcePath}: asset escapes content root: ${value}`);
      const encoded = safe.split(path.sep).map(encodeURIComponent).join('/');
      node.properties[property] = `${base}content-assets/${encoded}${url.search}${url.hash}`;
      result.assetPaths.push(safe.split(path.sep).join('/'));
    }
    if (coverNode) result.cover = coverNode.properties.src;
  };
}
// HTML imports do not pass through remark-math. Render delimited text only
// outside code blocks, after sanitisation; KaTeX output is trusted generated HTML.
function diagrams(options) {
  return tree => visit(tree, 'element', (node, index, parent) => {
    if (node.tagName !== 'pre' || !parent || index === undefined) return;
    const code = node.children.find(child => child.type === 'element' && child.tagName === 'code');
    if (!code || !(code.properties.className ?? []).includes('language-mermaid')) return;
    const source = textOf(code).replace(/\n$/, '');
    const hash = createHash('sha256').update(source).digest('hex').slice(0, 20);
    const base = options.base ?? '/blog/';
    const dimensions = options.diagramDimensions?.[hash] ?? {};
    const element = (tagName, properties, children = []) => ({type:'element', tagName, properties, children});
    const diagram = element('figure', {className:['mermaid-diagram']}, [
      element('img', {className:['diagram-light'], src:`${base}diagrams/${hash}-light.svg`, alt:'Diagram; its source follows', loading:'lazy', ...dimensions.light}),
      element('img', {className:['diagram-dark'], src:`${base}diagrams/${hash}-dark.svg`, alt:'Diagram; its source follows', loading:'lazy', ...dimensions.dark}),
      element('details', {'data-pagefind-ignore':''}, [element('summary', {}, [{type:'text',value:'Diagram source'}]), node]),
    ]);
    parent.children[index] = diagram;
    return index + 1;
  });
}
function htmlMath(result) {
  return tree => {
    const candidates = [];
    function walk(node, parent) {
      if (node.type === 'element' && ['pre', 'code', 'script', 'style'].includes(node.tagName)) return;
      if (node.type === 'text' && parent && node.value.includes('$')) candidates.push({node, parent});
      for (const child of node.children ?? []) walk(child, node);
    }
    walk(tree, null);
    for (const {node, parent} of candidates) {
      const pattern = /\$\$([\s\S]+?)\$\$|\$(?!\s|\d+(?:[.,]\d{2})?(?:\s|$))([^$\n]+?)(?<!\s)\$/g;
      const parts = []; let last = 0, match;
      while ((match = pattern.exec(node.value))) {
        if (match.index > last) parts.push({type:'text', value:node.value.slice(last, match.index)});
        const markup = katex.renderToString(match[1] ?? match[2], {displayMode:Boolean(match[1]), throwOnError:false, trust:false});
        parts.push(...unified().use(rehypeParse, {fragment:true}).parse(markup).children);
        last = pattern.lastIndex; result.features.math = true;
      }
      if (!parts.length) continue;
      if (last < node.value.length) parts.push({type:'text', value:node.value.slice(last)});
      const index = parent.children.indexOf(node);
      if (index >= 0) parent.children.splice(index, 1, ...parts);
    }
  };
}
function headingLinks() {
  return tree => visit(tree, 'element', node => {
    if (!/^h[2-6]$/.test(node.tagName) || !node.properties.id) return;
    const label = `Link to ${textOf(node)}`;
    node.children.push({type: 'text', value: ' '}, {type: 'element', tagName: 'a', properties: {href: `#${node.properties.id}`, className: ['heading-link'], ariaLabel: label}, children: [{type: 'text', value: '#'}]});
  });
}
function collect(result) {
  return tree => {
    visit(tree, 'element', node => {
      if (/^h[2-6]$/.test(node.tagName) && !(node.properties.className ?? []).includes('sr-only')) result.headings.push({ id: String(node.properties.id ?? ''), text: textOf(node), depth: Number(node.tagName[1]) });
      if (node.tagName === 'pre') result.features.codeBlocks = true;
      if (node.tagName === 'code' && (node.properties.className ?? []).includes('language-mermaid')) result.features.diagrams = true;
      if (node.tagName === 'img' && typeof node.properties.src === 'string') result.assets.push(node.properties.src);
    });
    const words = textOf(tree).trim().match(/\S+/g) ?? [];
    result.wordCount = words.length;
    result.readingTimeMinutes = Math.max(1, Math.ceil(words.length / 200));
  };
}

/** Compile authored markup without granting it executable capabilities. */
export async function compileArticle(source, metadata, options = {}) {
  const result = { html: '', cover: /** @type {string | undefined} */ (undefined), headings: [], warnings: [], wordCount: 0, readingTimeMinutes: 1, assets: [], assetPaths: [], features: { math: /\$/.test(source), diagrams: false, codeBlocks: false, runnablePython: false, interactiveHTML: Boolean(metadata.interactive) } };
  let pipeline = unified();
  if (metadata.format === 'md') pipeline = pipeline.use(remarkParse).use(remarkGfm).use(remarkMath).use(remarkDirective).use(callouts).use(preserveCurrency).use(codeMetadata).use(remarkRehype);
  else pipeline = pipeline.use(rehypeParse).use(extractBody);
  pipeline = pipeline.use(stripActive, metadata).use(rehypeSanitize, schema).use(captions).use(normalize, metadata).use(rehypeSlug).use(normalizeIds, result).use(resolveReferences, metadata, options, result).use(collect, result).use(headingLinks).use(diagrams, options).use(highlight, result).use(rehypeKatex);
  if (metadata.format === 'html') pipeline = pipeline.use(htmlMath, result);
  const file = await pipeline.use(rehypeStringify).process(source);
  result.html = String(file);
  return result;
}
