# ADR-008 · Manage project tasks with mise

> Partly superseded by [ADR-012](012-pnpm-and-browser-tooling.md); this record preserves the original tooling decision.

Local development and GitHub Actions use the same mise tasks for dependency installation, builds, and tests. The repository pins Node.js and Python once in `mise.toml`, and mise activates a project virtual environment for Python dependencies.

The tasks call the package scripts for build and test steps. This keeps the build pipeline in one place and lets the development watcher continue to use it. Contributors need mise for the documented workflow.
