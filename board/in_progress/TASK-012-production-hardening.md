---
id: TASK-012
title: Production hardening
status: in_progress
dependencies: [TASK-009, TASK-010, TASK-011]
priority: 12
---

# Production hardening

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Implement SEO, feeds, sitemap, CI, automated browser, accessibility, visual and performance validation.

## Acceptance
- Production artifacts and compatibility tests pass; browser, accessibility and performance evidence is recorded.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Evidence so far
- On 2026-11-27, `mise run test` passed 11 Vitest cases, the legacy and compiler checks, and 22 Playwright checks across desktop and mobile Chromium. The checks include axe scans of home, Markdown, static HTML, interactive article and search pages; dark article contrast; responsive overflow; search history; dialog focus; static no-JavaScript content; and the isolated calculator.
- Local Lighthouse lab measurements of representative standard and interactive articles are recorded in the [performance baseline](../../docs/performance-baseline.md). CI is configured to run browser tests and Lighthouse and upload evidence, but the modified workflow has not yet run on GitHub.
- Screenshot captures are produced by browser tests, but committed cross-platform visual regression baselines, broader manual accessibility review and deployed production evidence remain open.

- The current production suite passed 14 Vitest cases, 26 Node tests and 36 Playwright checks (two intentional viewport-specific skips). It exercises real Pyodide execution and cancellation, clipboard copy, legacy links, focus restoration, theme cycling, TOC navigation and light/dark layout/color contracts. Actual desktop and mobile screenshots are saved as CI artifacts; pixel-diff baselines across platforms remain unverified.
- The artifact validator now parses HTML and checks local paths and fragments, including encoded traversal. A local setup run passed with an installed browser. An earlier Playwright Chromium download stalled during extraction after completing its download and was cancelled; the updated macOS setup reuses an installed Chrome, while the Linux CI install remains unverified.
- The latest local Lighthouse results are in the performance baseline; they are lab measurements, not real-user INP or deployed performance. The modified GitHub Actions workflow and Pages deployment have not run for this migration. Manual screen-reader/device checks and deployed verification remain open.
- The published bit-manipulation article now opts in four self-contained Python expressions. The real published `bin(10)` example passed browser execution, cancellation and reset; the [Python example audit](../../docs/python-example-audit.md) records the review.
- Desktop/mobile browser coverage now includes keyboard-only navigation, reduced motion, no-JavaScript search fallback, legacy hash links, clipboard copy and light/dark visual layout contracts. The [acceptance map](../../docs/migration-acceptance.md) records the remaining release evidence.
- Current local checks include a no-JavaScript search fallback, four published Pyodide-compatible examples, and desktop/mobile checks that the interactive iframe cannot access its parent, storage, or network. The full suite passed 44 Playwright checks with two intentional viewport-specific skips, alongside 14 Vitest checks and compiler, integration and artifact tests. The visual suite checks actual article layout and color contracts and saves representative screenshots; it does not claim cross-platform pixel comparisons.
- Added and independently reran four macOS Chromium pixel-diff baselines for a real article (desktop/mobile, light/dark). Linux CI currently runs the portable layout assertions but does not compare these macOS images.
- Expanded macOS pixel comparisons to homepage, HTML article, table, mathematics, Mermaid diagram, search, quick-search dialog and archive at desktop and mobile sizes. All 20 visual checks passed on a separate run; Linux pixel comparisons remain open.
- Added an axe `target-size` check at the mobile viewport for six representative pages and the quick-search dialog; it passed locally. Automated results do not replace manual touch or screen-reader testing. The local Docker daemon was unavailable when checking the option of producing Linux baselines.
- Added desktop/mobile browser coverage for the preview server's unknown-route 404 status, noindex metadata, error message and return-to-home link. GitHub Pages behavior still requires deployed verification.
- The complete local suite was rerun after these additions: 14 Vitest tests, 27 Node tests and 63 Playwright checks passed, with three intentional viewport-specific skips. This includes the macOS screenshot comparisons and mobile target-size check.
- Rebuilt with `VITE_BASE=/` and verified the new 404 and mobile target-size checks against that root-mounted preview; then rebuilt the normal `/blog/` output. Both builds passed.
- Added keyboard-driven focus-indicator checks in light and dark themes at desktop and mobile viewport sizes; all four passed. They check focus visibility and outline styling, not a manual contrast assessment.
