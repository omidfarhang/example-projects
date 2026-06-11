"""Run API archaeology example from the blog post using local sample data."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.analysis import load_api_sample

if __name__ == "__main__":
    df = load_api_sample()
    print("Keys:", list(df.columns))
    print(df.head())
