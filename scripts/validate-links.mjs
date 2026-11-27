import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { visit } from 'unist-util-visit';

async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes:true});
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : entry.name.endsWith('.html') ? [path.join(dir,entry.name)] : []))).flat();
}

/** Validate same-site file references and fragment targets using parsed HTML. */
export async function validateLinks(dist, base) {
  const documents = new Map();
  for (const file of await walk(dist)) {
    const tree = unified().use(rehypeParse).parse(await readFile(file,'utf8'));
    const ids = new Set(); const links = [];
    visit(tree, 'element', node => {
      if (typeof node.properties.id === 'string') ids.add(node.properties.id);
      for (const name of ['href','src']) {
        const value = node.properties[name];
        if (typeof value === 'string' && value) links.push({name,value});
      }
    });
    documents.set(file,{ids,links});
  }
  for (const [source, document] of documents) {
    const relative = path.relative(dist,source).split(path.sep).join('/');
    const pathname = relative.endsWith('/index.html') ? relative.slice(0,-'index.html'.length) : relative === 'index.html' ? '' : relative;
    const origin = 'https://static.invalid';
    const current = new URL(base + pathname, origin);
    for (const {name,value} of document.links) {
      if (/^(?:mailto:|tel:|data:|javascript:)/i.test(value)) continue;
      let url;
      try {url = new URL(value,current);} catch {throw new Error(`Invalid ${name} in ${relative}: ${value}`);}
      if (url.origin !== origin) continue;
      if (!url.pathname.startsWith(base)) throw new Error(`Internal URL escapes configured base in ${relative}: ${value}`);
      let target;
      try {target = path.join(dist,decodeURIComponent(url.pathname.slice(base.length)));} catch {throw new Error(`Invalid encoded URL in ${relative}: ${value}`);}
      const targetRelative = path.relative(dist,target);
      if (targetRelative.startsWith('..' + path.sep) || path.isAbsolute(targetRelative)) throw new Error(`Internal URL escapes output directory in ${relative}: ${value}`);
      let info;
      try {info = await stat(target);} catch {throw new Error(`Broken internal URL in ${relative}: ${value}`);}
      if (info.isDirectory()) target = path.join(target,'index.html');
      if (!documents.has(target)) {
        try {await stat(target);} catch {throw new Error(`Broken internal URL in ${relative}: ${value}`);}
      }
      if (name === 'href' && url.hash.length > 1 && documents.has(target)) {
        let fragment;
        try {fragment = decodeURIComponent(url.hash.slice(1));} catch {throw new Error(`Invalid fragment in ${relative}: ${value}`);}
        if (!documents.get(target).ids.has(fragment)) throw new Error(`Broken fragment in ${relative}: ${value}`);
      }
    }
  }
}
