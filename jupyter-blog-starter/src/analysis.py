from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load_api_sample() -> pd.DataFrame:
    payload = json.loads((DATA / "sample_api.json").read_text(encoding="utf-8"))
    return pd.json_normalize(payload["items"])


def load_latency_sample() -> pd.DataFrame:
    rows = [json.loads(line) for line in (DATA / "logs_sample.jsonl").read_text().splitlines() if line.strip()]
    return pd.DataFrame(rows)


if __name__ == "__main__":
    print(load_api_sample())
    print(load_latency_sample().describe())
