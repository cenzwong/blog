# 💻 Local Development Guide

This guide is designed to teach you exactly how to work with this website locally on your computer. If you have never used Node.js, NPM, or command-line builders, don't worry! We will take it step-by-step.

---

## 1. What are Node.js and NPM?

*   **Node.js**: Normally, JavaScript only runs inside your web browser. Node.js is a tool that allows JavaScript to run directly on your computer (outside the browser). This lets developers build tools, scripts, and compilers.
*   **NPM (Node Package Manager)**: A massive library of pre-written JavaScript code. Instead of writing everything from scratch, we use NPM to download helper packages (like `marked` to compile Markdown, or `vite` to package our site).
*   **`package.json`**: This is your project's dashboard. It lists the packages we downloaded, configuration details, and convenient "scripts" (shortcuts to run commands).

---

## 2. Setting Up the Project

Before running the website, you need to download and install its packages:

1. Open your terminal application.
2. Navigate to your project folder (if you are not already there).
3. Run the following command to download the required NPM packages:
   ```bash
   npm install
   ```
   *This will create a folder named `node_modules/` in your directory. This is where NPM stores the downloaded packages.*

---

## 3. How to Write a New Blog Post

Adding new content to your blog is incredibly easy! All articles are stored as static Markdown files under the `content/` folder.

### Step 1: Create a new file
Create a new file in `content/` ending in `.md` (for example, `content/my-awesome-post.md`).

### Step 2: Add Frontmatter (Metadata Headers)
At the very top of your file, add your article headers between triple dashes (`---`). This is written in a simple `key: value` format:

```yaml
---
title: My Awesome First Article!
description: A friendly introduction to writing articles on my brand new SQLite Wasm blog.
date: 2026-05-22
tags: WebDev, General, Beginner
slug: my-first-awesome-post
---
```
> [!IMPORTANT]
> - **`date`**: Use the `YYYY-MM-DD` format.
> - **`slug`**: This is the unique word in the URL of your article (e.g. `http://yoursite.com/#/post/my-first-awesome-post`). Do not use spaces or special characters; use hyphens.
> - Make sure there is exactly one space after each colon (`:`).

### Step 3: Write your article body
Under the second `---`, write your article content using standard Markdown syntax (headers, lists, bold text, code blocks). For example:
```markdown
This is my first paragraph! I can make text **bold** or *italic* easily.

## Key Subheading
* Bullet point one
* Bullet point two

Here is some code: `console.log("Hello Wasm!");`
```

---

## 4. Compile the SQLite Database Index

Because the website's search engine queries an optimized SQLite database file, **every time you add, edit, or delete an article, you must re-generate the database**.

Run this command in your terminal:
```bash
npm run ingest
```
This shortcut executes our custom Python script (`scripts/ingest.py`) which:
1. Deletes the old database.
2. Scans your `content/` folder for all Markdown articles.
3. Parses the YAML frontmatter.
4. Generates a compact, high-performance SQLite database.
5. Saves the output database at `public/search_index.db`.

---

## 5. Testing Your Blog Locally

Vite provides a super fast developer server to let you view your website as you make changes.

### Development Mode (Real-time Editing)
Run the following command to boot up your site:
```bash
npm run dev
```
1. The terminal will print a link (usually `http://localhost:5173/` or similar).
2. Click or open this link in your web browser.
3. Keep the terminal running. Any edits you make to styles or HTML will update in your browser *instantly* without refreshing!
4. Press `Ctrl + C` in the terminal to stop the server when you are done.

### Production Preview Mode (Ultimate Test)
Before deploying your blog to GitHub Pages, it is best practice to run a "production build" to verify the exact files that your readers will download:

1. Compile the final bundle:
   ```bash
   npm run build
   ```
   *This compiles the SQLite database and compiles, minifies, and packages all assets into a final `dist/` directory.*
2. Start a local preview server:
   ```bash
   npm run preview
   ```
3. Open the printed link in your browser (usually `http://localhost:4173/`).
4. This serves the exact production-grade files. Test your search bars and navigations here to verify absolute perfection!
5. Press `Ctrl + C` in the terminal to close the server.

---

Now that you know how to build and test locally, head over to the [🌐 GitHub Pages Deployment Guide](./github-pages-deployment.md) to launch your blog live to the world!
