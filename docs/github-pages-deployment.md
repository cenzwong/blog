# GitHub Pages deployment

The GitHub Actions workflow builds a static site and deploys only `dist/` to GitHub Pages. Set the repository's Pages source to **GitHub Actions**.

On pull requests, CI installs the lockfile with Node.js 22.16.0 and Python 3.12.11, runs `npm run build`, then `npm test`. A push to `main` builds and validates the site, runs artifact tests, and deploys through the Pages actions. Pages write and OIDC token permissions are scoped to the deploy job. Deployments are serialized by the Pages concurrency group.

The static distribution includes article pages, the metadata catalogue, Pagefind assets, RSS, sitemap, robots and 404. No server, database or external search service is needed. Search and optional browser runtimes load from static Pagefind files or when their feature is used.

For local production-path verification, run `npm run build && npm run preview`. The configured project prefix is `/blog/`; `VITE_BASE` and `SITE_URL` can be set for other static paths or origins. A read-only check on 2026-11-27 found that the live Pages site still serves the V1 hash-routed homepage; `/blog/posts/iceberg-pyspark-bloom-filter-deep-dive/` returned GitHub Pages 404. The V2 build has not been published. After an authorized production deployment, recheck direct routes, search and legacy links on the live site.
