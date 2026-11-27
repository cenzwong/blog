# Cenz.Blog agent guide

## Architecture

Cenz.Blog is a vanilla JavaScript and Vite static site. Python validates Markdown/HTML frontmatter and emits build inputs. The build generates article-specific HTML, catalogue metadata, RSS, sitemap, tag pages and a 404 page, then Pagefind indexes the generated HTML. GitHub Pages serves only static files; there is no application server or remote search service.

- `content/`: published article source (`.md`, `.html`, `.htm`).
- `scripts/ingest.py`: metadata parsing, validation and draft filtering.
- `scripts/generate.mjs`: static route, metadata and feed generation.
- `scripts/validate-build.mjs`: validates generated routes, links and crawler artifacts.
- `public/runtime.js` and `public/python.worker.js`: optional browser features and Python execution.
- `src/index.css`: shared visual design.
- `docs/engineering-handoff-v2.md`: preserved V2 requirements; `docs/architecture.md` and `docs/adr/` describe implemented decisions.

## Development commands

Use Node.js 22.16.0 and Python 3.12.11 as pinned in optional `mise.toml`. Contributors can also install compatible runtimes directly. Install dependencies with `npm ci` and Python build requirements with `python3 -m pip install -r requirements.txt`.

```sh
npm run dev       # build and serve generated static routes; rebuild after content edits
npm run build     # ingest, Vite, static generation, Pagefind, artifact validation
npm test          # ingestion and generated-artifact tests
npm run preview   # serve the last generated dist/ directory
```

`npm run dev` watches article files and debounces rebuilds. The authored content directory contains public repository material; draft exclusion controls publication only and does not make source private.

## Content rules

Every published article needs a unique safe slug, title, description, valid ISO date and non-empty tags. YAML frontmatter and legacy HTML comment metadata are supported. Tags may be a YAML list or comma-separated string. Set `draft: true` to exclude an article from generated public artifacts. HTML that requires scripts must explicitly declare `interactive: true`; ordinary Markdown HTML is escaped. Review executable content as code and preserve its iframe sandbox boundary.

Run `npm run build` after changing source or runtime behavior. Do not commit secrets, dependencies, or generated caches. Keep the standard npm workflow usable without mise.
