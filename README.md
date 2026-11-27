# Cenz.Blog

Cenz.Blog is a static technical blog hosted on GitHub Pages. The V2 migration generates standalone article pages and a lightweight metadata catalogue at build time, with no dedicated backend.

## Repository map

- `content/`: Markdown and HTML articles.
- `scripts/ingest.py`: metadata validation and temporary build inputs in `.generated/`.
- `scripts/generate.mjs`: static pages, feeds, metadata, and crawler artifacts.
- `src/`: shared site styles bundled by Vite.
- `package.json`: canonical JavaScript dependency manifest.
- `mise.toml`: optional pinned development runtimes.
- `.github/workflows/deploy.yml`: pull request validation and GitHub Pages deployment.

## Development

```sh
npm ci
python3 -m pip install -r requirements.txt
npm run dev
```

Production build and preview:

```sh
npm run build
npm run preview
```

`VITE_BASE` controls the deployed path prefix (default `/blog/`). `SITE_URL` controls canonical URLs and feed links. Mise is optional; contributors can use standard Node.js and Python installations.

## V2 status and evidence

The current build validates metadata and generates standalone article pages, homepage, about/search pages, a body-free metadata catalogue, RSS, sitemap, robots and 404 artifacts. Pagefind and feature-gated article runtimes are part of the current static build. Local browser checks cover direct/legacy routes, no-JavaScript article content, on-demand search, math, syntax highlighting, diagrams and Python worker behavior. These checks do not prove accessibility scores, Lighthouse performance or live deployment.

See [the preserved engineering handoff](docs/engineering-handoff-v2.md), [migration plan and risks](docs/v2-migration-plan.md), and [architecture notes](docs/architecture.md), and [performance/migration evidence](docs/performance-migration-report.md).
