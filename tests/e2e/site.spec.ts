import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paths = {home:'./', article:'./posts/rolling-toolbox-pinned-workspace/', search:'./search/', interactive:'./posts/iceberg-pyspark-bloom-filter-deep-dive/'};
test('unknown routes show a useful 404 and return to the homepage', async ({page, baseURL}) => {
  const response = await page.goto('./this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', {name:'Page not found'})).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('link', {name:'Return to the articles'}).click();
  await expect(page.getByRole('heading', {level:1})).toBeVisible();
  await expect(page).toHaveURL(baseURL!);
});

test('mobile page controls meet automated target-size checks', async ({page}, info) => {
  test.skip(info.project.name !== 'mobile', 'target-size coverage uses the mobile viewport');
  for (const path of [paths.home, paths.article, paths.search, paths.interactive, './posts/python-performance-guide/', './archive/']) {
    await page.goto(path);
    const accessibility = await new AxeBuilder({page}).withRules(['target-size']).analyze();
    expect(accessibility.violations, `target size on ${path}`).toEqual([]);
  }
  await page.goto(paths.home);
  await page.getByRole('button', {name:'Quick search'}).click();
  const dialogAccessibility = await new AxeBuilder({page}).withRules(['target-size']).analyze();
  expect(dialogAccessibility.violations, 'target size in quick search').toEqual([]);
});

for (const [name, path] of Object.entries({home:paths.home, article:paths.article, search:paths.search, html:'./posts/python-performance-guide/', interactive:paths.interactive})) {
  test(`${name} renders without overflow and passes automated accessibility checks`, async ({page}, info) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('astro-error-overlay')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const accessibility = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    expect(accessibility.violations).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({path:info.outputPath(`${name}-${info.project.name}.png`)});
  });
}

test('search supports filters, shareable state and browser navigation', async ({page}) => {
  await page.goto(paths.search);
  await page.getByRole('searchbox', {name:'Search articles'}).fill('pyspark');
  await expect(page.locator('main [data-search-status]')).toContainText('results');
  await expect(page).toHaveURL(/q=pyspark/);
  await page.getByLabel('Topic').selectOption({label:'PySpark'});
  await expect(page).toHaveURL(/tag=PySpark/);
  const first = page.locator('main [data-search-results] li').first();
  await expect(first.locator('a').first()).toBeVisible();
  await expect(first.locator('time')).toBeVisible();
  await expect(first.locator('.search-date').last()).toContainText('PySpark');
  await page.goBack();
  await expect(page.getByLabel('Topic')).toHaveValue('');
  await expect(page.getByRole('searchbox', {name:'Search articles'})).toHaveValue('pyspark');
});

