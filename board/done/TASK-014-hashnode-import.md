---
id: TASK-014
title: Import the Hashnode archive
status: done
dependencies: []
priority: 14
---

# Import the Hashnode archive

## Objective
Bring the published Hashnode articles into the local blog using their original publication dates.

## Evidence and remaining checks (2026-11-27)
- Imported the 25 posts listed in the Hashnode archive from the GitHub backup. Compared all 25 with the live Markdown exports and verified their dates against the live pages' `datePublished` structured metadata; restored a sentence added to the live PySpark article after the backup.
- Imported the container article from its live Markdown export because it is absent from the backup. Its structured `datePublished` is 2026-09-19T17:47:09.482Z.
- The existing Rolling Toolbox article corresponds to the other recent Hashnode post. Its structured `datePublished` is 2026-11-25T16:41:16.969Z, and its existing article content matches the live Markdown apart from presentation adaptations.
- Draft-only backup files were excluded. Hashnode-hosted images remain external. The deployed article and image references were checked after publication.
- Converted 42 Hashnode-specific image alignment attributes to standard Markdown. In the generated site, all 27 migrated articles have matching source, page, catalogue, and RSS dates, and all 85 remote Markdown image references appear as image elements. This does not verify availability of the remote images.
- A repeat HTTP availability check on 2026-11-27 returned image responses for 75 of 76 distinct remote image URLs. The ResearchGate MapReduce diagram returned HTTP 403 to that automated check, but loaded at 850 pixels wide in the local production preview in a browser with caching disabled. The live pages retain the image references.
- Updated three links between migrated posts to use local article sources, including the translated heading fragment. The production build resolves all three to the local `/blog/posts/` routes.
- `mise run test` passed after the live-source corrections and reviewing the archive snapshots: production build and search index, unit and Node tests, and Playwright (67 passed, 3 skipped). `mise run check` reported no errors, warnings, or hints. Browser-backed tests ran outside the sandbox because its browser launch failed inside it.

## Publication evidence (2026-11-27)
- GitHub Pages workflow run 46068483214 succeeded for commit `4664d79`. All 27 live article pages and their catalogue and RSS dates matched the verified local publication dates; all 85 remote Markdown image references appeared as image elements on the live pages. Remote availability is recorded above.
