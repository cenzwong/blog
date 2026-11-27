# GitHub Pages deployment

Set the repository’s Pages source to **GitHub Actions**. The [deployment workflow](../.github/workflows/deploy.yml) installs the runtimes declared in `mise.toml` and runs `mise run setup` and `mise run test` for pull requests and production builds.

Pushes to `main` and manual runs on `main` publish the validated `dist/` artifact. The deploy job owns the Pages write and OIDC permissions, and the Pages concurrency group cancels superseded deployments.

The workflow uses the default `/blog/` mount and `https://cenzwong.github.io/blog` public URL. When changing hosts or mount paths, set both `VITE_BASE` and `SITE_URL` as described in the [local development guide](local-development.md#build-settings).

For a local production preview, run `mise run build` followed by `mise run preview`. Track deployed behavior and pending verification on the [engineering board](../board/README.md).
