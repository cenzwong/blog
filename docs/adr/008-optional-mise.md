# ADR-008: Keep mise optional

## Context
Pinned tools help reproducibility but contributors already use native package managers.

## Decision
Pin Node/Python in mise.toml; keep npm/Python commands canonical.

## Alternatives considered
Require mise would add onboarding and tool dependence.

## Trade-offs and consequences
CI pins runtimes and local work remains possible without mise.
