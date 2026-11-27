# Article authoring guide

Write published articles under `content/` as Markdown (`.md`) or HTML (`.html` / `.htm`). The build publishes static article pages at `/blog/posts/<slug>/` and indexes generated HTML with Pagefind.

## Markdown frontmatter

```yaml
---
title: Example article
subtitle: Optional subtitle
description: A short article summary.
date: 2026-11-26
author: Cenz Wong
tags:
  - Python
  - Data Engineering
slug: example-article
draft: false
---

# Article body
```

Legacy comma-separated tags and HTML-comment metadata remain supported. Required fields are `title`, `description`, `date`, and a non-empty `tags` value. Dates must be valid ISO dates. Slugs must use lowercase letters, digits and single hyphens, and be unique. When omitted, the slug is derived from the filename.

Set `draft: true` to omit an article from the public site, feeds and search. The repository remains public, so drafts must not contain secrets or private material.

## HTML articles

Use a YAML metadata comment before the document:

```html
<!--
title: Interactive article
description: A short description.
date: 2026-11-26
tags: HTML, Web
slug: interactive-article
interactive: true
-->
<!doctype html>
<html lang="en"><body><h1>Interactive article</h1></body></html>
```

Only explicitly declared interactive HTML is placed in a sandboxed iframe. It receives script permission without same-origin permission. Standard Markdown HTML is escaped and does not execute scripts.

## Build and preview

```sh
npm ci
python3 -m pip install -r requirements.txt
npm run dev
```

The development command builds and serves the generated static website, then watches content changes with a debounce. Use `npm run build` for the production build, `npm test` for automated checks, and `npm run preview` to serve the last generated `dist/` directory.
