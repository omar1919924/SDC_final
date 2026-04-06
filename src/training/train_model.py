from __future__ import annotations

import argparse
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score

from src.features.window_features import build_window_features, feature_columns


def map_binary_target(labels: pd.Series) -> pd.Series:
    mapping = {"low": 1, "medium": 0, "high": 0}
    if not set(labels.unique()).issubset(mapping.keys()):
        raise ValueError("Unexpected labels in concentration_level")
    return labels.map(mapping).astype(int)


def load_dataset(file_path: Path, window_size: int) -> tuple[pd.DataFrame, pd.Series]:
    frame = pd.read_csv(file_path)
    features = build_window_features(frame, window_size=window_size)
    labels = map_binary_target(features["concentration_level"])
    x = features[list(feature_columns())]
    return x, labels


def train_and_select_model(x_train: pd.DataFrame, y_train: pd.Series, x_test: pd.DataFrame, y_test: pd.Series):
    candidates = {
        "logistic_regression": LogisticRegression(max_iter=300),
        "random_forest": RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1),
        "hist_gradient_boosting": HistGradientBoostingClassifier(max_depth=6, random_state=42),
    }

    best_name = ""
    best_model = None
    best_score = -1.0

    for name, model in candidates.items():
        model.fit(x_train, y_train)
        predictions = model.predict(x_test)
        score = f1_score(y_test, predictions, pos_label=1)
        print(f"{name}: f1_not_concentrated={score:.4f}, accuracy={accuracy_score(y_test, predictions):.4f}")

        if score > best_score:
            best_score = score
            best_name = name
            best_model = model

    assert best_model is not None
    return best_name, best_model


def main() -> None:
    parser = argparse.ArgumentParser(description="Train concentration model for realtime prediction")
    parser.add_argument("--train", type=Path, default=Path("data/synthetic_concentration_train.csv"))
    parser.add_argument("--test", type=Path, default=Path("data/synthetic_concentration_test.csv"))
    parser.add_argument("--window-size", type=int, default=30)
    parser.add_argument("--model-out", type=Path, default=Path("models/concentration_model.joblib"))
    args = parser.parse_args()

    x_train, y_train = load_dataset(args.train, window_size=args.window_size)
    x_test, y_test = load_dataset(args.test, window_size=args.window_size)

    model_name, model = train_and_select_model(x_train, y_train, x_test, y_test)

    test_predictions = model.predict(x_test)
    print("\nSelected model:", model_name)
    print(classification_report(y_test, test_predictions, target_names=["concentrated", "not_concentrated"]))

    payload = {
        "model": model,
        "feature_columns": list(feature_columns()),
        "window_size": args.window_size,
        "label_map": {0: "concentrated", 1: "not_concentrated"},
        "selected_model": model_name,
    }

    args.model_out.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(payload, args.model_out)
    print(f"Saved model artifact: {args.model_out.resolve()}")


if __name__ == "__main__":
    main()
