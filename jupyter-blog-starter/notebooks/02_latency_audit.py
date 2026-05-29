"""Run latency audit example from the blog post using local sample logs."""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import matplotlib.pyplot as plt

from src.analysis import load_latency_sample

if __name__ == "__main__":
    df = load_latency_sample()
    plt.hist(df["duration_ms"], bins=10, color="skyblue", edgecolor="black")
    plt.title("Distribution of Response Times")
    plt.xlabel("ms")
    plt.ylabel("Frequency")
    plt.axvline(x=500, color="red", linestyle="--", label="SLA Threshold")
    plt.legend()
    plt.savefig("reports/latency_histogram.png")
    print("Saved reports/latency_histogram.png")
