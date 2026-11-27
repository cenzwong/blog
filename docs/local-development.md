# Local development

Install [mise](https://mise.jdx.dev/getting-started.html) and run these commands from the repository root.

```sh
mise trust
mise install
mise run setup
```

`mise.toml` pins Node.js and Python. Mise creates and activates the project’s `.venv/` for tasks. Setup installs JavaScript dependencies from `package-lock.json` and Python dependencies from `requirements.txt`. Re-run setup when either dependency manifest or the lockfile changes.

| Command | What it does |
| --- | --- |
| `mise tasks` | Lists available project tasks. |
| `mise run dev` | Builds and serves the static site. Edits to articles trigger debounced, serialized rebuilds. Refresh after each rebuild. Restart the server after changing code outside `content/`. |
| `mise run build` | Validates content, bundles assets, generates static pages and feeds, indexes articles with Pagefind, and validates the final output. |
| `mise run test` | Builds the site, then runs the Python ingestion and Node rendering and artifact tests. |
| `mise run preview` | Serves the last build in `dist/`. |

Development and preview print a local URL. With the default mount path, open the site under `/blog/`. Temporary build inputs go in `.generated/`.

## Build settings

- `VITE_BASE` defaults to `/blog/` and sets the path prefix for routes and assets.
- `SITE_URL` defaults to `https://cenzwong.github.io/blog` and sets the public site URL, including its mount path, for canonical links, the sitemap, and RSS.

Use matching settings in build, test, and preview. For a root-hosted site, for example:

```sh
export VITE_BASE=/
export SITE_URL=https://example.com
mise run test
mise run preview
```
