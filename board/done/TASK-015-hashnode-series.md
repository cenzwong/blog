---
id: TASK-015
title: Restore Hashnode series
status: done
dependencies: []
priority: 15
---

# Restore Hashnode series

## Objective
Group the imported articles into their five Hashnode series and make each series browsable locally.

## Evidence and remaining checks (2026-11-27)
- Compared membership and ordering with the five live Hashnode series using ego.lite. Added ordered series metadata to 19 articles, series index and detail pages, article links, and sitemap entries.
- `mise run check` passed with no diagnostics. `mise run test` passed: production build, unit and Node tests, and Playwright (67 passed, 3 skipped). Updated six mobile visual baselines for the Series navigation.
- Started `mise run dev` at `http://localhost:4321/blog/`. ego.lite verified the series index and NLP series page. The user reviewed the local site and requested merging to main.
