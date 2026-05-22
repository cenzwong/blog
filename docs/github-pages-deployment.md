# 🌐 GitHub Pages Deployment Guide

Deploying your static blog to the live internet is completely automated and 100% free using GitHub Pages and GitHub Actions. This guide will walk you through the entire process, even if you are brand new to Git and GitHub!

---

## 1. What are GitHub and GitHub Pages?

*   **GitHub**: A cloud hosting service where developers store, share, and track their project source code.
*   **GitHub Pages**: A free hosting platform built directly into GitHub. It takes your static website files (HTML, CSS, JS, and our compiled SQLite database) and serves them as a live public website.
*   **GitHub Actions**: A virtual computer system provided by GitHub. Every time you push a code change, this virtual system boots up, installs Python and Node, compiles your articles into `search_index.db`, builds the assets, and deploys it live. All of this is pre-configured in `.github/workflows/deploy.yml`.

---

## 2. Create a GitHub Repository

1. Go to [github.com](https://github.com) and log in (or create a free account).
2. In the top-right corner, click the **`+`** icon and select **New repository**.
3. Fill out the repository details:
   - **Repository name**: For example, `my-wasm-blog` or `cenz-blog`.
   - **Public/Private**: Select **Public** (required for free GitHub Pages hosting).
   - **Do NOT check** "Add a README", "Add .gitignore", or "Choose a license". *Keep it completely empty since we already have these files locally!*
4. Click **Create repository**.

---

## 3. Upload Your Code to GitHub (Initial Push)

GitHub will show you a page with some terminal commands. Follow these steps to initialize Git locally and upload your files:

1. Open your terminal and ensure you are inside your project folder (`cenz-blog`).
2. Run these commands one-by-one:
   ```bash
   # 1. Initialize Git on your local folder
   git init

   # 2. Track all project files
   git add .

   # 3. Save a snapshot of your files locally
   git commit -m "First commit: SQLite Wasm static blog"

   # 4. Set your default branch to 'main'
   git branch -M main

   # 5. Connect your local folder to your new GitHub repository
   # (Replace the URL below with your actual repository URL!)
   git remote add origin https://github.com/your-username/your-repo-name.git

   # 6. Upload your code to the cloud
   git push -u origin main
   ```

---

## 4. CRITICAL: Configure GitHub Pages to use Actions

Because we use a build pipeline (which builds the search database and compiles Vite assets at deployment time), we must tell GitHub Pages to use **GitHub Actions** rather than deploying simple static files.

1. Open your repository page on [github.com](https://github.com).
2. Click the **Settings** tab (with the gear icon) at the top of your repository page.
3. In the left-hand sidebar under "Code and automation", click on **Pages**.
4. Look for the **Build and deployment** section in the middle of the screen.
5. Under **Source**, click the dropdown menu and select **GitHub Actions** (it defaults to "Deploy from a branch").
   > [!IMPORTANT]
   > Selecting **GitHub Actions** is mandatory. If you do not choose this, GitHub will not run your `.github/workflows/deploy.yml` pipeline, and your database will not compile!

---

## 5. Watch the Magic Happen!

Once you select GitHub Actions, your deployment starts automatically:

1. Click on the **Actions** tab at the top of your repository page on GitHub.
2. You will see a workflow running (indicated by a yellow spinning wheel) named "Deploy Cenz Blog to GitHub Pages".
3. Click on the running workflow to watch the step-by-step logs in real-time. It will:
   - Install Python.
   - Run `npm run build` (which compiles your Markdown files into `search_index.db` and bundles Vite assets).
   - Pack your files and deploy them.
4. Once the wheel turns into a **green checkmark**, your blog is LIVE!
5. The deployment page will display a public link (usually `https://your-username.github.io/your-repo-name/`). Click it to view your stunning, Wasm-SQLite powered blog live on the web!

---

## ✍️ Updating Your Blog in the Future

Whenever you write a new article or make styling modifications, publishing your changes takes just three simple Git commands:

```bash
# 1. Track your new files/changes
git add .

# 2. Create a local commit
git commit -m "Added a new article about WebAssembly"

# 3. Push to GitHub
git push
```
The moment you run `git push`, GitHub Actions will wake up, compile your updated article into the SQLite search index, bundle your code, and publish the update live. You never have to manually build anything again! 🚀
