#!/usr/bin/env python3
"""Genera las páginas HTML a partir de src/pages y src/partials."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
PAGES = SRC / "pages"
header = (SRC / "partials" / "header.html").read_text(encoding="utf-8")
footer = (SRC / "partials" / "footer.html").read_text(encoding="utf-8")

NAV_ITEMS = ("inicio", "geogis", "herramientas", "nosotros", "actualidad", "empleo", "contacto")


def parse_page(text: str, path: Path):
    match = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not match:
        raise ValueError(f"Falta front matter en {path}")
    meta = {}
    for line in match.group(1).splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, match.group(2).strip()


def render(template: str, mapping: dict) -> str:
    def repl(match):
        key = match.group(1)
        if key not in mapping:
            raise KeyError(f"Placeholder sin valor: {{{{{key}}}}}")
        return str(mapping[key])

    return re.sub(r"\{\{(\w+)\}\}", repl, template)


generated = []
for path in sorted(PAGES.rglob("*.html")):
    meta, body = parse_page(path.read_text(encoding="utf-8"), path)
    rel = path.relative_to(PAGES)
    depth = len(rel.parts) - 1
    base = "" if depth == 0 else "../" * depth
    active = meta.get("active", "")
    nav = {f"nav_{item}": ' aria-current="page"' if item == active else "" for item in NAV_ITEMS}
    mapping = {
        "title": meta["title"],
        "description": meta["description"],
        "canonical": meta["canonical"],
        "base": base,
        "body": body,
        **nav,
    }
    html = render(header, mapping) + "\n" + body + "\n" + render(footer, mapping)
    out = ROOT / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(html, encoding="utf-8")
    generated.append(str(rel))

print("Páginas generadas:")
for name in generated:
    print(f"  {name}")
