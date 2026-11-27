---
id: TASK-005
title: CI, documentation and production evidence
status: in_progress
dependencies: [TASK-003, TASK-004]
priority: 5
---

# CI, documentation and production evidence

## Scope
CI build, validation and deployment, developer documentation, and browser, performance, accessibility, and security verification.

## Acceptance
- Pull requests validate; production branch deploys only validated `dist`.
- Architecture decisions and local workflows documented.
- Browser, accessibility, SEO and performance evidence is measured and scoped accurately.

## Evidence so far
- PR build/test validation and production artifact validation are configured; Pages permissions are scoped to the deploy job.
- The [documentation index](../../docs/README.md) covers the static build, authoring, mise tasks, and deployment.
- On 2026-11-27, `mise run test` passed for both `/blog/` and `/` with the pinned Node.js and Python runtimes. Each run validated the artifacts, indexed eight articles, and passed eight Python tests and five Node tests. The local preview and development tasks served the homepage and a direct article route.
- Local direct routes, legacy redirects, on-demand Pagefind, no-JavaScript article access, Mermaid/light-dark/error fallback, math/highlighting, Python worker and iframe sandbox were checked.
- The development server served generated static routes. A temporary draft edit triggered a debounced rebuild and was excluded from public output.
- Markdown renderer now blocks unsafe link/image schemes and escapes raw HTML, with focused tests.
- A 390 px browser check found and fixed crowded search controls. Home, search, long article, interactive article and About now have no document-width overflow; search controls, matching/no-result states and iframe width were inspected. This is not a full accessibility or cross-device review.
- One local run at 390 × 844 recorded LCP, CLS, and transfer sizes with 4× CPU slowdown and cache disabled. Search CLS fell from 0.61 to 0.0219 after moving results into an overlay. Mermaid feature transfer was about 1.36 MB. The [historical docs snapshot](https://github.com/cenzwong/blog/tree/327cc94/docs) preserves the full measurements.
- Direct browser interaction verified the Bloom Filter calculator's NDV/FPP outputs and its oversized-filter warning.
- GitHub Actions deployment run [#18](https://github.com/cenzwong/blog/actions/runs/45966101773) succeeded on 2026-11-27 for commit `4e8d6177cc7a05f77f6f5b8c1e864f21c61ca5fb`. Live browser checks confirmed the homepage and direct Bloom Filter article URL, with article content and calculator controls present.

## Remaining verification

- Verify the mise workflow on GitHub Actions.
- Verify production search, legacy links, RSS, sitemap, and canonical URLs.
- Capture repeatable Lighthouse and accessibility evidence.
- Check layouts and remaining interactive controls across representative devices.
