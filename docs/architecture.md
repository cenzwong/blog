# Architecture

Cenz.Blog is a static Astro site hosted under the `/blog/` GitHub Pages project path. The build produces independently readable HTML; Pagefind and interactive features are progressively enhanced in the browser. No application server is required.

## Publishing pipeline

1. The Astro [content collection](../src/content.config.ts) uses a [recursive loader](../src/compiler/articles.ts) to read Markdown and HTML metadata, validate dates, slugs, tags and directory dates, and filter drafts at publication boundaries. Physical source locations do not determine canonical URLs.
2. The [Unified compiler](../src/compiler/index.mjs) parses Markdown with Remark and static HTML with Rehype, strips active content and sanitises authored markup before generating headings, KaTeX and Shiki output. Relative references are resolved from the article source and checked against the content root.
3. The [diagram build](../scripts/render-diagrams.mjs) uses Mermaid CLI and Chrome to generate light and dark SVGs. Source remains available in each article. Astro layouts and routes assemble articles, archives, topics, feeds, metadata and crawler files.
4. Pagefind indexes the final `dist/` HTML. The [artifact validator](../scripts/validate-build.mjs) checks routes, internal links, feeds and crawler artifacts.

The superseded generator and Python ingestion have been retired after the local compatibility checks passed. The previous published revision remains available in Git for rollback. The [migration handoff](astro-migration-handoff.md), [compatibility manifest](migration-compatibility.md) and [engineering board](../board/README.md) record outstanding migration work and verification.

## Browser features and trust

Search downloads Pagefind only when a reader searches. Results use safe text and highlight elements. Code controls are enhanced in the browser; only Markdown fences explicitly marked `python run` receive execution controls. Pyodide loads when Run is pressed and executes in a dedicated [worker](../public/python.worker.js); cancel and reset terminate the worker.

Static HTML and Markdown do not execute authored scripts. HTML marked `interactive: true` is separately generated as a document with a restrictive content security policy and embedded in an iframe with `sandbox="allow-scripts"`; the main article also contains a sanitised, searchable static copy. Local demo images, scripts and stylesheets are embedded after content-root checks; the CSP blocks network access. Interactive source is still reviewed as code. The iframe does not receive same-origin privileges.

Legacy `#/post/<slug>`, `#/search`, and `#/about` links are handled by client-side redirects. GitHub Pages project paths cannot supply a domain-root `robots.txt`; see [deployment](github-pages-deployment.md).
