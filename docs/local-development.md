# Local development

Install [mise](https://mise.jdx.dev/getting-started.html) and run these commands from the repository root:

```sh
mise trust
mise install
mise run setup
mise run dev
```

Mise pins Node.js and pnpm. Setup installs the frozen pnpm dependencies, ensures a Chrome or Chromium browser is available for Mermaid rendering, and ensures a Chromium browser is available for Playwright tests. On macOS, an existing Chrome installation can be reused; otherwise setup installs Playwright Chromium. Set `PUPPETEER_EXECUTABLE_PATH` to select a browser for diagrams and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for browser tests. CI uses the Chrome installed on its Ubuntu runner rather than downloading a separate Playwright browser, so its version follows the runner image. If no supported diagram browser exists, setup installs the Chrome version pinned by Puppeteer. Re-run setup when dependency manifests change.

Contributors without mise can use Node.js and pnpm at the versions in `mise.toml`: run `pnpm install --frozen-lockfile`, `pnpm run setup:browser`, and `pnpm run setup:playwright`. The standard commands are `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm test`, `pnpm check`, `pnpm lint`, and `pnpm perf`.

| Command | What it does |
| --- | --- |
| `mise run dev` | Renders diagrams and starts the Astro development server. Article changes are watched; see the console for diagram regeneration. |
| `mise run build` | Builds diagrams, Astro pages and the Pagefind index, then validates `dist/`. |
| `mise run test` | Builds the production site and runs Vitest, compiler and compatibility tests, and desktop/mobile Playwright and axe checks. |
| `mise run check` | Checks Astro and TypeScript diagnostics. |
| `mise run preview` | Serves the production build. |
| `pnpm run perf` | Runs local Lighthouse lab measurements for a standard and an interactive article after building. Reports go to `.generated/lighthouse/`. |

Use the URL printed by the server, including `/blog/` for the default project path. `.generated/` holds temporary diagram files and is not published. A browser is needed at build time for Mermaid; diagrams themselves are static SVGs and need no reader JavaScript.

## Build settings

- `VITE_BASE` defaults to `/blog/` and sets the path prefix for routes and assets.
- `SITE_URL` defaults to `https://cenzwong.github.io/blog`; its origin is used for canonical URLs, sitemap and RSS. Keep its path consistent with `VITE_BASE`.
- `PUPPETEER_EXECUTABLE_PATH` selects Chrome or Chromium for diagram rendering. `PUPPETEER_NO_SANDBOX=1` is an explicit opt-in for environments where Chrome's sandbox is unavailable.

For a root-hosted site, set `VITE_BASE=/` and `SITE_URL=https://example.com` for build, test and preview. The subpath production configuration remains the default.
