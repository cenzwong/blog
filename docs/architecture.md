# Architecture

Cenz.Blog uses vanilla JavaScript, native CSS, Vite, and a static build. GitHub Pages serves the generated files, and Pagefind search runs in the browser.

## Build pipeline

1. [Python ingestion](../scripts/ingest.py) validates Markdown and HTML metadata, excludes drafts, and writes temporary article and catalogue inputs to `.generated/`.
2. Vite bundles the shared stylesheet and copies the browser runtime from `public/` to `dist/`.
3. The [site generator](../scripts/generate.mjs) writes the homepage, standalone articles, tag pages, search, about, and 404 pages. It also writes the metadata-only catalogue, RSS, sitemap, and robots files.
4. Pagefind indexes article content in the generated HTML. The [artifact validator](../scripts/validate-build.mjs) checks output routes, internal links, and crawler artifacts.

Article text is available without JavaScript. Client-side redirects preserve the older `#/post/<slug>`, `#/search`, and `#/about` links.

## Search and article features

The search page loads Pagefind on the first nonempty query. It supports tag filtering, debounces typed queries, and checks request order before rendering results. Result excerpts are rendered as text with optional highlight marks.

The [browser runtime](../public/runtime.js) loads Mermaid, KaTeX, and syntax highlighting when matching content is present. Pyodide loads when a reader explicitly runs a Python example. Each runnable example can reuse a dedicated [worker](../public/python.worker.js) to retain Python state between runs. Reset or cancellation terminates the worker and clears its state. Workers keep execution off the main UI thread, and executable examples require trusted source.

## Content trust

The [Markdown renderer](../scripts/markdown.mjs) escapes raw HTML and filters link and image URL schemes. The HTML path strips script blocks, inline handlers, and certain embed and JavaScript URL patterns. Treat all authored and imported HTML as trusted repository code and review it before publication. HTML declared interactive executes in an iframe whose sandbox grants scripts only. Its article page also contains a static text version for reading and search.

See the [authoring guide](authoring.md) and [architecture decisions](adr/README.md).
