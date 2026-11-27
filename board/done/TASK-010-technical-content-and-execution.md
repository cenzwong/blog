---
id: TASK-010
title: Technical content and execution
status: done
dependencies: [TASK-007]
priority: 10
---

# Technical content and execution

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Render code, mathematics and diagrams at build time; support explicit Python execution and isolated interactive HTML.

## Acceptance
- Rich content and fallbacks work; opt-in execution, cancellation and iframe isolation are verified.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Evidence so far
- Mermaid CLI 12.2.0 rendered the four existing diagrams into eight static light/dark SVGs during the Astro production build; source is retained. The local production preview loaded the visible diagram variants with JavaScript disabled.
- Build-time KaTeX and Shiki and explicit Python worker controls are implemented; local browser checks ran a temporary example and cancelled a long-running one. Full browser, accessibility, performance and CI verification remains open.

## Completion evidence (2026-11-27)
- Production builds render Shiki, KaTeX and four Mermaid diagrams with readable source; automated no-JavaScript checks load the static images. A local browser ran an explicitly opted-in Python fixture and cancelled a long-running example; ordinary examples do not receive execution controls.
- The existing interactive calculator responded in the script-only sandbox on desktop and mobile. Isolated integration tests cover local demo assets and the searchable static fallback. Broader release, deployment and device evidence remains open in production hardening.
- Subsequent automated desktop coverage ran the real Pyodide worker, cancelled a long-running example, verified reset and checked clipboard copying. Local interactive assets are embedded into the sandbox after path validation; external requests remain blocked.