test('quick search opens, returns results and restores focus on Escape', async ({page}) => {
  await page.goto(paths.home);
  const trigger = page.getByRole('button', {name:'Quick search'}); await trigger.click();
  const dialog = page.getByRole('dialog', {name:'Quick search'});
  await expect(dialog).toBeVisible();
  await dialog.getByRole('searchbox').fill('python');
  await expect(dialog.locator('[data-search-results] a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden(); await expect(trigger).toBeFocused();
  await page.keyboard.press('ControlOrMeta+K'); await expect(dialog).toBeVisible();
  await page.keyboard.press('ArrowDown'); await expect(dialog.locator('[data-search-results] a').first()).toBeFocused();
  await page.keyboard.press('Enter'); await expect(page).toHaveURL(/\/posts\//);
});

test('article is readable without JavaScript and includes static diagrams', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage(); await page.goto(paths.article);
  await expect(page.getByRole('heading', {level:1})).toHaveText('Rolling Toolbox, Pinned Workspace');
  await expect(page.locator('#open-search')).toBeHidden();
  await expect(page.locator('#theme-toggle')).toBeHidden();
  const diagram = page.locator('.mermaid-diagram img:visible').first();
  await expect(diagram).toBeVisible();
  expect(await diagram.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await context.close();
});

test('interactive calculator remains in a script-only frame and responds', async ({page}) => {
  await page.goto(paths.interactive);
  const iframe = page.locator('iframe'); await expect(iframe).toHaveAttribute('sandbox','allow-scripts');
  await iframe.scrollIntoViewIfNeeded();
  const frame = page.frameLocator('iframe');
  await frame.locator('#input-ndv').fill('100000');
  await expect(frame.locator('#res-bits')).toHaveText('958,506 bits');
});

test('theme preference cycles and ordinary Python examples have no Run button', async ({page}) => {
  await page.goto(paths.article);
  const theme = page.locator('#theme-toggle');
  await theme.click(); await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await theme.click(); await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('.mermaid-diagram').first().scrollIntoViewIfNeeded();
  await expect(page.locator('.diagram-dark').first()).toBeVisible();
  await theme.click(); await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page.getByRole('button', {name:'Run Python'})).toHaveCount(0);
  await expect(page.getByRole('button', {name:'Copy code'}).first()).toBeVisible();
});

test('dark article theme passes automated accessibility checks', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'}); await page.goto(paths.article);
  const accessibility = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('mobile table of contents is collapsed and can be opened without JavaScript', async ({browser}, info) => {
  test.skip(info.project.name !== 'mobile', 'Mobile layout only');
  const context = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page = await context.newPage(); await page.goto(paths.article);
  const toc = page.locator('.toc-mobile'); await expect(toc).not.toHaveAttribute('open');
  await toc.locator('summary').click(); await expect(toc).toHaveAttribute('open');
  await expect(toc.locator('a').first()).toBeVisible(); await context.close();
});

test('copy control places source code on the clipboard', async ({page, context}) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto(paths.article);
  const controls = page.locator('.code-controls').first();
  const source = await controls.locator('xpath=following-sibling::pre[1]//code').textContent();
  await controls.getByRole('button',{name:'Copy code'}).click();
  await expect(controls.getByRole('status')).toHaveText('Code copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
});

test('published opt-in Python runs in Pyodide and a long-running example can be cancelled', async ({page}, info) => {
  test.skip(info.project.name !== 'desktop', 'One real Pyodide download is sufficient');
  test.setTimeout(120000);
  await page.goto('./posts/bit-manipulation-revision/');
  const examples = page.locator('pre[data-runnable="python"]'); await expect(examples).toHaveCount(4);
  const pre = examples.first();
  const controls = pre.locator('xpath=preceding-sibling::div[contains(@class,"code-controls")][1]');
  const output = pre.locator('xpath=following-sibling::pre[contains(@class,"python-output")][1]');
  await controls.getByRole('button',{name:'Run Python'}).click();
  await expect(output).toHaveText('Result:\n0b1010',{timeout:90000});
  await pre.locator('code').evaluate(node => {node.textContent = 'while True:\n    pass';});
  await controls.getByRole('button',{name:'Run Python'}).click();
  await controls.getByRole('button',{name:'Cancel'}).click();
  await expect(output).toHaveText('Execution cancelled.');
  await controls.getByRole('button',{name:'Reset'}).click();
  await expect(output).toHaveText('Python worker reset.');
});

test('legacy hash links lead to the current article and static pages', async ({page}) => {
  await page.goto('./#/post/rolling-toolbox-pinned-workspace');
  await expect(page).toHaveURL(/\/posts\/rolling-toolbox-pinned-workspace\/$/);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Rolling Toolbox, Pinned Workspace');
  await page.goto('./#/about'); await expect(page).toHaveURL(/\/about\/$/);
  await page.goto('./#/search'); await expect(page).toHaveURL(/\/search\/$/);
});

test('article contents links navigate to a matching heading', async ({page}, info) => {
  await page.goto(paths.article);
  const toc = info.project.name === 'mobile' ? page.locator('.toc-mobile') : page.locator('.toc-desktop');
  if (info.project.name === 'mobile') await toc.locator('summary').click();
  const first = toc.locator('a[href^="#"]').first();
  const target = await first.getAttribute('href'); await first.click();
  expect(new URL(page.url()).hash).toBe(target);
  await expect(page.locator(`[id="${target!.slice(1)}"]`)).toBeVisible();
});

test('representative technical content produces screenshot evidence', async ({page}, info) => {
  const captures = [
    ['table','./posts/python-performance-guide/','.prose table'],
    ['math','./posts/pyspark-executor-memory-tuning/','.prose .katex'],
    ['diagram',paths.article,'.mermaid-diagram'],
    ['archive','./archive/','main h1'],
  ];
  for (const [name,url,selector] of captures) {
    await page.goto(url); const target = page.locator(selector).first(); await target.scrollIntoViewIfNeeded(); await expect(target).toBeVisible();
    await page.screenshot({path:info.outputPath(`${name}-${info.project.name}.png`)});
  }
  await page.goto(paths.home); await page.getByRole('button',{name:'Quick search'}).click();
  await expect(page.getByRole('dialog',{name:'Quick search'})).toBeVisible();
  await page.screenshot({path:info.outputPath(`quick-search-${info.project.name}.png`)});
});

test('keyboard-only navigation opens search, moves through results and restores focus', async ({page}) => {
  await page.goto(paths.home);
  const trigger = page.getByRole('button',{name:'Quick search'});
  for (let i=0; i<20 && !(await trigger.evaluate(node => node === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog',{name:'Quick search'});
  await expect(dialog.getByRole('searchbox')).toBeFocused();
  await page.keyboard.type('python');
  await expect(dialog.locator('[data-search-results] a').first()).toBeVisible();
  await page.keyboard.press('ArrowDown'); await expect(dialog.locator('[data-search-results] a').first()).toBeFocused();
  await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); await expect(trigger).toBeFocused();
});

for (const theme of ['light', 'dark'] as const) {
  test(`keyboard focus has a visible indicator in ${theme} mode`, async ({page}) => {
    await page.emulateMedia({colorScheme:theme});
    await page.goto(paths.home);
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus-visible');
    await expect(focused).toHaveCount(1);
    await expect(focused).toBeVisible();
    const outline = await focused.evaluate(element => {
      const style = getComputedStyle(element);
      return {style:style.outlineStyle, width:parseFloat(style.outlineWidth), color:style.outlineColor};
    });
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThanOrEqual(2);
    expect(outline.color).not.toBe('transparent');
  });
}

test('reduced-motion preference disables smooth scrolling', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await page.goto(paths.article);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

test('search offers archive navigation without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false}); const page = await context.newPage();
  await page.goto(paths.search);
  await expect(page.getByRole('link',{name:'browse the archive'})).toBeVisible();
  await expect(page.locator('main [data-search]')).toBeHidden();
  await expect(page.getByRole('link',{name:'browse the archive'})).toHaveAttribute('href',/\/archive\/$/); await context.close();
});

test('interactive frame cannot access the parent, storage or network', async ({page}) => {
  await page.goto(paths.interactive);
  const iframe = page.locator('iframe'); await iframe.scrollIntoViewIfNeeded();
  await expect(page.frameLocator('iframe').locator('#input-ndv')).toBeVisible();
  const frame = page.frames().find(item => item.url().includes('/demos/iceberg-pyspark-bloom-filter-deep-dive.html'));
  expect(frame).toBeTruthy();
  const result = await frame!.evaluate(async () => {
    let parentBlocked = false, storageBlocked = false, networkBlocked = false;
    try {void window.parent.document.title;} catch {parentBlocked = true;}
    try {localStorage.getItem('probe');} catch {storageBlocked = true;}
    try {await fetch(`${location.origin}/metadata.json`);} catch {networkBlocked = true;}
    return {parentBlocked,storageBlocked,networkBlocked};
  });
  expect(result).toEqual({parentBlocked:true,storageBlocked:true,networkBlocked:true});
});
