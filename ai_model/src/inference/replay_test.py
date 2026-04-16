from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd
from sklearn.metrics import classification_report

from ai_model.src.inference.realtime_predictor import RealtimeConcentrationPredictor


def truth_to_binary(label: str) -> str:
    return "not_concentrated" if label == "low" else "concentrated"


def main() -> None:
    parser = argparse.ArgumentParser(description="Replay test data through realtime concentration predictor")
    parser.add_argument("--data", type=Path, default=Path("data/synthetic_concentration_test.csv"))
    parser.add_argument("--model", type=Path, default=Path("models/concentration_model.joblib"))
    parser.add_argument("--threshold", type=float, default=0.55)
    parser.add_argument("--smoothing-window", type=int, default=5)
    args = parser.parse_args()

    predictor = RealtimeConcentrationPredictor(
        model_path=args.model,
        threshold=args.threshold,
        smoothing_window=args.smoothing_window,
    )

    frame = pd.read_csv(args.data)
    frame["timestamp"] = pd.to_datetime(frame["timestamp"])
    frame = frame.sort_values("timestamp").reset_index(drop=True)

    predictions: list[str] = []
    truths: list[str] = []

    for _, row in frame.iterrows():
        result = predictor.predict_event(
            heart_rate=int(row["heart_rate"]),
            acceleration=float(row["acceleration"]),
            gsr=float(row["gsr"]),
            timestamp=str(row["timestamp"].isoformat()),
        )
        if result.decision == "warming_up":
            continue

        predictions.append(result.decision)
        truths.append(truth_to_binary(str(row["concentration_level"])))

    if not predictions:
        raise RuntimeError("No predictions generated; check window size and replay data length")

    print("Replay summary")
    print(f"Evaluated predictions: {len(predictions)}")
    print(classification_report(truths, predictions, labels=["concentrated", "not_concentrated"]))


if __name__ == "__main__":
    main()
