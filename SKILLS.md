# How to Add a New Blog Post

This guide explains how to add new blog posts to the Cenz.Blog static site. The site supports writing posts in either **Markdown (`.md`)** or **HTML (`.html`)**.

## File Location

All new blog posts must be placed in the `content/` directory.

## Frontmatter Metadata

Every blog post **must** include a metadata section at the very top of the file, known as "frontmatter". This metadata tells the blog engine the title, date, URL slug, and tags for your article.

The format of the frontmatter depends on the type of file you are creating.

### For Markdown (`.md`) Files

Use standard YAML-style frontmatter enclosed by `---`.

```markdown
---
title: "Your Post Title"
subtitle: "An optional subtitle"
description: "A short description of the post."
date: "YYYY-MM-DD"
tags: "Python, Data Engineering, PySpark"
slug: "your-post-url-slug"
author: "Cenz Wong"
---

# Your Markdown Content
Write your post here...
```

### For HTML (`.html`) Files

Use an HTML comment block `<!-- -->` for the frontmatter so that it remains valid HTML.

```html
<!--
title: "Your HTML Post Title"
subtitle: "An optional subtitle"
description: "A short description of the HTML post."
date: "YYYY-MM-DD"
tags: "HTML, Web, Advanced"
slug: "your-html-post-slug"
author: "Cenz Wong"
-->
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Optional custom head elements -->
</head>
<body>
  <h1>Your HTML Post Title</h1>
  <p>Write your custom HTML content here.</p>
</body>
</html>
```

## Supported Frontmatter Fields

| Field | Required | Description |
| :--- | :--- | :--- |
| `title` | **Yes** | The title of the article. |
| `description` | No | A short summary shown in search results and post cards. |
| `date` | No | The publication date (format: `YYYY-MM-DD`). Determines sorting order. |
| `tags` | No | Comma-separated list of tags (e.g., `Python, Spark`). Defaults to `Tech` if empty. |
| `slug` | No | The URL path for the article. If omitted, the filename without extension is used. |
| `subtitle` | No | A smaller subtitle shown below the title. |
| `author` | No | The author name. Defaults to `Cenz Wong`. Use `Cenz Wong & Gemini AI` to trigger the co-author badge. |

## Compilation Step

After creating or modifying a file in the `content/` directory, you must run the ingestion script to update the client-side search index.

1. Open your terminal in the root directory.
2. Run the following command:
   ```bash
   npm run ingest
   ```
3. This generates or updates the `public/search_index.json` file.
