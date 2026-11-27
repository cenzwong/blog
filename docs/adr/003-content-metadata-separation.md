# ADR-003: Separate content from metadata

## Context
The old search JSON embeds every article body.

## Decision
Distribute standalone pages and a body-free catalogue.

## Alternatives considered
Keep one corpus JSON is simpler but forces whole-corpus download.

## Trade-offs and consequences
Article navigation no longer needs all bodies; search uses the Pagefind index.
