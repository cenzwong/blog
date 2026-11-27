# ADR-005: Load features progressively

## Context
Global optional scripts increase page cost and couple unrelated features.

## Decision
Load optional runtimes only on pages/actions that need them.

## Alternatives considered
Bundle every feature globally or render at build time.

## Trade-offs and consequences
Primary article content stays available; feature boundaries require detection and failure UI.
