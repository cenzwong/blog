---
id: TASK-002
title: Static article generation
status: done
dependencies: [TASK-001]
priority: 2
---

# Static article generation

## Scope
Validated lightweight metadata, standalone article/home/search/about pages, canonical and social metadata, 404, feeds, sitemap, and legacy hash redirects.

## Acceptance
- Published articles render as standalone HTML without JavaScript.
- No article bodies in metadata catalog.
- Existing slug URLs remain available and legacy hash links redirect.
- Static output is compatible with `/blog/` and future custom domains.

## Evidence
- `npm run build` generated 8 static article documents plus home/about/search/tag/404 pages, metadata, RSS, sitemap and robots.
- `npm test`: 2 passing artifact checks.
- `npm run validate:build`: catalogue contains no bodies; article title and canonical checks pass.
- Static output currently uses an article-script sandbox opt-in for the one interactive HTML source. Browser, accessibility and live Pages checks remain outstanding.
