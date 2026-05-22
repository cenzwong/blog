# Cenz.Blog 🚀

Welcome to your brand new, ultra-fast, premium developer blog! 

This website is a state-of-the-art static site hosted entirely for free on **GitHub Pages**, featuring a fully serverless, client-side search engine. It loads a **pre-compiled JSON search index** in the browser, enabling instant full-text searches with zero server overhead or third-party API dependencies.

---

## 📖 What is in this Blog?

If you are new to the world of web development, Node.js, and NPM, here is a quick map of what we built for you:

1. **`content/`**: A folder containing raw articles written in **Markdown** format with simple header metadata (called YAML frontmatter).
2. **`scripts/ingest.py`**: A helper Python compiler script. It reads your Markdown articles, compiles them into a highly compact static JSON index, and saves it in `public/search_index.json`.
3. **`src/`**: The frontend design! `src/index.css` is a stunning premium space-dark stylesheet. `src/main.js` handles routing pages and runs real-time client-side search queries.
4. **`package.json`**: A master list of all project configurations, dependencies (like Vite for compiling, and SQLite libraries), and commands.
5. **`.github/workflows/deploy.yml`**: A robots script (CI/CD pipeline) that compiles your database and publishes your site automatically every time you push code to GitHub.

---

## 🛠️ Step-by-Step Guides (For Beginners)

We have created highly detailed, step-by-step instructions to teach you exactly how to work with this codebase. Click a link below to read:

*   ### [💻 Local Development Guide](./docs/local-development.md)
    *Learn how Node and NPM work, how to install packages, how to write new articles, how to generate your search database, and how to test your site locally.*

*   ### [🌐 GitHub Pages Deployment Guide](./docs/github-pages-deployment.md)
    *Learn how to create a GitHub repository, upload your files, configure your settings, and deploy your live blog to the internet for free.*

---

## ⚡ Quick Start Command Cheat-Sheet

Here is a summary of the terminal commands you will run to manage your website:

| Command | What it does | When to run it |
| :--- | :--- | :--- |
| `npm install` | Installs all required pure JavaScript packages. | First time you download/clone the project. |
| `npm run ingest` | Compiles your Markdown files into the JSON search index. | Every time you add, edit, or delete an article. |
| `npm run dev` | Starts a fast local development server with hot-reload. | While writing articles or editing frontend styling. |
| `npm run build` | Builds your production-ready static assets in `dist/`. | Before deploying manually (GitHub does this automatically!). |
| `npm run preview` | Previews the compiled production bundle locally. | To double-check everything works perfectly before pushing live. |

---

Enjoy writing and building! If you ever have any questions about custom features, styles, or queries, just ask! 💻✨
