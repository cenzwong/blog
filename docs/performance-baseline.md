# Local performance baseline

On 2026-11-27, Lighthouse 13.6.0 measured the local Astro production preview on macOS using headless Chrome Canary 160 and Lighthouse's default mobile emulation and throttling. The first-party responses were served locally. Each number below is from one lab run, not a field measurement or a cross-device guarantee. Run `pnpm run perf` after a build to reproduce the two reports in `.generated/lighthouse/`.

| Page | Performance | Accessibility | SEO | LCP | CLS | Total blocking time | Transferred bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Rolling Toolbox article | 100 | 100 | 100 | 0.91 s | 0 | 0 ms | 32,074 |
| Bloom Filter interactive article | 100 | 100 | 100 | 0.75 s | 0.044 | 0 ms | 65,328 |

The interactive iframe is lazy-loaded below the initial viewport, so this run does not measure calculator interaction or its loaded-resource cost. Lighthouse's total blocking time is a lab proxy and does not measure field INP. For the two initial HTML documents, separately gzip-compressing each inline executable script totalled about 3.3 KB; actual transfer combines those scripts with HTML and depends on the server. Reader network, hardware, caches and real-user Core Web Vitals may differ substantially.

An initial run reported 96 accessibility because dark code comments had insufficient contrast. The high-contrast Shiki dark theme fixed that finding; dark-mode axe checks are now included in Playwright. Automated checks do not replace manual keyboard, screen-reader, contrast and device review.
