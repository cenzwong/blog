---
title: "\U0001F40D Untangling Python’s Tooling, Part 2: Meeting uv, the One-Stop Tool"
description: >-
  `uv` replaces Python's traditional stack with a fast, consistent interface for
  managing projects, dependencies, and environments
date: '2025-11-10'
tags:
  - Python
  - python3
  - uv
slug: untangling-pythons-tooling-part-2-meeting-uv-the-one-stop-tool
author: Cenz Wong
---
> 💡 Co-edit with GPT-5

In [Part 1](../10/untangling-pythons-pip-pipx-pyenv-and-venv.md), we unpacked the Python tool zoo:

* `pip` for installing packages
    
* `venv` for virtual environments
    
* `pipx` for global CLI tools
    
* `pyenv` for managing Python versions
    

Each tool did one job reasonably well, but the mental overhead was… a lot.

In this part, we look at `uv`, a new tool from Astral (the folks behind Ruff) that aims to **replace most of that stack with a single, fast, consistent interface**. ([docs.astral.sh](https://docs.astral.sh/uv/?utm_source=chatgpt.com))

This post is a gentle intro to `uv` and a practical “how to start using it today”.

---

## What is `uv`?

`uv` describes itself as:

> “An extremely fast Python package and project manager, written in Rust.” ([docs.astral.sh](https://docs.astral.sh/uv/?utm_source=chatgpt.com))

Concretely, `uv` can:

* Install and manage **Python versions** (like `pyenv`) ([GitHub](https://github.com/astral-sh/uv?utm_source=chatgpt.com))
    
* Create and manage **virtual environments** (like `virtualenv` / `venv`) ([GitHub](https://github.com/astral-sh/uv?utm_source=chatgpt.com))
    
* Manage **project dependencies and lockfiles** (like `pip` + `pip-tools` + parts of `poetry`) ([docs.astral.sh](https://docs.astral.sh/uv/?utm_source=chatgpt.com))
    
* Run **CLI tools and scripts** in isolated environments (like `pipx`) ([GitHub](https://github.com/astral-sh/uv?utm_source=chatgpt.com))
    
* Build and **publish packages** to PyPI or other indexes (`uv build`, `uv publish`) ([docs.astral.sh](https://docs.astral.sh/uv/guides/projects/?utm_source=chatgpt.com))
    

All of this is **10–100x faster than** `pip` in many real-world scenarios, thanks to a Rust implementation and aggressive caching. ([docs.astral.sh](https://docs.astral.sh/uv/?utm_source=chatgpt.com))

If Part 1 was “understanding the mess”, Part 2 is “press the big **simplify** button”.

---

## Installing `uv`

You can install `uv` via the official standalone installer: ([GitHub](https://github.com/astral-sh/uv?utm_source=chatgpt.com))

**macOS / Linux:**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows (PowerShell):**

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Or via package managers, for example:

```bash
brew install uv        # Homebrew (macOS / Linux)
pipx install uv        # pipx
pip install uv         # plain pip (less recommended globally)
```

Check it’s installed:

```bash
uv --version
uv --help
```

Once that works, we can start replacing the old toolbox piece by piece.

---

## Mapping Part 1 Concepts Onto `uv`

Quick mental model from Part 1 → `uv`:

| Old Tool | Role | Rough `uv` equivalent |
| --- | --- | --- |
| `pip` | Install packages | `uv add`, `uv pip install` |
| `pip-tools` | Locking deps | `uv lock`, `uv sync` |
| `venv` / `virtualenv` | Virtual environments | `uv venv`, project `.venv` auto-management |
| `pipx` | Global CLI tools | `uvx`, `uv tool install` |
| `pyenv` | Python versions | `uv python install`, `uv python list` |
| `build` / `twine` | Build & upload | `uv build`, `uv publish` |

We’ll walk through this by building something concrete with `uv`.

---

## Starting a Simple Project with `uv`

Let’s start with the simplest thing: a small script-style project.

```bash
uv init hello-uv
cd hello-uv
```

`uv init` will:

* Create `pyproject.toml`, `.python-version`, `README.md`, `main.py` ([docs.astral.sh](https://docs.astral.sh/uv/guides/projects/?utm_source=chatgpt.com))
    
* Give you a “hello world” script ready to run:
    

```bash
uv run python main.py
# or simply
uv run main.py
```

`uv run` always uses the project’s environment, and keeps it in sync with the lockfile before running. ([docs.astral.sh](https://docs.astral.sh/uv/guides/projects/?utm_source=chatgpt.com))

---

## Scaffolding a Real Package or App (`uv init --package` / `--app`)

For anything more serious—libraries, CLIs, apps you want to publish—`uv` can scaffold a **packaged** project in one command.

### Library or reusable package

```bash
uv init --package data-processing-utils
cd data-processing-utils
```

This gives you a modern `src/` layout: ([docs.astral.sh](https://docs.astral.sh/uv/concepts/projects/init/?utm_source=chatgpt.com))

```text
data-processing-utils/
├── .python-version
├── README.md
├── pyproject.toml
└── src/
    └── data_processing_utils/
        └── __init__.py
```

Key points:

* Code lives under `src/…`
    
* `pyproject.toml` includes `[project]` metadata and a build system
    
* The project can be built and installed like any other modern Python package
    

### CLI-style application package

If you want an **app with a console entry point**:

```bash
uv init --app --package cli-example
cd cli-example
```

`uv` will:

* Create the same `src/cli_example/` structure
    
* Add a script entry point in `pyproject.toml` (under `[project.scripts]`) ([docs.astral.sh](https://docs.astral.sh/uv/concepts/projects/init/?utm_source=chatgpt.com))
    

Then once you’ve written a `main()` function, you can run it with:

```bash
uv run cli-example
```

This flows nicely into building and publishing, which we’ll come back to.

---

## Adding Dependencies: the `pip` Replacement

Inside a project managed by `uv`, you normally work with `uv add`:

```bash
uv add requests
uv add --dev pytest ruff
```

This will:

* Ensure a `.venv` exists for the project
    
* Install the packages into that environment
    
* Update `pyproject.toml` with your direct dependencies
    

You can still drop down to `uv pip` if you need `pip`\-style commands:

```bash
uv pip install -r requirements.txt
uv pip list
uv pip show requests
```

That’s useful when migrating older projects. ([docs.astral.sh](https://docs.astral.sh/uv/?utm_source=chatgpt.com))

---

## Running Code and Commands with `uv run`

`uv run` is your “do stuff in the right environment” button:

```bash
uv run python main.py
uv run -m weather_bot.cli
uv run ruff check .
```

Before each run, `uv` makes sure:

1. The lockfile matches `pyproject.toml`
    
2. The environment matches the lockfile
    

So your command always runs in a consistent state. ([docs.astral.sh](https://docs.astral.sh/uv/guides/projects/?utm_source=chatgpt.com))

---

## Testing with `pytest`: `uv run pytest`

Let’s wire in tests using `pytest`.

First, add it as a dev dependency:

```bash
uv add --dev pytest
```

Then, whenever you want to run your test suite:

```bash
uv run pytest
```

or, if you prefer the explicit module style:

```bash
uv run python -m pytest
```

You might see `uv pytest` mentioned in random blog posts or project docs, but **that’s not a built-in** `uv` subcommand in the general CLI—it only works where a project defines its own wrapper or task. The portable, “works everywhere” way is simply `uv run pytest`. ([CSDN Blog](https://blog.csdn.net/qq_57082933/article/details/150977592?utm_source=chatgpt.com))

This also plays nicely with extra tooling:

```bash
uv add --dev pytest pytest-cov
uv run pytest --cov=your_package
```

---

## Lockfiles: `uv lock` and `uv sync`

Reproducible environments were a big theme in Part 1. `uv` gives you a **universal lockfile**, `uv.lock`. ([docs.astral.sh](https://docs.astral.sh/uv/?utm_source=chatgpt.com))

### `uv lock`: decide and record versions

```bash
uv lock
```

This:

* Resolves **exact** versions for all dependencies
    
* Writes them to `uv.lock`
    

Think of it as a structured, machine-readable version of `pip freeze`.

### `uv sync`: make reality match the lockfile

```bash
uv sync
```

This:

* Reads `uv.lock`
    
* Installs what’s missing
    
* Updates packages to the locked versions
    

On a fresh machine or in CI:

```bash
git clone ...
cd your-project
uv sync
uv run pytest
```

…and you’re running with the same dependency graph as on your laptop.

---

## From Project to PyPI: `uv build` and `uv publish`

This is where the LinkedIn-style “two commands to publish” slide comes from.

Assume you’ve created a packaged project:

```bash
uv init --package data-processing-utils
# ...add code under src/data_processing_utils/...
uv add requests
uv add --dev pytest
uv lock
```

### 1\. Build the distributions

```bash
uv build
```

This creates a `dist/` directory with a wheel and an sdist, e.g.: ([docs.astral.sh](https://docs.astral.sh/uv/guides/projects/?utm_source=chatgpt.com))

```text
dist/
├── data_processing_utils-0.1.0-py3-none-any.whl
└── data_processing_utils-0.1.0.tar.gz
```

### 2\. Publish to PyPI (or TestPyPI)

You’ll need an API token from PyPI or TestPyPI.

Basic flow:

```bash
# Build (again, in case something changed)
uv build

# Publish using a token
UV_TOKEN="pypi-xxxx-xxxx-xxxx" uv publish --token "$UV_TOKEN"
```

For TestPyPI or custom indexes, you can use flags such as `--publish-url` or configure named indexes in `pyproject.toml`. ([docs.astral.sh](https://docs.astral.sh/uv/guides/package/?utm_source=chatgpt.com))

After that, anyone can install your package using plain `pip`:

```bash
pip install data-processing-utils
```

So the basic “package lifecycle” becomes:

```bash
uv init --package data-processing-utils
# ... code, tests, dependencies ...
uv build
uv publish
```

All with the same tool that managed your environment and dependencies.

---

## Using `uv` Instead of `pipx`: `uvx` and `uv tool`

In Part 1, `pipx` was your friend for global CLI tools. With `uv`, you get:

* `uvx` – run tools in temporary, isolated envs
    
* `uv tool install` – install tools globally, but isolated from your projects ([GitHub](https://github.com/astral-sh/uv?utm_source=chatgpt.com))
    

Quick one-off:

```bash
uvx ruff check .
```

Install a tool for repeated use:

```bash
uv tool install ruff@latest
ruff --version
```

This keeps your “tooling” environment clean and separate from project dependencies, but without introducing yet another CLI.

---

## Replacing `pyenv`: `uv python`

`uv` can also handle Python versions for you: ([GitHub](https://github.com/astral-sh/uv?utm_source=chatgpt.com))

```bash
uv python install 3.12
uv python list
uv venv --python 3.12
```

Most of the time you won’t have to think about it: `uv` will download a suitable Python when needed for a project or virtualenv.

---

## A Minimal `uv` Workflow (End-to-End)

Here’s a compact, realistic project flow that touches most of the things we’ve discussed:

```bash
# 1. Create an app-style package
uv init --app --package weather-bot
cd weather-bot

# 2. Add runtime + dev dependencies
uv add httpx
uv add --dev pytest ruff

# 3. Run the app while developing
uv run weather-bot
uv run python -m weather_bot.cli

# 4. Run tests & linting
uv run pytest
uv run ruff check .

# 5. Lock and sync
uv lock
uv sync

# 6. Build for distribution
uv build

# 7. Publish when ready
UV_TOKEN="pypi-xxxx-xxxx" uv publish --token "$UV_TOKEN"
```

Compared to the Part 1 world, notice what’s missing:

* No separate `pyenv` install step
    
* No manual `python -m venv .venv`
    
* No “is this `pip` or `pipx`?” moments
    
* No juggling `requirements.txt` + `requirements-dev.txt` + `constraints.txt` + `twine`
    

Just **one tool** with a consistent model from `init` → `run` → `test` → `build` → `publish`.

---

## When Should You Start Using `uv`?

You don’t need to rewrite your entire Python life in one go. Low-friction ways to start:

* For a **new repo**, run `uv init` or `uv init --package` instead of manually creating a `venv` and `requirements.txt`.
    
* For **CLI tools**, reach for `uvx ruff`, `uvx httpx-cli`, etc.
    
* For an **existing project**, use `uv pip install -r requirements.txt` just to get faster installs, then gradually move to `uv add`, `uv lock`, and `uv sync`. ([docs.astral.sh](https://docs.astral.sh/uv/guides/projects/?utm_source=chatgpt.com))
    

Once you’ve used `uv run` and `uv init --package` a few times, it becomes very hard to go back to the old multi-tool dance.
