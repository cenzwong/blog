---
title: Client-Side SQLite Search with HTTP Range Requests
description: Learn how to host a read-only SQLite database on GitHub Pages and query it from the browser using standard HTTP Range headers.
date: 2026-05-22
tags: SQLite, WebAssembly, WebDev, VFS
slug: client-side-sqlite-range-queries
---

Static hosting platforms like GitHub Pages, Netlify, and Cloudflare Pages are incredibly popular because they are fast, cost-effective, and highly scalable. However, their major limitation is the absence of a server-side runtime, meaning traditional databases like PostgreSQL, MySQL, or server-side SQLite are unavailable at request time.

For static sites that need to offer rich search features, the typical solutions have been client-side search libraries like Lunr.js or FlexSearch, or external SaaS search APIs like Algolia. While local search engines work well for small sites, they degrade quickly when index sizes grow to megabytes, forcing the browser to download and build a massive search index in memory.

## Enter the HTTP Virtual File System (VFS)

What if we could keep a SQLite database hosted directly on the static file server and query it directly using SQL, without downloading the entire file?

By compiled SQLite to WebAssembly, we can run the database engine in the user's browser. Then, using a custom Virtual File System (VFS) built on top of standard browser networking APIs, we can translate SQLite's synchronous file system read operations into asynchronous HTTP **Range Requests**.

When SQLite wants to execute a query, it reads a set of pages (typically 1024 or 4096 bytes each). The VFS intercepts these requests, makes a `fetch` call with a `Range: bytes=X-Y` header, and returns just the requested page bytes back to SQLite. 

### Why is this efficient?

1. **Zero Cold Starts**: The client doesn't need to boot up a complex database container or establish long-lived TCP sockets.
2. **Minimal Data Overhead**: A query searching a well-indexed database of 100MB might only download 15KB of data (a few B-tree nodes and index pages).
3. **Completely Serverless**: No database hosting bills. The SQLite database is treated as an immutable static asset updated only during your CI/CD compilation phase.

### Indexing is Critical

Because every page read results in a network request, **proper indexing is non-negotiable**. If a search query triggers a full-table scan, SQLite will have to scan every single page, resulting in hundreds of HTTP requests and essentially downloading the entire database file chunk-by-chunk.

To perform search safely and rapidly, we use SQLite's **FTS5 (Full-Text Search)** extension. By creating virtual FTS5 tables and building indexes on fields like titles, tags, and content, we ensure that searches are resolved in logarithmic time with minimal network fetches.

```sql
-- Creating the FTS5 Virtual Table
CREATE VIRTUAL TABLE posts_fts USING fts5(
    title, 
    description, 
    content, 
    content='posts', 
    content_rowid='id'
);

-- Populating the Index
INSERT INTO posts_fts(rowid, title, description, content)
SELECT id, title, description, content FROM posts;
```

This architecture allows you to create search experiences that rival heavyweight search backends, run completely for free on standard CDNs, and keep your frontend insanely responsive.
