# Documentation site

Bio-Dynamics docs can be browsed as Markdown in the repo or served as a static site via [MkDocs Material](https://squidfunk.github.io/mkdocs-material/).

## Prerequisites

```bash
python -m venv .venv-docs
source .venv-docs/bin/activate   # Windows: .venv-docs\Scripts\activate
pip install -r requirements-docs.txt
```

## Commands

From `labs/microbiome-sandbox/`:

```bash
mkdocs serve      # http://127.0.0.1:8000 — live reload
mkdocs build      # writes static HTML to site/
```

Configuration: [`mkdocs.yml`](../../mkdocs.yml) at the lab root. Navigation mirrors [`docs/README.md`](../README.md).

## Mermaid diagrams

Layer diagrams in [`domain/regions.md`](../domain/regions.md) use fenced `mermaid` blocks — rendered by MkDocs Material + PyMdown SuperFences. Plain GitHub Markdown viewers may show them as code blocks.

## Deploy (optional)

Build output in `site/` can be uploaded alongside the Vite app or hosted separately. Add `site/` to `.gitignore` if you do not commit built HTML.
