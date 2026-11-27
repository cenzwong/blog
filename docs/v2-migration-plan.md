# Cenz.Blog V2 migration plan

## Baseline
At the start of this migration, Vite exposed a hash-routed SPA. Ingestion serialized full article bodies into `public/search_index.json`, and `src/main.js` fetched that corpus before rendering routes. The baseline build succeeded with eight articles. The prior Pages workflow deployed from `main`/`master` without PR validation and hardcoded `/blog/`. The current build generates static pages and Pagefind after HTML generation; the current workflow validates PRs and deploys only from `main`.

## Approach
Retain vanilla JavaScript, native CSS, Vite and Python. Move through independently verifiable phases: (1) validated metadata and runtime pins, (2) static document generation and metadata/feed artifacts, (3) Pagefind over final HTML and on-demand UI, (4) optional interactive runtimes and execution boundaries, (5) CI/docs/production verification. This is lower risk than a framework rewrite and maps directly to the existing authoring formats.

## Migration risks

- Existing slugs are editorial identifiers; preserve them and detect collisions before output.
- Existing hash URLs are redirected by a small inline handler in generated static pages; this requires no host rewrite rule.
- HTML articles contain authored scripts. Treat them as trusted code only after explicit metadata opt-in; preserve behavior through isolated documents where feasible.
- Existing Mermaid/KaTeX/highlight/Pyodide are globally loaded from CDNs. Moving them to local feature chunks may change loading and rendering behavior.
- `/blog/` is the production project path; generated links and Pagefind loading must use Vite's base and work under preview/custom domain configurations.
- The workspace contains an added article source file. It is preserved as authored input; the old corpus index is not consumed by the new build and its copied version is stripped from `dist`.

## Acceptance evidence boundary
A successful `npm run build` proves bundling only. Static HTML checks prove no-JavaScript content availability; browser checks prove routing and interactions; Pages deployment verification proves hosted base-path behavior. Lighthouse scores and performance claims require measured representative pages with recorded conditions. None of those higher-level claims are inferred from a build.
