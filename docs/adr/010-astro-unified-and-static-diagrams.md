# ADR-010: Use Astro and Unified for static publishing

## Context
The custom Python, Vite and JavaScript publishing pipeline duplicated framework responsibilities, and its HTML sanitisation was regex-based. Articles need portable source, stable slugs and a static deployment.

## Decision
Use Astro content collections and Zod as the article registry, Unified/Remark/Rehype for compilation, and Astro routes and layouts for publishing. Pagefind continues to index the finished output. Authored HTML is parsed and sanitised before trusted transformations; interactive HTML is a separate document in a script-only sandbox with a restrictive CSP.

Mermaid CLI renders light and dark SVGs at build time. The source is retained in a disclosure below each diagram. The CLI requires Chrome or Chromium at build time; setup finds an installed browser or installs Puppeteer's pinned browser. The generated SVGs are used as images, so readers do not need a Mermaid runtime or JavaScript. This adds a browser dependency and build time, but preserves static diagrams and avoids downloading the diagram engine in readers' browsers.

## Migration and consequences
The production build now uses Astro. The previous generator was removed after local route, content and browser compatibility checks; its published revision remains in Git for rollback. ADR-001's framework choice is superseded; ADR-002's static-output and ADR-004's Pagefind principles remain applicable. See the [migration board](../../board/README.md) for outstanding verification and the [development guide](../local-development.md) for browser setup.
