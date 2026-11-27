---
id: TASK-001
title: Foundation and migration contract
status: done
dependencies: []
priority: 1
---

# Foundation and migration contract

## Scope
Pin compatible runtimes, document the static architecture, establish content and output validation, and preserve existing working-tree edits.

## Acceptance
- Baseline build and current deploy path recorded.
- Runtime pins remain optional to native npm/Python workflows.
- Legacy URL/content risks and verification boundaries documented.

## Evidence
- Baseline `npm run build` succeeded before edits (Vite 8.0.14; 8 articles).
- Runtime pins added in `mise.toml`; native npm scripts retained.
- The original plan and engineering handoff are available in the [historical docs snapshot](https://github.com/cenzwong/blog/tree/327cc94/docs). See [Architecture](../../docs/architecture.md) for current guidance.
