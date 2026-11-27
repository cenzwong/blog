# Engineering Handoff — Cenz.Blog V2

> This document preserves the user-provided V2 engineering contract. The proposed directory layout is illustrative; validate assumptions against the live source before implementing.

## Objective and constraints

Upgrade `https://github.com/cenzwong/blog` and `https://cenzwong.github.io/blog/` into a scalable, performant, searchable, SEO-friendly interactive static knowledge platform. Keep GitHub Pages compatibility and require no dedicated application server, database server, external search service, authentication, CMS, framework migration, paid API, Kubernetes, or semantic search. Follow InfraZero: precompute at build time, distribute static assets, execute in the browser, use open formats, progressively enhance, minimize dependencies, and preserve content ownership.

Retain vanilla JavaScript ES modules, native CSS, Vite, Python ingestion, Markdown/HTML authoring, Marked, JSON metadata, GitHub Actions, and GitHub Pages. Target Pagefind for search, Mermaid diagrams, feature-gated KaTeX/highlighting, and Pyodide in a Web Worker. Do not add React, Vue, Next.js, Astro, or another frontend framework without an ADR demonstrating need. Use mise as optional toolchain management while preserving native npm/Python workflows.

## Target architecture

Content sources (Markdown, HTML, assets) flow through Python ingestion and metadata validation, static HTML/feed generation, Vite, and finally Pagefind indexing. Distribute article HTML, a lightweight metadata catalogue, chunked Pagefind index, assets, RSS, sitemap and robots. The browser reads article HTML directly and loads search or interactive runtimes only when requested. All production files must work on ordinary static hosts, including GitHub Pages project paths and future custom domains.

## Functional requirements

### Static site and content (FR-01, FR-02, FR-08)

- Generate standalone `/posts/<slug>/` documents, plus homepage, search, about, tag navigation and static 404. Article text must be available without JavaScript and refresh/direct navigation must work.
- Preserve existing slugs and formats. Redirect legacy `#/post/<slug>`, `#/search` and `#/about` links client-side without relying on server rewrites.
- Each article has title, description, date, author and tags. Metadata JSON contains only `schema_version` and the catalogue fields `slug`, `title`, `description`, `date`, `author`, `tags`, `url`; never complete bodies.
- Validate required metadata, dates, duplicate/unsafe slugs; support legacy HTML comments and comma-separated tags; filter drafts; provide source-specific errors and deterministic output. Use a reliable YAML parser where necessary.
- Keep standard Markdown scripts inert and sanitize rendered Markdown. Interactive authored HTML declares execution needs explicitly; isolate with a minimally permissioned sandboxed iframe where practical. Document trust for owner-authored, AI-generated and imported content. Public repository content is not private merely because it is omitted from the website.

### Search (FR-03, FR-04)

- Install Pagefind as a development dependency and run it only after final article HTML exists in `dist/`.
- Index title, subtitle, description, tags, headings, body, terminology and useful code. Preserve the custom UI; support relevance, snippets/highlighting, tag filtering, counts and loading/empty/error states.
- Load runtime/index only when search is activated. Debounce input and prevent stale asynchronous results from replacing newer results. Use a base-aware import and avoid hardcoding the GitHub Pages origin throughout application code.

### Progressive runtime and execution (FR-05, FR-06, FR-07)

- Mermaid: detect fenced blocks, render responsive SVG with light/dark themes and strict security; preserve source and readable failure fallback. Prefer deterministic build rendering or load runtime only on pages with diagrams.
- Load math and highlighting only where needed, or render them at build time. Optional features must not block primary article access.
- Python: load Pyodide only on explicit run, execute in a reusable dedicated worker, capture stdout/stderr/errors, handle concurrency/reset/cancellation by terminating worker, and keep UI responsive. Document that a worker is not a complete security sandbox.

### SEO, discovery and deployment (FR-09, FR-10, CI/CD)

- Generate sitemap.xml, robots.txt and rss.xml. Articles need canonical URLs, unique title/description, Open Graph/social metadata, semantic markup, structured article data, and publish/modified dates where present.
- Related content begins with deterministic tag overlap. Navigation is accessible and tag browsing is static.
- CI validates and tests pull requests, deploys only the production branch, indexes only after HTML build, validates final artifacts, checks links where practical, uploads only `dist`, prevents overlapping deployment, and uses lockfiles and least-privilege permissions.

## Content, security and performance

Recommended frontmatter includes title, subtitle, description, slug, ISO date, author, tags, draft. Keep Markdown and HTML source compatibility. Escape metadata and search input, use safe DOM APIs, avoid untrusted `innerHTML`, avoid executing arbitrary scripts, bundle/pin dependencies where practical, and protect secrets. Performance targets (not measured results): Lighthouse Performance/SEO/Accessibility ≥95, LCP ≤2.5s on defined mobile conditions, CLS ≤0.1, no corpus download on article entry, on-demand search and Python, zero dedicated backend services. Record environment/network/methodology before making performance claims. Test plain, long, math, Mermaid, Python, interactive HTML and search representative pages.

## Testing and delivery expectations

Unit coverage: frontmatter/metadata, slugs/URLs/drafts, escaping, feature detection and result rendering. Integration: ingestion, static generation, Vite multi-page output, Pagefind, feeds, Pages base path and internal links. Browser: direct/legacy routes, no-JS articles, search/tags, Mermaid/math/Python worker/cancellation, iframe policy, responsive layout, themes and errors. Keep build, unit, browser, accessibility, performance, signing and live deployment evidence distinct.

Update README, architecture docs, CI, and report migration/deployment evidence. Use standard commands with or without mise; debounce content rebuilds. Proposed structure is guidance, not a mandate; avoid empty abstractions.

## Required ADRs

ADR-001 retain vanilla JS/Vite; ADR-002 static generation; ADR-003 separate content and search storage; ADR-004 Pagefind; ADR-005 progressive feature loading; ADR-006 Python Web Worker; ADR-007 trusted interactive content boundary; ADR-008 optional mise. Each records context, decision, alternatives, trade-offs and consequences.

## Roadmap

1. Foundation/reliability: inspect baseline, toolchain, unsafe rendering, SQLite terminology, artifact handling and ingestion tests.
2. Static generation: templates, article/home/search/about pages, separated metadata, legacy links and base paths.
3. Pagefind: index, filters/ranking, adapted UI, lazy loading and benchmark.
4. Interactive runtime: Mermaid, math/highlighting, feature loader, Pyodide worker and HTML trust policy.
5. Publishing/discovery: feeds, sitemap, structured metadata, tags and related content.
6. Hardening: browser, Lighthouse, accessibility, dependency/security, legacy compatibility, docs and production verification.

## Acceptance checklist

- [ ] Published articles and formatting preserved; every article is standalone static HTML.
- [ ] Legacy links work; primary article content works without JavaScript; article entry avoids whole-corpus download.
- [ ] Backend-free, build-time Pagefind works and loads on demand.
- [ ] Mermaid, math and Python examples work; interactive HTML has explicit policy.
- [ ] RSS/sitemap/canonical/social metadata are correct; GitHub Pages deployment works.
- [ ] Local workflow works with and without mise; automated tests pass.
- [ ] Representative performance evidence is measured and documented.
- [ ] README, architecture, ADRs, CI and migration/deployment reports are complete.
- [ ] No dedicated runtime infrastructure is introduced.

## Definition of done

Cenz.Blog V2 separates content authoring, build-time processing, static distribution, client-side search and on-demand computation in an understandable, maintainable platform. “Less Infrastructure. More Capabilities.”
