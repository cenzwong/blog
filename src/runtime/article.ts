const article = document.querySelector<HTMLElement>('[data-pagefind-body]');
if (article) {
  for (const pre of article.querySelectorAll<HTMLElement>('.prose pre')) {
    const code = pre.querySelector<HTMLElement>('code');
    if (!code || code.classList.contains('language-mermaid')) continue;
    const controls = document.createElement('div'); controls.className = 'code-controls'; controls.setAttribute('data-pagefind-ignore', '');
    const label = document.createElement('span'); label.textContent = pre.dataset.title || (pre.dataset.language === 'text' ? 'Code' : pre.dataset.language || 'Code');
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'Copy code';
    const status = document.createElement('span'); status.className = 'sr-only'; status.setAttribute('role', 'status');
    copy.addEventListener('click', async () => {try {await navigator.clipboard.writeText(code.textContent ?? ''); status.textContent = 'Code copied.';} catch {status.textContent = 'Copy failed. Select and copy the code manually.';}});
    controls.append(label, copy, status); pre.before(controls);
    if (pre.dataset.runnable !== 'python') continue;
    const run = document.createElement('button'), cancel = document.createElement('button'), reset = document.createElement('button');
    const output = document.createElement('pre'); output.className = 'python-output'; output.setAttribute('aria-live', 'polite'); output.setAttribute('data-pagefind-ignore', '');
    run.type = cancel.type = reset.type = 'button'; run.textContent = 'Run Python'; cancel.textContent = 'Cancel'; reset.textContent = 'Reset'; cancel.hidden = true;
    controls.append(run, cancel, reset); pre.after(output);
    let worker: Worker | null = null, request = 0, running = false;
    const stop = (message: string) => {worker?.terminate(); worker = null; request++; running = false; run.disabled = false; cancel.hidden = true; output.textContent = message;};
    run.addEventListener('click', () => {
      if (running) return;
      const initial = !worker;
      if (!worker) {
        worker = new Worker(`${import.meta.env.BASE_URL}python.worker.js`);
        worker.onmessage = event => { if (event.data.id !== request) return; const {stdout, stderr, result, error} = event.data; output.textContent = [stdout, stderr && `stderr:\n${stderr}`, result && `Result:\n${result}`, error && `Error:\n${error}`].filter(Boolean).join('\n') || '[Completed with no output]'; running = false; run.disabled = false; cancel.hidden = true; };
        worker.onerror = event => stop(event.message || 'Python worker failed.');
      }
      running = true; run.disabled = true; cancel.hidden = false; output.textContent = initial ? 'Loading Python…' : 'Running Python…';
      worker.postMessage({id: ++request, code: code.textContent});
    });
    cancel.addEventListener('click', () => stop('Execution cancelled.'));
    reset.addEventListener('click', () => stop('Python worker reset.'));
  }

  const toc = document.querySelector<HTMLElement>('.toc');
  if (toc && 'IntersectionObserver' in window) {
    const headings = [...article.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]')];
    const observer = new IntersectionObserver(entries => {for (const entry of entries) if (entry.isIntersecting) {toc.querySelectorAll('a[aria-current]').forEach(link => link.removeAttribute('aria-current')); const links = [...toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')].filter(item => decodeURIComponent(item.hash.slice(1)) === entry.target.id); links.forEach(link => link.setAttribute('aria-current', 'location'));}}, {rootMargin:'-10% 0px -75% 0px'});
    headings.forEach(heading => observer.observe(heading));
  }
}
