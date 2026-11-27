# ADR-006: Run Python in a Web Worker

## Context
Pyodide can block the main UI thread.

## Decision
Run lazy-loaded Pyodide in a dedicated worker.

## Alternatives considered
Main-thread execution is simpler but blocks interaction.

## Trade-offs and consequences
Worker termination provides cancellation but is not a full security sandbox.
