import { test, expect } from 'vitest';
import { mkdtemp, mkdir, rm, writeFile, readFile, cp, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
const exec = promisify(execFile);

test('isolated production build publishes only allowed fixtures and preserves routes, assets and sandbox', async () => {
  const project = process.cwd(); const root = await mkdtemp(path.join(tmpdir(),'blog-publication-'));
  try {
    for (const dir of ['src','public']) await cp(path.join(project,dir),path.join(root,dir),{recursive:true});
    for (const file of ['astro.config.mjs','package.json','tsconfig.json']) await cp(path.join(project,file),path.join(root,file));
    await symlink(path.join(project,'node_modules'),path.join(root,'node_modules'),'dir');
    await mkdir(path.join(root,'.generated/diagrams'),{recursive:true});
    const content = path.join(root,'content/2026/11'); await mkdir(path.join(content,'assets'),{recursive:true});
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ioAAAAASUVORK5CYII=','base64');
    await writeFile(path.join(content,'assets/cover.png'),image);
    await writeFile(path.join(content,'assets/demo.js'),"document.body.dataset.ran='yes'");
    await writeFile(path.join(content,'assets/demo.css'),'p { background-image: url(cover.png) }');
    await writeFile(path.join(content,'published.md'),`---\ntitle: Fixture Published\ndescription: Published fixture.\ndate: 2026-11-27\ntags: [Python, Testing, 資料]\nslug: fixture-published\naliases: [fixture-old]\ncover: ./assets/cover.png\nfeatured: true\nseries:\n  name: Fixture Series\n  order: 1\n---\n\n# Fixture Published\n\n[Demo](./demo.html) and ![image](./assets/cover.png).\n`);
    await writeFile(path.join(content,'demo.html'),`<!--\ntitle: Fixture Demo\ndescription: Interactive fixture.\ndate: 2026-11-27\ntags: Testing\nslug: fixture-demo\ninteractive: true\nseries:\n  name: Fixture Series\n  order: 2\n-->\n<link rel="stylesheet" href="./assets/demo.css"><p>Static fixture text.</p><img src="./assets/cover.png"><script src="./assets/demo.js"></script>`);
    await writeFile(path.join(content,'draft.md'),`---\ntitle: Fixture Secret Draft\ndescription: Never publish this.\ndate: 2026-11-27\ntags: Draft\nslug: fixture-draft\ndraft: true\n---\nDRAFT_FIXTURE_MARKER`);
    const env = {...process.env, ASTRO_TELEMETRY_DISABLED:'1', VITE_BASE:'/blog/', SITE_URL:'https://example.com/blog'};
    delete env.BASE_URL;
    const {stdout} = await exec(process.execPath,[path.join(project,'node_modules/astro/astro.js'),'build','--outDir','./out'],{cwd:root,env,timeout:60000,maxBuffer:4_000_000});
    expect(stdout).toContain('/posts/fixture-published/index.html');
    const out = path.join(root,'out');
    const page = await readFile(path.join(out,'posts/fixture-published/index.html'),'utf8');
    expect(page).toContain('/blog/posts/fixture-demo/');
    expect(page).toContain('Series: Fixture Series');
    expect(await readFile(path.join(out,'index.html'),'utf8')).toContain('Featured articles');
    expect(page).toContain('/blog/content-assets/2026/11/assets/cover.png');
    expect(page).toMatch(/property="og:image" content="https:\/\/example\.com\/blog\/content-assets/);
    expect(await readFile(path.join(out,'content-assets/2026/11/assets/cover.png'))).toEqual(image);
    expect(page).toContain('/blog/tags/%E8%B3%87%E6%96%99/');
    await access(path.join(out,'tags/資料/index.html'));
    const alias = await readFile(path.join(out,'posts/fixture-old/index.html'),'utf8');
    expect(alias).toContain('http-equiv="refresh"'); expect(alias).toContain('/blog/posts/fixture-published/');
    const demo = await readFile(path.join(out,'posts/fixture-demo/index.html'),'utf8');
    expect(demo).toContain('sandbox="allow-scripts"'); expect(demo).toContain('Static fixture text.');
    expect(demo).not.toContain("document.body.dataset.ran='yes'");
    const frame = await readFile(path.join(out,'demos/fixture-demo.html'),'utf8');
    expect(frame).toContain('data:image/png;base64,');
    expect(frame).toContain("document.body.dataset.ran='yes'");
    expect(frame).toContain('connect-src &#x27;none&#x27;');
    await expect(access(path.join(out,'posts/fixture-draft/index.html'))).rejects.toThrow();
    for (const file of ['index.html','metadata.json','rss.xml','sitemap.xml']) {
      const text = await readFile(path.join(out,file),'utf8');
      expect(text).not.toContain('fixture-draft'); expect(text).not.toContain('DRAFT_FIXTURE_MARKER');
      if (file === 'sitemap.xml') expect(text).not.toContain('fixture-old');
    }
    const indexed = await exec(path.join(project,'node_modules/.bin/pagefind'),['--site',out,'--root-selector','[data-pagefind-body]'],{cwd:root,env,timeout:30000});
    expect(indexed.stdout).toMatch(/Indexed 2 pages/);
  } finally {await rm(root,{recursive:true,force:true});}
}, 90000);
