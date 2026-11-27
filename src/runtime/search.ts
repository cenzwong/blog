type SearchRecord = {url: string; excerpt?: string; meta?: Record<string, string>; filters?: Record<string, string[]>; sub_results?: {url:string; title:string}[]};
type Pagefind = {search: (query: string, options?: unknown) => Promise<{results: {data: () => Promise<SearchRecord>}[]}>};
let pagefindPromise: Promise<Pagefind> | undefined;
function loadPagefind() {
  // Pagefind writes this module after Astro's build, so it cannot be bundled by Vite.
  const url = new URL(`${import.meta.env.BASE_URL}pagefind/pagefind.js`, window.location.origin).href;
  return pagefindPromise ??= (import(/* @vite-ignore */ url) as Promise<Pagefind>).catch(error => {pagefindPromise = undefined; throw error;});
}
function appendExcerpt(parent: HTMLElement, excerpt: string) {
  const parsed = new DOMParser().parseFromString(excerpt, 'text/html');
  function copy(node: Node): Node {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? '');
    const out = node instanceof Element && node.tagName === 'MARK' ? document.createElement('mark') : document.createDocumentFragment();
    for (const child of node.childNodes) out.appendChild(copy(child));
    return out;
  }
  for (const node of parsed.body.childNodes) parent.append(copy(node));
}
for (const root of document.querySelectorAll<HTMLElement>('[data-search]')) {
  const form = root.querySelector<HTMLFormElement>('[data-search-form]')!;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const tag = form.querySelector<HTMLSelectElement>('select');
  const status = root.querySelector<HTMLElement>('[data-search-status]')!;
  const list = root.querySelector<HTMLOListElement>('[data-search-results]')!;
  const quick = root.dataset.quick === 'true';
  root.hidden = false;
  let timer = 0, sequence = 0;
  const fromUrl = () => {if (quick) return; const state = new URLSearchParams(location.search); input.value = state.get('q') ?? ''; if (tag) {const requested = state.get('tag') ?? ''; tag.value = [...tag.options].find(option => option.value.toLowerCase() === requested.toLowerCase())?.value ?? '';}};
  const writeUrl = () => {if (quick) return; const url = new URL(location.href); const q = input.value.trim(); if (q) url.searchParams.set('q', q); else url.searchParams.delete('q'); if (tag?.value) url.searchParams.set('tag', tag.value); else url.searchParams.delete('tag'); if (url.href !== location.href) history.pushState(null, '', url);};
  async function search() {
    const id = ++sequence; const query = input.value.trim(); const filter = tag?.value;
    writeUrl();
    if (!query) {status.textContent = 'Enter a search term to explore the collection.'; list.replaceChildren(); return;}
    status.textContent = 'Searching…'; list.replaceChildren();
    try {
      const pf = await loadPagefind(); const data = await pf.search(query, filter ? {filters:{tag:[filter]}} : undefined);
      const records = await Promise.all(data.results.slice(0, quick ? 6 : 50).map(item => item.data()));
      if (id !== sequence) return;
      status.textContent = data.results.length === 1 ? '1 result' : `${data.results.length} results`;
      for (const item of records) {
        const li = document.createElement('li'), link = document.createElement('a'), detail = document.createElement('p');
        link.href = item.url; link.textContent = item.meta?.title || item.url;
        if (item.excerpt) appendExcerpt(detail, item.excerpt);
        li.append(link);
        if (item.meta?.date) {const date = document.createElement('time'); date.dateTime = item.meta.date; date.textContent = item.meta.date; date.className = 'search-date'; li.append(date);}
        if (item.meta?.description) {const description = document.createElement('p'); description.textContent = item.meta.description; li.append(description);}
        if (item.filters?.tag?.length) {const tags = document.createElement('p'); tags.className = 'search-date'; tags.textContent = item.filters.tag.join(' · '); li.append(tags);}
        li.append(detail);
        const section = item.sub_results?.find(result => result.url.includes('#') && result.title);
        if (section) {const link = document.createElement('a'); link.href = section.url; link.textContent = `Jump to ${section.title}`; link.className = 'search-section'; li.append(link);}
        list.append(li);
      }
      if (!data.results.length) status.textContent = 'No articles found. Try another term or topic.';
    } catch {if (id === sequence) status.textContent = 'Search is unavailable. Submit the search to retry.';}
  }
  const schedule = () => {sequence++; clearTimeout(timer); timer = window.setTimeout(search, 200);};
  form.addEventListener('submit', event => {event.preventDefault(); clearTimeout(timer); void search();});
  input.addEventListener('input', schedule); tag?.addEventListener('change', schedule);
  if (quick) root.addEventListener('keydown', event => {const links = [...list.querySelectorAll<HTMLAnchorElement>('a')]; if (event.key === 'ArrowDown' && links.length) {event.preventDefault(); const current = links.indexOf(document.activeElement as HTMLAnchorElement); links[(current + 1) % links.length].focus();} else if (event.key === 'ArrowUp' && links.length) {event.preventDefault(); const current = links.indexOf(document.activeElement as HTMLAnchorElement); links[current <= 0 ? links.length - 1 : current - 1].focus();}});
  else {window.addEventListener('popstate', () => {fromUrl(); void search();}); fromUrl(); void search();}
}
