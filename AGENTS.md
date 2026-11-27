# Cenz.Blog repository instructions

Before implementing a change, identify the intended outcome and check that the proposed approach is the simplest reliable way to reach it. Explain trade-offs when a materially better option exists. Verify access and permissions before relying on them.

## Project workflow

- The pnpm lockfile is authoritative; Astro owns publishing and Unified owns content transformation.
- Run project commands with mise. Review `mise.toml`, then run `mise trust`, `mise install`, and `mise run setup` on a fresh checkout.
- Use `mise run dev` to serve and watch articles, `mise run test` after changes to content or site behavior, `mise run check` for diagnostics, and `mise run build` followed by `mise run preview` to inspect production output.
- Keep `.venv/`, `node_modules/`, `.generated/`, and `dist/` out of Git.
- Update the relevant guide in [docs](docs/README.md) when behavior changes. Record verification and outstanding checks on the [engineering board](board/README.md).

## Content and site changes

- Follow the [authoring guide](docs/authoring.md) for metadata, drafts, and executable HTML. Preserve published slugs and existing inbound links.
- Review interactive HTML as code and preserve its script-only iframe sandbox. Treat content in the public repository as public, including drafts.
- Keep pages readable without JavaScript and retain on-demand search and article features. The [architecture guide](docs/architecture.md) maps the source files to the build and browser runtime.
