---
id: TASK-008
title: Content relocation and routes
status: done
dependencies: [TASK-007]
priority: 8
---

# Content relocation and routes

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Move source articles by publication month; implement archive and topic routes without changing canonical slugs.

## Acceptance
- Manifest matches every published route and content remains byte-identical; drafts and path collisions are checked.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Evidence so far
- All eight sources were moved to their publication month on 2026-11-27. SHA-256 values in the compatibility manifest were verified against both the original `HEAD` files and the relocated bytes; Astro and the existing generator both still build the eight canonical routes.
- Existing ingestion and development watching now recurse. A temporary nested draft triggered a development rebuild and remained excluded; the fixture was removed.
- The Astro compiler resolves relative article links and referenced assets against source location and rejects missing assets, traversal and escaping symlinks, with focused tests. Broader integration, aliases and final production acceptance remain open.

## Completion evidence (2026-11-27)
- At relocation, published source paths and byte hashes matched the compatibility manifest and pre-migration Git revision; four subsequent runnable-fence annotations are documented in the Python example audit. Production route and feed checks cover all eight original slugs; the isolated build verifies draft exclusion, alias collision handling, Unicode topics and relative asset resolution.
- `mise run test` and production artifact validation passed. The script-only iframe is checked by automated tests and local browser interaction.
