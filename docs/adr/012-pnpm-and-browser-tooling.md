# ADR-012: Pin pnpm and browser build tooling

## Context
Astro, the compiler, static diagram renderer and automated browser checks need a reproducible JavaScript environment. The previous Python ingestion and npm lockfile are no longer required by the publishing pipeline.

## Decision
Pin Node.js and pnpm in `mise.toml` and pnpm in `packageManager`; commit `pnpm-lock.yaml` and use frozen installation in CI. Mise tasks delegate to normal pnpm scripts. Contributors can use the pinned tools without mise. Setup locates or installs Chrome for Mermaid and reuses a suitable local Chrome on macOS or installs Playwright Chromium for browser checks. CI explicitly installs Playwright Chromium and its system dependencies.

## Consequences
A browser is a build dependency for static Mermaid output and a separate browser is needed for Playwright. Browser downloads require network access on a fresh machine. Pyodide remains a reader-side, on-demand dependency and does not require Python to build the site. This supersedes the Python and npm-specific details of ADR-008 while retaining its task-delegation principle.
