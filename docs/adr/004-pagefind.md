# ADR-004: Use Pagefind

## Context
Static hosting has no search backend, while linear whole-corpus scans scale poorly.

## Decision
Index final static HTML with Pagefind at build time.

## Alternatives considered
Hosted search APIs add services; a custom engine adds maintenance.

## Trade-offs and consequences
Search remains static and can load on demand. Pagefind runs after static page generation. Local preview checks confirmed that the index is not requested before a query, matching and no-result states render, tag filtering returns matching results, and an unavailable-index message is shown when Pagefind is blocked. Production Pages behavior remains to be checked after deployment.
