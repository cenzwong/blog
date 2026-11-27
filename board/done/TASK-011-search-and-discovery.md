---
id: TASK-011
title: Search and discovery
status: done
dependencies: [TASK-008, TASK-009]
priority: 11
---

# Search and discovery

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Integrate Pagefind, accessible quick search, shareable filtered search and metadata-driven related content.

## Acceptance
- Production index and search interactions work under the project base path.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Completion evidence (2026-11-27)
- Pagefind indexed eight published articles in the production build. Desktop and mobile Playwright checks passed for search, topic filters, shareable URL state, browser Back, quick-search results, Escape and focus restoration under `/blog/`.
- Related content uses deterministic metadata scoring; archives, topics and feed membership are checked against the published catalogue. Live deployed search remains part of production hardening.
