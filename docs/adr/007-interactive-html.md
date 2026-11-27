# ADR-007: Define a trusted HTML boundary

## Context
HTML articles may contain executable scripts; standard Markdown must not execute them.

## Decision
Require an explicit interactive declaration and isolate scripts in a sandboxed iframe.

## Alternatives considered
Execute all HTML inline or disable all authored scripts.

## Trade-offs and consequences
Preserves declared interactive content while reducing ambient access; imported HTML needs review.
