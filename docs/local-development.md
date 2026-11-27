# Local development

## Requirements

Use Node.js 22.16.0 and Python 3.12.16, pinned in optional `mise.toml`. The tools remain optional; standard Node.js/Python installations work. Restore dependencies with `npm ci` and `python3 -m pip install -r requirements.txt`. The pinned PyYAML dependency provides standards-compliant frontmatter parsing.

## Write an article

Create `.md`, `.html` or `.htm` under `content/`. Markdown frontmatter and legacy HTML comments are supported. Set a unique lowercase slug, title and valid ISO date; comma-separated tags or YAML tag lists work. Set `draft: true` to exclude an article. HTML that requires scripts must explicitly set `interactive: true` and be reviewed as executable code.

## Development and production preview

`npm run dev` builds the V2 static site, serves the generated routes, and watches `content/` for edits. Content changes are debounced and trigger serialized rebuilds; refresh the browser to see the updated generated pages. This runs the same static route structure and Pagefind index as production.

```sh
npm run dev
```

For a one-time production build, run `npm run build`; to serve the last build without watching, use `npm run preview`. The build validates content, bundles styles, generates static pages and crawler feeds, creates the Pagefind index, and validates the final artifacts. `.generated/` and `dist/` are build outputs. `VITE_BASE` defaults to `/blog/`, while `SITE_URL` defaults to the production site origin.

Run `npm test` after a build to check catalogue/body separation and required static artifacts. These checks do not replace browser, accessibility, Lighthouse or production-host verification.
