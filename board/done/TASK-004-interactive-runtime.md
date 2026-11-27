---
id: TASK-004
title: Progressive interactive runtime
status: done
dependencies: [TASK-002]
priority: 4
---

# Progressive interactive runtime

## Scope
Feature-gated Mermaid, math and highlighting; Python Web Worker; explicit trust boundary for interactive HTML.

## Acceptance
- Optional runtimes load only when required.
- Python execution, stdout/stderr, cancellation and reset are handled in a worker.
- Standard Markdown scripts do not execute; interactive content policy is documented.

## Evidence so far
- Generated articles lazily request Mermaid, KaTeX and Highlight.js only when matching code/math appears.
- Python examples get a dedicated lazy Web Worker with stdout, stderr, result, worker reuse, cancellation and reset.
- Runtime syntax checks passed and trust policy is documented.
- Local browser verified four Mermaid diagrams and source disclosures in light/dark emulation, KaTeX, highlighting, Pyodide stdout/state persistence/reset/cancellation, and the interactive iframe sandbox.
- Blocked CDN tests confirmed Mermaid source fallback and the Pagefind search error state. The interactive HTML static text copy is searchable.
- Direct local browser interaction with the Bloom Filter calculator changed NDV and FPP, verified updated bit/storage/hash outputs, and triggered its 1 MB safety warning with an oversized NDV.
- Six Python unit tests and two Node artifact tests pass.

## Remaining verification
The calculator interaction is verified locally. Full interactive-article product review, accessibility review, and production-host behavior remain part of production hardening. A 390 px viewport check confirmed no document-level horizontal overflow on homepage, search, Markdown article and interactive HTML article. The source and iframe sandbox are present in generated output.
