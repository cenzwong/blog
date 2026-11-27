---
id: TASK-001
title: Foundation and migration contract
status: done
dependencies: []
priority: 1
---

# Foundation and migration contract

## Scope
Pin compatible runtimes, document the phased V2 architecture, establish content and output validation, and preserve existing working-tree edits.

## Acceptance
- Baseline build and current deploy path recorded.
- Runtime pins remain optional to native npm/Python workflows.
- Legacy URL/content risks and verification boundaries documented.

## Evidence
- Baseline `npm run build` succeeded before edits (Vite 8.0.14; 8 articles).
- Runtime pins added in `mise.toml`; native npm scripts retained.
- Migration risks and evidence limits recorded in `docs/v2-migration-plan.md`.
- Preserved user-provided V2 contract at `docs/engineering-handoff-v2.md`.
