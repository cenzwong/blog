# Article authoring guide

Write Markdown (`.md`) or HTML (`.html` or `.htm`) under `content/YYYY/MM/`, using the publication year and month. Discovery is recursive; keep non-article files in `assets/`. Published articles retain the canonical URL `/blog/posts/<slug>/` regardless of source location.

```yaml
---
title: Example article
description: A short article summary.
date: 2026-11-26
author: Cenz Wong
tags: [Python, Data Engineering]
slug: example-article
draft: false
---
```

`title`, `description`, `date` and `tags` are required. Dates are valid calendar dates in `YYYY-MM-DD` form. Tags may be a YAML list or comma-separated string. Slugs use lowercase letters and digits separated by single hyphens and must be unique. The filename stem supplies a missing slug; keep published slugs stable. Optional metadata includes `subtitle`, `updated`, `category`, `featured`, `series`, `cover`, `interactive`, and `aliases`. `aliases` is a list of old article slugs; each creates a static redirect at `/posts/<alias>/`. `updated` must not precede publication. A `cover` may be an HTTPS image URL or a path relative to the source; it appears on the article and in sharing metadata. The site uses a shared social image when no cover is provided.

Set `draft: true` to exclude an article from public pages and indexes. Repository content, including drafts, is public. Relative assets and article links resolve from the source file and must remain inside `content/`.

Markdown supports GFM, math, fenced code, Mermaid and `:::note`, `:::tip` or `:::warning` callout blocks. An image title becomes a caption when the image is alone in its paragraph. Math, highlighting and diagrams are rendered at build time. Raw HTML in Markdown is not executed. Ordinary Python fences are display-only; explicitly opt in to browser execution with a `python run` fence. Only use examples compatible with Pyodide; it loads on demand from a CDN and runs in a worker.

HTML articles use a leading YAML metadata comment. Use `interactive: true` only for reviewed HTML that needs scripts. Its interactive document runs in a script-only sandboxed iframe with restricted resources, and the article retains a sanitised static copy. Local image, JavaScript and stylesheet references are embedded into the isolated document after content-root checks. CSS `@import`, image `srcset`, remote assets and network requests are not supported; the build reports unsupported local references. Interactive content must not depend on parent DOM access or external resources.

Run `mise run dev` to preview and `mise run test` before submitting. See [local development](local-development.md) for browser setup and build commands.
