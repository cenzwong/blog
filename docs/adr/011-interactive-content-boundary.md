# ADR-011: Isolate interactive content from article presentation

## Context
Some articles contain executable HTML or Python examples. Readers must retain access to static content, and example execution must not gain access to the parent site.

## Decision
Static authored HTML is parsed and sanitised before compilation. An article explicitly marked interactive receives a separate document in an iframe with `sandbox="allow-scripts"`, no same-origin privilege and a restrictive content security policy. The main page includes a searchable static copy. Reviewed local images, scripts and stylesheets are embedded after content-root checks; network access remains blocked. Python fences are display-only unless explicitly marked `run`; execution occurs on demand in a worker, with cancel and reset terminating that worker.

## Consequences
Interactive documents cannot rely on parent DOM, storage or arbitrary external connections. Pyodide is downloaded only when requested. Source still requires review, and isolation does not make untrusted code safe for arbitrary use. ADR-006 and ADR-007 describe the earlier implementation and remain historical context; the current pipeline is in [architecture](../architecture.md).
