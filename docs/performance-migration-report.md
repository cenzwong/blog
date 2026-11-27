# Performance and migration evidence

## Build evidence

The original baseline build on the checked-in dependency set ran on macOS with Node 26.13.0 and Python 3.15.2. It emitted a single SPA bundle: JavaScript 52.55 kB (16.69 kB gzip), CSS 18.01 kB (4.02 kB gzip). The final V2 build was verified with the pinned Node 22.16.0 runtime, Vite 8.4.0 and Pagefind 1.6.0. Vite emitted CSS at 19.33 kB (4.36 kB gzip) and no application JavaScript entry bundle; article pages are standalone HTML and load the small feature dispatcher from a static file. These build artifact sizes are not directly comparable to total browser transfer size.

The generated feature dispatcher is 5.99 kB and the on-demand Python worker is 1.05 kB (uncompressed source files). Pagefind generated an index over 8 articles: 2,640 indexed words and one tag filter. `npm run build`, `npm test` (8 Python unit tests and 5 Node tests), and the production artifact validator passed. npm reported zero vulnerabilities after compatible lockfile updates. A build using the pinned Node 22.16.0 runtime passed; Python 3.12.16 is configured for local/CI use but was not installed in this environment. Both `/blog/` and root-base/custom-domain output were build-validated. The development server also built and served the generated routes; a temporary draft edit triggered a debounced rebuild and remained excluded from public artifacts.

## Local mobile browser measurements

One local preview run on 2026-11-26 used Chrome 156 with a 390 × 844 CSS viewport, DPR 3, CPU slowdown 4×, 150 ms network RTT, 1.6 Mbps down / 0.75 Mbps up, and cache disabled. These are single browser runs, not Lighthouse or repeatable lab medians. Transfer figures are browser resource transfer totals and can include third-party feature runtimes; they are not compressed bundle sizes.

| Page/state | LCP | CLS | Document transfer | Resource transfer |
|---|---:|---:|---:|---:|
| Home | 432 ms | 0 | 2,437 B | 7,045 B |
| Long PySpark article with math/highlighting | 412 ms | 0 | 4,659 B | 110,376 B |
| Mermaid article (4 diagrams) | 420 ms | 0 | 10,024 B | 1,364,645 B |
| Search, initial | 444 ms | 0 | 2,363 B | 7,045 B |
| Search after six PySpark results, before layout fix | 2.2 s | 0.61 | — | — |
| Search after six PySpark results, overlay layout | — | 0.0219 | — | 33,613 B |

The search result panel now overlays the page and has its own scroll area. The 390 px capture showed the controls fitting without horizontal overflow and six readable results; the overlay can cover the footer while open. Mermaid accounts for most transfer on its feature page because the runtime is currently loaded from a CDN; primary article content remains present before it finishes. This is evidence for the local configuration only and does not measure GitHub Pages or production conditions.

No Lighthouse Performance, SEO, or accessibility score has been collected. The handoff's Lighthouse targets and production Core Web Vitals remain unverified. These measurements do not establish an across-the-board performance improvement; notably, the Mermaid page has a large optional runtime transfer.

## Migration verification still required

- Verify legacy hash URLs under `/blog/` on the production host.
- Verify no-result behavior and Pagefind loading in the deployed production browser.
- Verify additional interactive HTML controls, runtime assets and trust boundaries on the production host.
- Review mobile visual layout and responsive control behavior across representative pages and assistive technologies.
- Record repeatable Lighthouse runs with device, browser, network profile, page samples and methodology.
- Verify RSS, sitemap, canonical URLs and custom-domain/base `/` configuration on the deployed static host.

## Local browser behavior checks

A local Vite preview and the current `npm run dev` output were inspected in the browser:

- Direct article route loaded its article-specific title and full content.
- With script execution disabled, article title, metadata, tags and body text still rendered.
- Legacy `#/post/<slug>` redirected to its canonical static article route.
- Pagefind made zero index requests before a query; typing `Spark` loaded the runtime/index, returned six results and rendered 12 highlighted marks. Selecting the `PySpark` filter returned results whose Pagefind filter metadata included `PySpark`.
- Four Mermaid diagrams rendered to SVG. One KaTeX-heavy article rendered 21 math spans and two highlighted code blocks.
- In a test-only DOM snippet, the Python worker printed output, preserved a variable across runs, cleared state after reset, raised `NameError` for the cleared variable, and terminated a running loop on cancel.
- The interactive HTML article appeared in an iframe with sandbox `allow-scripts`; `allow-same-origin` was absent.
- The development server rendered the static homepage, direct Bloom Filter article and Pagefind results from `/blog/`; the article had an article-specific title and the expected iframe sandbox.

A 390 px CSS viewport check first found overflow from decorative background orbs; root-level horizontal clipping removed that overflow. A later visual check found the search controls crowded together, so the search form now uses a responsive grid. The final check found `scrollWidth = 390 px` on the homepage, search page, a long Markdown article, the interactive HTML article and About page. Search controls fit the viewport; the input and submit button span the form width, while the tag selector stays beside its label. A `PySpark` query returned six results, and an unmatched token showed the empty state. The interactive article iframe measured 358 px wide with `sandbox="allow-scripts"`. This is a focused mobile layout check, not a full cross-device visual or accessibility audit.

These checks cover local browser behavior only. They do not establish accessibility scores, production-host paths, or Lighthouse/Core Web Vitals performance.

The Bloom Filter sizing calculator was also exercised in its sandboxed iframe: changing NDV from 50,000 to 100,000 updated the bit-array and storage outputs; changing FPP from 0.01 to 0.05 changed the optimal bit count/hash count; setting NDV to 2,000,000,000 displayed the configured 1 MB safety-limit warning. This verifies those local calculator interactions, not every control or the entire interactive article.

## Current production state

GitHub Actions deployment run [#18](https://github.com/cenzwong/blog/actions/runs/45966101773) completed successfully on 2026-11-27 for commit `4e8d6177cc7a05f77f6f5b8c1e864f21c61ca5fb`. A live browser check confirmed that the homepage lists the new static routes and that `/blog/posts/iceberg-pyspark-bloom-filter-deep-dive/` loads its article title, metadata, full content, tags, related links and interactive calculator without falling back to the V1 hash-routed shell. This verifies deployment and one direct article route only; it does not verify live search, legacy redirects, feeds, canonical metadata, Lighthouse or accessibility.

After adding the interactive HTML searchable text copy and preserving Mermaid source, the final Pagefind run indexed 2,640 words. The browser also verified four rendered Mermaid diagrams with source disclosures in both emulated color schemes. Blocking the Mermaid CDN kept all four source blocks visible and showed readable fallback notices; blocking Pagefind produced the visible search-unavailable message. The Bloom Filter article's static text copy was searchable, and its iframe remained `sandbox="allow-scripts"` without same-origin access.
