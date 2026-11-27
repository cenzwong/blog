---
id: TASK-013
title: Documentation and release
status: backlog
dependencies: [TASK-012]
priority: 13
---

# Documentation and release

## Objective and context
Implement this stage of the [Astro migration handoff](../../docs/astro-migration-handoff.md), preserving published URLs and progressive enhancement.

## Scope and implementation requirements
Update guides, architecture decisions, developer workflow and rollback notes; retire replaced tooling after verification.

## Acceptance
- Documentation describes the final system and all outstanding evidence is explicit.
- Preserve the script-only sandbox and existing published routes.

## Testing and evidence
Run focused tests and the applicable production build; record exact results and outstanding checks here before moving this task.

## Relevant files and decisions
See the [compatibility manifest](../../docs/migration-compatibility.md), [architecture](../../docs/architecture.md), and handoff for detailed decisions and requirements.

## Risks
Compatibility, security, base-path handling and unverified browser behaviour must remain visible.

## Evidence so far
- Architecture, authoring, local-development, deployment and ADR documentation describe the Astro pipeline. Release notes and a rollback path are recorded; the legacy generator and Python build dependency were removed after local compatibility tests. GitHub workflow and live release evidence remain open under TASK-012.
- The acceptance map, release notes, package-management ADR and Python example audit now describe the remaining evidence and intentional post-relocation fence annotations. Maintained documentation links are checked automatically.
