---
id: TASK-006
title: Foundation and compatibility
status: done
dependencies: []
priority: 6
---

# Foundation and compatibility

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Inventory routes and prove Astro, pnpm and base-path compatibility with representative articles.

## Acceptance
- Astro produces representative original routes; compatibility manifest and tests capture all published slugs.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Evidence and next steps
- The handoff is saved byte-for-byte and the compatibility manifest inventories all eight published sources and original routes.
- On 2026-11-27, the existing `mise run test` passed using temporary writable Mise cache and state directories: eight Python and five Node tests, eight indexed articles and artifact validation.
- Registry access was verified with elevated network access. An initial Astro 5.18.2 dependency trial ran its CLI, but pnpm rejected ignored dependency build scripts and resolved a dependency requiring Node 22.19 while the project pins 22.16. The experimental manifest and lockfile were removed; select and pin compatible tooling and a reproducible install policy before adopting them. The existing generator remains in place.
- Still required: representative Astro-generated article routes, complete compatibility checks, and production proof.

- A parallel Astro 5.18.2 proof uses a custom content-collection loader, validated metadata and an initial Unified compiler; the production generator remains authoritative. Astro generated all eight paths into `.generated/astro-proof/` on 2026-11-27, and `astro check` reported zero diagnostics. Focused tests verify canonical URLs, normalisation, math and unsafe markup handling.
- Node 26.13.1 and pnpm 10.15.0 are pinned. pnpm installation completes with esbuild and sharp install scripts skipped; the Astro proof built successfully on this macOS machine. A clean `pnpm install --frozen-lockfile` succeeded locally on 2026-11-27; CI and other platforms still need verification.
- The proof is not a production replacement: the sandboxed interactive document, full compiler, presentation, search, runtime and compatibility gates remain outstanding.

- `mise run test` passed after the clean install: eight Python tests, nine Node tests, the existing production build and the eight-route Astro proof. `astro check` passed separately. This does not verify the unfinished proof as a complete site.
- The proof compiler now performs build-time Shiki highlighting and marks only `python run` fences as executable; the focused test and the regenerated eight-route proof passed. The browser runner and rendered production controls are not yet implemented.
- The parallel proof now generates editorial home, article, archive, topic, search, about, RSS and 404 pages, and Pagefind indexed eight articles. The interactive article has a separate `sandbox="allow-scripts"` document with a restrictive CSP and an independently readable sanitised body.
- On 2026-11-27, a local Chromium check inspected the homepage screenshot, verified a shareable `?q=pyspark` search returned five results and quick search returned Python matches, and changed the isolated calculator NDV from 50,000 to 100,000; its displayed bit count changed from 479,253 to 958,506. This is focused local evidence, not full accessibility, mobile, visual regression or production acceptance.
- `mise run test` passed after these changes (eight Python and eleven Node tests, existing distribution and Astro proof); `astro check` passed. Existing production generation is still authoritative pending remaining migration gates.
- A real article rendered a Mermaid diagram through the locally bundled, on-demand runtime. A temporary opt-in Python block produced `4` in the worker and a long-running variant was cancelled in a local browser; an ordinary Python block had no Run control. The fixture was removed and the proof rebuilt without it. Build-time Mermaid feasibility, automated browser coverage and full runtime acceptance remain open.
- The dated source move retained all eight byte hashes against `HEAD`; the existing development watcher rebuilt a nested draft while excluding it from publication.
- The latest `mise run test` passed with nine Python and fifteen Node tests, both build pipelines, eight published articles and the Pagefind proof. Local `astro check` passed before the final compiler-only refinements.

## Completion evidence (2026-11-27)
- Astro is now the production build, and the artifact validator passes for both `/blog/` and `/` configurations. The eight original canonical article routes, RSS identities and script-only iframe are verified by automated compatibility checks.
- `mise run test` passed under both base paths, `mise run check` passed with no diagnostics, and the Astro development server served an article and diagram while watching a nested draft change.
- The previous generator remains available as a temporary rollback path; its removal and full production, accessibility and deployment acceptance are tracked in dependent work.
