import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const mime = {png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',avif:'image/avif',svg:'image/svg+xml',woff:'font/woff',woff2:'font/woff2'};
const element = (tagName, properties = {}, children = []) => ({type:'element',tagName,properties,children});

/** Build a script-only sandbox document; reviewed executable HTML is never inserted into the parent page. */
export async function compileInteractiveHtml(source, metadata, options = {}) {
  const projectRoot = await realpath(options.projectRoot ?? process.cwd());
  const root = await realpath(path.join(projectRoot,'content'));
  const sourceFile = path.resolve(projectRoot,metadata.sourcePath);
  async function localFile(value, relativeTo = sourceFile) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(value)) throw new Error(`${metadata.sourcePath}: interactive asset must be relative: ${value}`);
    let filename;
    try {filename = path.resolve(path.dirname(relativeTo),decodeURIComponent(value.split(/[?#]/,1)[0]));} catch {throw new Error(`${metadata.sourcePath}: invalid interactive asset ${value}`);}
    const relative = path.relative(root,filename);
    if (!relative || relative.startsWith('..'+path.sep) || path.isAbsolute(relative)) throw new Error(`${metadata.sourcePath}: interactive asset escapes content root: ${value}`);
    let actual;
    try {actual = await realpath(filename);} catch {throw new Error(`${metadata.sourcePath}: missing interactive asset ${value}`);}
    const safe = path.relative(root,actual);
    if (!safe || safe.startsWith('..'+path.sep) || path.isAbsolute(safe)) throw new Error(`${metadata.sourcePath}: interactive asset escapes content root: ${value}`);
    return actual;
  }
  async function dataUrl(value, relativeTo = sourceFile) {
    if (/^data:(?:image|font)\//i.test(value) || value.startsWith('#')) return value;
    const file = await localFile(value,relativeTo);
    const type = mime[path.extname(file).slice(1).toLowerCase()];
    if (!type) throw new Error(`${metadata.sourcePath}: unsupported interactive asset type: ${value}`);
    return `data:${type};base64,${(await readFile(file)).toString('base64')}`;
  }
  async function cssValue(value, relativeTo) {
    const parsed = valueParser(value); const urls = [];
    parsed.walk(node => {if (node.type === 'function' && node.value.toLowerCase() === 'url') urls.push(node);});
    for (const node of urls) {
      const value = valueParser.stringify(node.nodes).trim().replace(/^(['"])([\s\S]*)\1$/, '$2');
      if (!value) continue;
      const rewritten = await dataUrl(value,relativeTo);
      node.nodes = [{type:'string',quote:'"',value:rewritten}];
    }
    return parsed.toString();
  }
  async function css(source, relativeTo) {
    const tree = postcss.parse(source, {from:relativeTo});
    const imports = []; tree.walkAtRules(rule => {if (rule.name.toLowerCase() === 'import') imports.push(rule);});
    if (imports.length) throw new Error(`${metadata.sourcePath}: @import is not supported in isolated demos; use a local stylesheet link instead.`);
    const declarations = []; tree.walkDecls(declaration => declarations.push(declaration));
    for (const declaration of declarations) declaration.value = await cssValue(declaration.value,relativeTo);
    return tree.toString();
  }
  const tree = unified().use(rehypeParse).parse(source);
  const html = tree.children.find(node => node.type === 'element' && node.tagName === 'html');
  const head = html.children.find(node => node.type === 'element' && node.tagName === 'head');
  const nodes = []; visit(tree, 'element', (node,index,parent) => {nodes.push({node,index,parent});});
  for (const {node,index,parent} of nodes) {
    if (typeof node.properties.style === 'string') {
      const wrapper = postcss.parse(`x{${node.properties.style}}`);
      const declarations = []; wrapper.walkDecls(declaration => declarations.push(declaration));
      for (const declaration of declarations) declaration.value = await cssValue(declaration.value,sourceFile);
      node.properties.style = wrapper.first.nodes.map(declaration => declaration.toString()).join(';');
    }
    if (node.tagName === 'style') {
      const text = node.children.map(child => child.value ?? '').join('');
      node.children = [{type:'text',value:await css(text,sourceFile)}];
    }
    if (node.tagName === 'link' && (node.properties.rel ?? []).includes('stylesheet') && typeof node.properties.href === 'string') {
      const file = await localFile(node.properties.href);
      const text = await css(await readFile(file,'utf8'),file);
      parent.children[index] = element('style',{},[{type:'text',value:text}]);
    }
    if (node.tagName === 'script' && typeof node.properties.src === 'string') {
      const file = await localFile(node.properties.src);
      delete node.properties.src;
      node.children = [{type:'text',value:await readFile(file,'utf8')}];
    }
    if ((node.tagName === 'img' || node.tagName === 'source') && typeof node.properties.src === 'string') node.properties.src = await dataUrl(node.properties.src);
    if (node.properties.srcSet) throw new Error(`${metadata.sourcePath}: srcset is not supported in isolated demos; use an image src.`);
    if (node.tagName === 'video' && typeof node.properties.poster === 'string') node.properties.poster = await dataUrl(node.properties.poster);
  }
  const siteCss = options.siteCss ?? await readFile(path.join(projectRoot,'src/styles/demo.css'),'utf8');
  head.children.unshift(
    element('meta',{charSet:'utf-8'}),
    element('meta',{name:'viewport',content:'width=device-width,initial-scale=1'}),
    element('meta',{name:'robots',content:'noindex,nofollow'}),
    element('meta',{httpEquiv:'Content-Security-Policy',content:"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; form-action 'none'; base-uri 'none'; connect-src 'none'"}),
    element('style',{},[{type:'text',value:`${siteCss}\nhtml,body{min-height:100%;padding:1rem}`}]),
  );
  if (!tree.children.some(node => node.type === 'doctype')) tree.children.unshift({type:'doctype'});
  return unified().use(rehypeStringify).stringify(tree);
}
