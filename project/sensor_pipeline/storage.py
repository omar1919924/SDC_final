from __future__ import annotations

import csv
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
MAIN_DATASET_PATH = DATA_DIR / "main_dataset.csv"
FEEDBACK_SET_PATH = DATA_DIR / "feedback_set.csv"

MAIN_DATASET_COLUMNS = [
    "timestamp",
    "HR_Mean",
    "HRV",
    "GSR_peaks_per_min",
    "GSR_slope",
    "Acc_magnitude_mean",
    "Acc_magnitude_std",
    "Acc_jerk",
    "model_prediction",
]

FEEDBACK_COLUMNS = MAIN_DATASET_COLUMNS + ["teacher_label"]


def ensure_storage_files() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for path, columns in [
        (MAIN_DATASET_PATH, MAIN_DATASET_COLUMNS),
        (FEEDBACK_SET_PATH, FEEDBACK_COLUMNS),
    ]:
        if not path.exists():
            with path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.writer(handle)
                writer.writerow(columns)


def _normalize_timestamp(timestamp: Any | None) -> str:
    if timestamp is None:
        return datetime.now(timezone.utc).isoformat()
    if isinstance(timestamp, datetime):
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        return timestamp.astimezone(timezone.utc).isoformat()
    return str(timestamp)


def _append_row(path: Path, columns: list[str], row: dict[str, Any]) -> None:
    ensure_storage_files()
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writerow({column: row.get(column, "") for column in columns})


def append_prediction(features: dict[str, Any], model_prediction: int, timestamp: Any | None = None) -> dict[str, Any]:
    entry = {
        "timestamp": _normalize_timestamp(timestamp or features.get("timestamp")),
        "HR_Mean": features["HR_Mean"],
        "HRV": features["HRV"],
        "GSR_peaks_per_min": features["GSR_peaks_per_min"],
        "GSR_slope": features["GSR_slope"],
        "Acc_magnitude_mean": features["Acc_magnitude_mean"],
        "Acc_magnitude_std": features["Acc_magnitude_std"],
        "Acc_jerk": features["Acc_jerk"],
        "model_prediction": int(model_prediction),
    }
    _append_row(MAIN_DATASET_PATH, MAIN_DATASET_COLUMNS, entry)
    return entry


def save_feedback(entry: dict[str, Any], teacher_label: int) -> dict[str, Any]:
    feedback_entry = {
        "timestamp": _normalize_timestamp(entry.get("timestamp")),
        "HR_Mean": entry["HR_Mean"],
        "HRV": entry["HRV"],
        "GSR_peaks_per_min": entry["GSR_peaks_per_min"],
        "GSR_slope": entry["GSR_slope"],
        "Acc_magnitude_mean": entry["Acc_magnitude_mean"],
        "Acc_magnitude_std": entry["Acc_magnitude_std"],
        "Acc_jerk": entry["Acc_jerk"],
        "model_prediction": int(entry["model_prediction"]),
        "teacher_label": int(teacher_label),
    }
    _append_row(FEEDBACK_SET_PATH, FEEDBACK_COLUMNS, feedback_entry)
    return feedback_entry
