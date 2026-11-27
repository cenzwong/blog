# ADR-009: Separate source placement from publication identity

## Context
Articles need a manageable recursive source tree without breaking public links or RSS identities. The original sources lived directly in `content/`, while their public URLs used explicit slugs.

## Decision
Place sources under `content/YYYY/MM/`, using the metadata publication date, and retain the explicit slug as the unique public identifier at `/posts/<slug>/`. The content loader checks directory date mismatches and duplicate slugs. A compatibility manifest records the original and new paths, URLs and source byte hashes. Relative references are resolved against the source article and are constrained to the content root.

## Consequences
Authors can reorganise files without changing public article identities, provided the slug remains stable. Repository source-file links can change when files move. The original generator remains in service during migration and now recursively discovers content; the Astro implementation must pass the remaining compatibility gates before cutover.
