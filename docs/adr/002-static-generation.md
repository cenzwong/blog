# ADR-002: Generate static pages

## Context
The SPA requires JavaScript and the complete corpus to read articles.

## Decision
Generate each article and main page as static HTML.

## Alternatives considered
Server-side rendering requires a server; a framework SSG is outside the selected stack.

## Trade-offs and consequences
Crawlers and readers receive article content directly; builds become responsible for validation and output.
