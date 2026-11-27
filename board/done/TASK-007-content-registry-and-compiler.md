---
id: TASK-007
title: Content registry and compiler
status: done
dependencies: [TASK-006]
priority: 7
---

# Content registry and compiler

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Build the validated recursive collection and Unified Markdown, static HTML and sandboxed interactive adapters.

## Acceptance
- All content formats compile safely; metadata, sanitisation, headings and assets have focused tests.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Evidence so far
- Relative Markdown and HTML asset references resolve from the source location; tests cover missing assets, path traversal and symlink escape. Published article links resolve by source path to canonical slugs.
- Static HTML cannot enable the Python runner; HTML mathematical expressions are rendered by KaTeX after sanitisation, with a focused currency/code regression test. Full metadata, assets and security acceptance remain open.
- On 2026-11-27, an invalid unquoted date and an alias colliding with a published slug both failed content sync with actionable diagnostics. A temporary published alias produced a static refresh and canonical link, and was excluded from the sitemap.
- A temporary article with a relative asset and article link built successfully: the emitted asset matched its source bytes and the link used the target canonical slug. A separate draft fixture was absent from pages, metadata, RSS and sitemap; Pagefind indexed eight published pages. Fixtures were removed.
- Remaining work includes expanded automated loader and compiler fixtures, accessibility and security review, and final integration acceptance.
- Vitest covers the schema and recursive loader, including invalid dates, tag/slug/alias collisions and directory mismatches. Compiler regression tests cover full HTML document extraction, dangerous markup, math, currency, callouts, captions and relative assets.

## Completion evidence (2026-11-27)
- The isolated production fixture covers Markdown, complete HTML and interactive HTML, aliases, drafts, local demo assets, cover assets, canonical links and Pagefind exclusion. Compiler tests cover sanitisation, code and math, unambiguous duplicate introductions, duplicate IDs, heading warnings, footnotes, Unicode and traversal protection.
- `mise run test` passed 14 Vitest cases, 25 Node tests and 23 browser checks (one desktop-only skip for the mobile disclosure). The existing eight published routes and the script-only sandbox passed artifact validation. Wider release and deployment checks are tracked separately.
