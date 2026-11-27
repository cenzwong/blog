# Astro migration release notes and rollback

## Changes

Astro and a Unified compiler now build the static site. Published article slugs remain stable while sources live under `content/YYYY/MM/`. Articles include static code highlighting, mathematics and light/dark Mermaid SVGs. Search uses Pagefind; interactive HTML remains isolated in a script-only iframe and Python execution is explicitly opt-in. Archives, topics, metadata and an editorial layout are generated from the content collection.

The build uses pnpm and no longer requires Python. Chrome or Chromium is required to render diagrams; Playwright Chromium is used for browser tests. See [local development](local-development.md) for setup and [the engineering board](../board/README.md) for remaining acceptance checks. GitHub Actions and the deployed site have not yet been verified for this migration.

## Rollback

The local pre-migration repository revision was `bffd6e2872bf6d0fa0df46f1b6481a2cc9fdd712`. To inspect or rebuild that version, use a separate checkout or worktree at that revision and follow its own setup instructions; it uses the earlier npm/Python pipeline. Do not overwrite the current working tree or assume that this revision is the same as the currently deployed Pages artifact. Once the migration is committed, a rollback can be prepared as a reviewed revert or by deploying a previously validated Pages artifact. Preserve newer article edits and revalidate canonical routes, RSS and search before any rollback deployment.
