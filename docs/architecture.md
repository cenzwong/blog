# Architecture

## Current V2 migration state

Python validates article metadata and emits ignored `.generated/` inputs. Vite bundles shared styles, then `scripts/generate.mjs` writes standalone pages and metadata/feed/crawler artifacts to `dist/`. Pagefind indexes article roots after generation; search JavaScript imports the Pagefind runtime only when a query is submitted or typed. The index has a tag filter and uses stale-request protection. Search result DOM is created with safe nodes and excerpts retain only text and `<mark>` highlighting.

Standard Markdown raw HTML is escaped before parsing. Ordinary HTML articles have scripts, event handlers and unsafe URL schemes removed. A source requiring scripts must declare `interactive: true`; it is rendered in a sandboxed iframe with `allow-scripts` and no same-origin permission. The current Python, Mermaid, KaTeX and highlighting loader is a small static runtime that requests optional CDN runtimes only when matching content appears. Python runs in a worker that is reused for that code block; its Python state persists across runs until reset/cancel terminates it. A worker is not a complete security boundary.

The catalogue contains metadata only. The old SPA runtime and corpus-fetching path have been removed. A stale tracked `public/search_index.json` source artifact may still be present in the checkout, but it is not read by the site or build and the static generator removes Vite's copied version from `dist`. All published static article pages are indexed (8 pages, 2,640 words at the current build); Pagefind reported one tag filter. The custom search UI loads its Pagefind module only after a nonempty query, debounces input and tag changes, and ignores stale responses. `npm run dev` builds and serves the generated static site, watches article files and serializes debounced rebuilds.

## Content trust

Repository content is public. In Markdown, raw HTML is escaped and unsafe link/image schemes are removed. Owner-authored and AI-generated HTML must be reviewed as code; only reviewed trusted content should declare `interactive: true`. Imported material stays non-executable until it has been reviewed and explicitly opted in. Interactive documents run in a sandboxed iframe without same-origin permission. Never put credentials in article content or runtime globals.

## Build contract

`npm run build`: `npm run ingest` → `vite build` → `node scripts/generate.mjs` → `pagefind --site dist ...` → `node scripts/validate-build.mjs`. `VITE_BASE` defaults to `/blog/`; `SITE_URL` defaults to the production GitHub Pages origin. The generated distribution contains static article pages, metadata, search assets, RSS, sitemap, robots and 404. Local browser checks cover route access, on-demand search, no-JavaScript article content, optional renderers, Python worker behavior and iframe sandbox policy. Lighthouse/accessibility measurements and live GitHub Pages verification remain separate evidence requirements.
