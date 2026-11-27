#!/usr/bin/env python3
"""Validate authored content and emit deterministic build inputs."""
import json
import re
from datetime import date
from pathlib import Path
import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
OUT = ROOT / ".generated"
FRONTMATTER = re.compile(r"^(?:---|<!--)\s*\n(.*?)\n(?:---|-->)\s*\n(.*)$", re.S)
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

def parse_frontmatter(text, path):
    match = FRONTMATTER.match(text)
    if not match:
        raise ValueError(f"{path}: expected YAML or HTML-comment metadata block")
    try:
        metadata = yaml.safe_load(match.group(1)) or {}
    except yaml.YAMLError as exc:
        raise ValueError(f"{path}: invalid YAML metadata: {exc}") from exc
    if not isinstance(metadata, dict):
        raise ValueError(f"{path}: metadata block must contain a YAML mapping")
    return metadata, match.group(2)

def build_post(metadata, filename, body, seen):
    slug = str(metadata.get("slug", Path(filename).stem)).strip()
    if not SLUG.fullmatch(slug):
        raise ValueError(f"{filename}: unsafe slug {slug!r}; use lowercase letters, digits and single hyphens")
    if slug in seen:
        raise ValueError(f"{filename}: duplicate slug {slug!r}")
    title = str(metadata.get("title", "")).strip()
    if not title:
        raise ValueError(f"{filename}: required metadata 'title' is missing")
    if f"title:{title.casefold()}" in seen:
        raise ValueError(f"{filename}: duplicate article title {title!r}")
    description = str(metadata.get("description", "")).strip()
    if not description:
        raise ValueError(f"{filename}: required metadata 'description' is missing")
    raw_date = str(metadata.get("date", "")).strip()
    if not raw_date:
        raise ValueError(f"{filename}: required metadata 'date' is missing")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw_date):
        raise ValueError(f"{filename}: publication date must use YYYY-MM-DD format")
    try:
        date.fromisoformat(raw_date)
    except ValueError as exc:
        raise ValueError(f"{filename}: invalid publication date {raw_date!r}; use a valid YYYY-MM-DD date") from exc
    tags = metadata.get("tags", [])
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(",") if tag.strip()]
    if not isinstance(tags, list) or any(not isinstance(tag, str) for tag in tags):
        raise ValueError(f"{filename}: tags must be a non-empty string list or comma-separated string")
    tags = [tag.strip() for tag in tags]
    if not tags or any(not tag for tag in tags):
        raise ValueError(f"{filename}: tags must be a non-empty string list or comma-separated string")
    author = str(metadata.get("author") or "Cenz Wong").strip()
    draft = metadata.get("draft", False)
    interactive = metadata.get("interactive", False)
    if not isinstance(draft, bool):
        raise ValueError(f"{filename}: draft must be true or false")
    if not isinstance(interactive, bool):
        raise ValueError(f"{filename}: interactive must be true or false")
    seen.add(slug)
    seen.add(f"title:{title.casefold()}")
    return {"title": title, "subtitle": str(metadata.get("subtitle", "")),
            "description": description, "date": raw_date,
            "tags": tags, "slug": slug, "format": "html" if Path(filename).suffix.lower() in (".html", ".htm") else "md",
            "content": body, "author": author,
            "draft": draft,
            "interactive": interactive}

def main():
    if not CONTENT.exists():
        raise SystemExit(f"Missing content directory: {CONTENT}")
    posts, seen = [], set()
    for path in sorted(CONTENT.iterdir()):
        if path.suffix.lower() not in (".md", ".html", ".htm"):
            continue
        try:
            meta, body = parse_frontmatter(path.read_text(encoding="utf-8"), path.name)
            post = build_post(meta, path.name, body, seen)
            if not post["draft"]:
                posts.append(post)
        except (ValueError, TypeError) as exc:
            raise SystemExit(str(exc)) from exc
    posts.sort(key=lambda p: (p["date"], p["slug"]), reverse=True)
    OUT.mkdir(exist_ok=True)
    (OUT / "posts.json").write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    catalogue = {"schema_version": 1, "posts": [{k: p[k] for k in ("slug", "title", "description", "date", "author", "tags")} | {"url": f"/posts/{p['slug']}/"} for p in posts]}
    (OUT / "metadata.json").write_text(json.dumps(catalogue, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Validated {len(posts)} published articles; wrote build inputs to {OUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
