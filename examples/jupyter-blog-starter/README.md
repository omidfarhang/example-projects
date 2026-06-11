# Jupyter Blog Starter

Companion project for:

- [Jupyter, ChatGPT, Copilot (Part 2): The Technical Guide to Jupyter Setup](https://omid.dev/2025/12/23/jupyter-technical-setup-guide/)
- [Jupyter, ChatGPT, Copilot (Part 3): Real-World Code Examples](https://omid.dev/2025/12/23/jupyter-real-world-examples/)

## Setup with uv

```bash
uv sync
uv run jupyter lab
```

Or with a virtual environment:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/jupyter lab
```

## Run blog-inspired examples

```bash
uv run python notebooks/01_api_archaeology.py
uv run python notebooks/02_latency_audit.py
```

## Layout

```text
jupyter-blog-starter/
  data/
  notebooks/
  reports/
  src/
```

## Blog posts

- https://omid.dev/2025/12/23/jupyter-technical-setup-guide/
- https://omid.dev/2025/12/23/jupyter-real-world-examples/
