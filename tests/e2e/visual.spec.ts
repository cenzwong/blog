import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const contract = JSON.parse(readFileSync(new URL('../fixtures/visual-contract.json', import.meta.url),'utf8'));

for (const theme of ['light','dark'] as const) {
  test(`article visual layout and ${theme} palette match the design contract`, async ({page}, info) => {
    await page.emulateMedia({colorScheme:theme});
    await page.goto('./posts/rolling-toolbox-pinned-workspace/');
    const result = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const title = document.querySelector<HTMLElement>('main h1')!;
      const shell = document.querySelector<HTMLElement>('main.shell')!;
      const heading = title.getBoundingClientRect(); const bounds = shell.getBoundingClientRect();
      return {
        background:body.backgroundColor, text:body.color,
        accent:getComputedStyle(document.querySelector('.article-header .eyebrow a')!).color,
        articleLayout:getComputedStyle(document.querySelector('.article-layout')!).display,
        mobileToc:getComputedStyle(document.querySelector('.toc-mobile')!).display,
        desktopToc:getComputedStyle(document.querySelector('.toc-desktop')!).display,
        headingWidth:heading.width, shellWidth:bounds.width, shellLeft:bounds.left,
        documentWidth:document.documentElement.scrollWidth, viewportWidth:innerWidth,
      };
    });
    expect({background:result.background,text:result.text,accent:result.accent}).toEqual(contract[theme]);
    expect({articleLayout:result.articleLayout,mobileToc:result.mobileToc,desktopToc:result.desktopToc}).toEqual(contract[info.project.name as 'desktop'|'mobile']);
    expect(result.headingWidth).toBeGreaterThan(0);
    expect(result.headingWidth).toBeLessThanOrEqual(result.shellWidth + 1);
    expect(result.shellLeft).toBeGreaterThan(0);
    expect(result.documentWidth).toBeLessThanOrEqual(result.viewportWidth + 1);
    await page.screenshot({path:info.outputPath(`article-${theme}-${info.project.name}.png`)});
    // Font rasterization differs between operating systems. These baselines
    // are recorded on macOS; Linux still runs the portable layout checks above.
    if (process.platform === 'darwin') {
      await expect(page).toHaveScreenshot(`article-${theme}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.005,
      });
    }
  });
}

const representativePages = [
  {name:'home', path:'./', selector:'main h1'},
  {name:'html', path:'./posts/python-performance-guide/', selector:'main h1'},
  {name:'table', path:'./posts/python-performance-guide/', selector:'.prose table'},
  {name:'math', path:'./posts/pyspark-executor-memory-tuning/', selector:'.prose .katex'},
  {name:'diagram', path:'./posts/rolling-toolbox-pinned-workspace/', selector:'.mermaid-diagram'},
  {name:'search', path:'./search/', selector:'main h1'},
  {name:'archive', path:'./archive/', selector:'main h1'},
  {name:'quick-search', path:'./', selector:'dialog[open]'},
];

for (const item of representativePages) {
  test(`${item.name} matches the macOS visual baseline`, async ({page}) => {
    test.skip(process.platform !== 'darwin', 'macOS baselines cannot reliably compare Linux font rasterization');
    await page.emulateMedia({colorScheme:'light', reducedMotion:'reduce'});
    await page.goto(item.path);
    if (item.name === 'quick-search') await page.getByRole('button', {name:'Quick search'}).click();
    const target = page.locator(item.selector).first();
    await expect(target).toBeVisible();
    if (['table', 'math', 'diagram'].includes(item.name)) await target.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${item.name}.png`, {animations:'disabled', maxDiffPixelRatio:0.005});
  });
}
