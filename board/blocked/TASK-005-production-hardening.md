---
id: TASK-005
title: CI, documentation and production evidence
status: blocked
dependencies: [TASK-003, TASK-004]
priority: 5
---

# CI, documentation and production evidence

## Scope
CI validation/test/build/deploy, ADRs, developer docs, artifact checks, link/browser/performance/security evidence and migration report.

## Acceptance
- Pull requests validate; production branch deploys only validated `dist`.
- Architecture decisions and local workflows documented.
- Browser, accessibility, SEO and performance evidence is measured and scoped accurately.

## Evidence so far
- PR build/test validation and production artifact validation are configured; Pages permissions are scoped to the deploy job.
- README, architecture, eight ADRs, handoff, migration plan and performance report are present. Agent and article-authoring guides now describe the V2 static build.
- Build and tests pass: 8 Python tests and 5 Node tests; Pagefind indexed eight articles and the artifact validator checked internal links.
- Base-path artifact checks now assert every metadata URL matches the configured mount path. On 2026-11-27, both the `/blog/` GitHub Pages build and a `/` custom-domain build passed build validation and their test suites.
- Local direct routes, legacy redirects, on-demand Pagefind, no-JavaScript article access, Mermaid/light-dark/error fallback, math/highlighting, Python worker and iframe sandbox were checked.
- `npm run dev` now serves generated static routes. A temporary draft edit triggered a debounced rebuild and was excluded from public output. Node 22.16.0 build passed; Python 3.12.11 is pinned but unavailable locally.
- Markdown renderer now blocks unsafe link/image schemes and escapes raw HTML, with focused tests.
- A 390 px browser check found and fixed crowded search controls. Home, search, long article, interactive article and About now have no document-width overflow; search controls, matching/no-result states and iframe width were inspected. This is not a full accessibility or cross-device review.
- One local mobile browser run recorded LCP/CLS and transfer sizes under the documented throttle. Search CLS fell from 0.61 to 0.0219 after moving results into an overlay; Mermaid feature transfer was about 1.36 MB. No Lighthouse score is claimed.
- Direct browser interaction verified the Bloom Filter calculator's NDV/FPP outputs and its oversized-filter warning.
- Read-only production check on 2026-11-27 confirms V1 is still live: the homepage shows the hash-routed shell and client-side JSON search; a V2 static article URL returns GitHub Pages 404.

## Blocker
The V2 deployment, Lighthouse/accessibility audit, full cross-device visual/control review, and Python 3.12.11 local run remain outstanding. User approval is pending for publishing V2 to GitHub Pages and restoring tracked `node_modules`/`dist` files; the earlier broad recursive cleanup was rejected by automatic review because those paths are tracked and could contain user data. A fresh local preview could not start in this sandbox (`listen EPERM`), so no new accessibility scan was captured this turn.

## Unblock action
After authorization, publish the V2 build and verify the production Pages URL. Capture Lighthouse/accessibility evidence, complete mobile visual/control review and exercise the HTML calculator controls. Get explicit approval before restoring tracked dependency files or `dist` outputs.
