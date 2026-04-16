from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import flwr as fl
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from config import LOG_COLUMNS, NUM_ROUNDS, RETRAIN_LOG_PATH, SERVER_ADDRESS


def _ensure_log_file() -> None:
    RETRAIN_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not RETRAIN_LOG_PATH.exists():
        pd.DataFrame(columns=LOG_COLUMNS).to_csv(RETRAIN_LOG_PATH, index=False)


def _upsert_round_metrics(round_number: int, metrics: dict[str, float]) -> None:
    _ensure_log_file()
    log_df = pd.read_csv(RETRAIN_LOG_PATH)

    new_row = {
        "round": int(round_number),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "n_new_feedback": log_df.loc[log_df["round"] == round_number, "n_new_feedback"].iloc[-1] if (not log_df.empty and (log_df["round"] == round_number).any()) else 0,
        "n_coreset": log_df.loc[log_df["round"] == round_number, "n_coreset"].iloc[-1] if (not log_df.empty and (log_df["round"] == round_number).any()) else 0,
        "n_personal_history": log_df.loc[log_df["round"] == round_number, "n_personal_history"].iloc[-1] if (not log_df.empty and (log_df["round"] == round_number).any()) else 0,
        "val_accuracy": float(metrics.get("accuracy", 0.0)),
        "val_f1_macro": float(metrics.get("f1_macro", 0.0)),
        "f1_class_0": float(metrics.get("f1_class_0", 0.0)),
        "f1_class_1": float(metrics.get("f1_class_1", 0.0)),
        "f1_class_2": float(metrics.get("f1_class_2", 0.0)),
    }

    if not log_df.empty and (log_df["round"] == round_number).any():
        idx = log_df.index[log_df["round"] == round_number][-1]
        for key, value in new_row.items():
            log_df.at[idx, key] = value
    else:
        log_df = pd.concat([log_df, pd.DataFrame([new_row])], ignore_index=True)

    log_df.to_csv(RETRAIN_LOG_PATH, index=False)


def _weighted_average(metrics):
    if not metrics:
        return {}

    total_examples = sum(num_examples for num_examples, _ in metrics)
    if total_examples == 0:
        return {}

    output = {}
    for key in ["accuracy", "f1_macro", "f1_class_0", "f1_class_1", "f1_class_2"]:
        output[key] = sum(
            num_examples * float(metric_dict.get(key, 0.0))
            for num_examples, metric_dict in metrics
        ) / total_examples
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description="Flower server for stress model")
    parser.add_argument("--round", type=int, default=1, dest="round_number")
    args = parser.parse_args()

    strategy = fl.server.strategy.FedAvg(
        min_fit_clients=1,
        min_evaluate_clients=1,
        min_available_clients=1,
        evaluate_metrics_aggregation_fn=_weighted_average,
    )

    history = fl.server.start_server(
        server_address=SERVER_ADDRESS,
        config=fl.server.ServerConfig(num_rounds=NUM_ROUNDS),
        strategy=strategy,
    )

    metrics = {}
    if history.metrics_distributed:
        for key, series in history.metrics_distributed.items():
            if series:
                metrics[key] = float(series[-1][1])

    _upsert_round_metrics(args.round_number, metrics)
    print(f"Server finished round {args.round_number} with metrics: {metrics}")


if __name__ == "__main__":
    main()
