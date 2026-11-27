# Article authoring guide

Write articles directly under `content/` as Markdown (`.md`) or HTML (`.html` or `.htm`). The build publishes articles at `/blog/posts/<slug>/` and indexes their generated HTML with Pagefind.

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

Required fields are `title`, `description`, `date`, and `tags`. Titles must be unique regardless of case. Dates use `YYYY-MM-DD`. Tags can be a non-empty YAML list or a comma-separated string. A slug must be unique and use lowercase letters and digits, with single hyphens between segments. The filename stem supplies the slug when omitted. Keep published slugs stable so existing links continue to work.

Set `draft: true` to omit an article from the generated site, feeds, and search. Keep secrets and private material outside the public repository.

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

Use `interactive: true` for reviewed HTML that needs scripts. The published article runs the interactive document in a script-only sandboxed iframe and includes a static text version. Raw HTML in Markdown is escaped.

## Build and preview

After [setting up the project](local-development.md), run `mise run dev` and open the URL it prints. Refresh after the content rebuild finishes. Run `mise run test` before submitting an article.
