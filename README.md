# Cenz.Blog

Cenz.Blog is a static technical blog about software engineering, data systems, and browser-based computing. Articles are published as standalone HTML pages with tag navigation, on-demand search, and an RSS feed. [Read Cenz.Blog](https://cenzwong.github.io/blog/).

## Quick start

Install [mise](https://mise.jdx.dev/getting-started.html), then run these commands from the repository root.

```sh
mise trust
mise install
mise run setup
mise run dev
```

Open the local URL printed by the development server. It rebuilds after article edits. Use `mise run test` to build and test the site, or `mise run build` followed by `mise run preview` to inspect the production output.

## Repository guide

- [Write and preview articles](docs/authoring.md). Published sources are in `content/`; unpublished drafts are in `archive/unpublished/`.
- [Develop and test locally](docs/local-development.md). The runtime pins and task definitions live in `mise.toml`.
- [Understand the build and browser runtime](docs/architecture.md).
- [Deploy to GitHub Pages](docs/github-pages-deployment.md).
- [Read the repository instructions](AGENTS.md) and [engineering board](board/README.md).
