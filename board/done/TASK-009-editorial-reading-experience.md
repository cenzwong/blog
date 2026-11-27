---
id: TASK-009
title: Editorial reading experience
status: done
dependencies: [TASK-008]
priority: 9
---

# Editorial reading experience

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Implement responsive layouts, typography, navigation, table of contents and theme controls.

## Acceptance
- Representative content is readable without JavaScript and desktop/mobile layouts are verified.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Completion evidence (2026-11-27)
- Shared editorial layouts, theme controls, heading links and a mobile-collapsed table of contents are in the production build. Browser checks exercised desktop and mobile homepage, Markdown, HTML and interactive articles, with overflow and axe checks; screenshots were inspected locally.
- No-JavaScript browser checks verified article text, static diagrams and the mobile table-of-contents disclosure. Original routes and iframe sandbox passed compatibility checks. Manual screen-reader and broader device checks remain part of production hardening.
