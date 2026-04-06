from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from config import (
    ALL_COLUMNS,
    CLASSES,
    CORE_SET,
    CORE_SET_TOTAL_SIZE,
    CORESET_SOURCE,
    CORESET_SIZE_DEFAULT,
    CORESET_SIZE_ROUND1,
    FEATURES,
    FEEDBACK_THRESHOLD,
    LABEL,
    LOG_COLUMNS,
    LOGS_DIR,
    MIN_HISTORY_FOR_VALIDATION,
    NEW_FEEDBACK,
    NEW_FEEDBACK_SIZE,
    PERSONAL_HIST_SIZE,
    PERSONAL_HISTORY,
    PIPELINE_LOCK_FILE,
    RETRAIN_LOG_PATH,
    RETRAINING_BATCH,
    VALIDATION_SPLIT,
)


def _empty_dataframe() -> pd.DataFrame:
    return pd.DataFrame(columns=ALL_COLUMNS)


def ensure_runtime_files() -> None:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    for path in [NEW_FEEDBACK, PERSONAL_HISTORY, RETRAINING_BATCH, CORE_SET]:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        if not Path(path).exists():
            _empty_dataframe().to_csv(path, index=False)

    if not RETRAIN_LOG_PATH.exists():
        pd.DataFrame(columns=LOG_COLUMNS).to_csv(RETRAIN_LOG_PATH, index=False)


def load_dataset(path: Path, allow_missing: bool = True) -> pd.DataFrame:
    if not path.exists():
        if allow_missing:
            return _empty_dataframe()
        raise FileNotFoundError(f"Missing required file: {path}")

    df = pd.read_csv(path)
    for column in ALL_COLUMNS:
        if column not in df.columns:
            df[column] = np.nan
    return df[ALL_COLUMNS]


def class_balanced_sample(
    df: pd.DataFrame,
    n_total: int,
    label_col: str,
    classes: list[int],
    replace_if_needed: bool = True,
) -> pd.DataFrame:
    if df.empty or n_total <= 0:
        return df.iloc[0:0].copy()

    working_df = df.copy()
    n_classes = len(classes)
    n_per_class = n_total // n_classes
    remainder = n_total % n_classes
    sampled_parts: list[pd.DataFrame] = []

    class_counts = (
        working_df[label_col].value_counts().reindex(classes, fill_value=0).to_dict()
    )
    majority_class = max(class_counts, key=class_counts.get)

    for class_value in classes:
        class_df = working_df[working_df[label_col] == class_value]
        if class_df.empty:
            continue
        replace = replace_if_needed and len(class_df) < n_per_class
        if n_per_class > 0:
            sampled_parts.append(
                class_df.sample(
                    n=n_per_class,
                    replace=replace,
                    random_state=42,
                )
            )

    if remainder > 0:
        remainder_df = working_df[working_df[label_col] == majority_class]
        if not remainder_df.empty:
            replace = replace_if_needed and len(remainder_df) < remainder
            sampled_parts.append(
                remainder_df.sample(n=remainder, replace=replace, random_state=42)
            )

    if not sampled_parts:
        return working_df.iloc[0:0].copy()

    sampled_df = pd.concat(sampled_parts, ignore_index=True)
    sampled_df = sampled_df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return sampled_df


def initialize_core_set() -> pd.DataFrame:
    ensure_runtime_files()
    source_df = load_dataset(CORESET_SOURCE, allow_missing=False)
    source_df = source_df.dropna(subset=FEATURES + [LABEL]).copy()

    core_set_df = class_balanced_sample(
        source_df,
        n_total=CORE_SET_TOTAL_SIZE,
        label_col=LABEL,
        classes=CLASSES,
        replace_if_needed=True,
    )
    core_set_df.to_csv(CORE_SET, index=False)
    print(f"Initialized core set: {len(core_set_df)} rows at {CORE_SET}")
    return core_set_df


def check_retrain_trigger() -> bool:
    if not NEW_FEEDBACK.exists():
        return False

    new_feedback_df = pd.read_csv(NEW_FEEDBACK)
    return len(new_feedback_df) >= FEEDBACK_THRESHOLD


def is_pipeline_running() -> bool:
    """Check if sensor pipeline is currently active by looking for lock file."""
    return PIPELINE_LOCK_FILE.exists()


def flush_feedback_to_history() -> None:
    ensure_runtime_files()
    feedback_df = load_dataset(NEW_FEEDBACK)
    history_df = load_dataset(PERSONAL_HISTORY)

    if feedback_df.empty:
        print("No new feedback rows to flush.")
        return

    merged_history = pd.concat([history_df, feedback_df], ignore_index=True)
    merged_history.to_csv(PERSONAL_HISTORY, index=False)
    print(f"Flushed {len(feedback_df)} feedback rows into personal history.")


def _composition_counts(df: pd.DataFrame) -> dict[int, int]:
    if df.empty:
        return {class_id: 0 for class_id in CLASSES}
    return (
        df[LABEL].value_counts().reindex(CLASSES, fill_value=0).astype(int).to_dict()
    )


def assemble_retraining_batch(round_number: int) -> pd.DataFrame:
    ensure_runtime_files()

    new_feedback_df = load_dataset(NEW_FEEDBACK)
    core_set_df = load_dataset(CORE_SET)
    personal_history_df = load_dataset(PERSONAL_HISTORY)

    sampled_new = class_balanced_sample(
        new_feedback_df,
        n_total=NEW_FEEDBACK_SIZE,
        label_col=LABEL,
        classes=CLASSES,
        replace_if_needed=True,
    )

    if round_number == 1:
        sampled_core = class_balanced_sample(
            core_set_df,
            n_total=CORESET_SIZE_ROUND1,
            label_col=LABEL,
            classes=CLASSES,
            replace_if_needed=True,
        )
        sampled_history = personal_history_df.iloc[0:0].copy()
    else:
        sampled_core = class_balanced_sample(
            core_set_df,
            n_total=CORESET_SIZE_DEFAULT,
            label_col=LABEL,
            classes=CLASSES,
            replace_if_needed=True,
        )
        sampled_history = class_balanced_sample(
            personal_history_df,
            n_total=PERSONAL_HIST_SIZE,
            label_col=LABEL,
            classes=CLASSES,
            replace_if_needed=True,
        )

    batch_df = pd.concat([sampled_new, sampled_core, sampled_history], ignore_index=True)
    batch_df = batch_df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    batch_df.to_csv(RETRAINING_BATCH, index=False)

    print("Retraining batch assembled:")
    print(f"  new_feedback: {len(sampled_new)} | per class: {_composition_counts(sampled_new)}")
    print(f"  core_set: {len(sampled_core)} | per class: {_composition_counts(sampled_core)}")
    print(
        f"  personal_history: {len(sampled_history)} | per class: {_composition_counts(sampled_history)}"
    )
    print(f"  total: {len(batch_df)}")

    return batch_df


def get_validation_set() -> Optional[tuple[np.ndarray, np.ndarray]]:
    ensure_runtime_files()
    history_df = load_dataset(PERSONAL_HISTORY)
    history_df = history_df.dropna(subset=FEATURES + [LABEL])

    if len(history_df) < MIN_HISTORY_FOR_VALIDATION:
        print("Warning: personal_history is too small for validation split; skipping.")
        return None

    _, val_df = train_test_split(
        history_df,
        test_size=VALIDATION_SPLIT,
        stratify=history_df[LABEL],
        random_state=42,
    )

    x_val = val_df[FEATURES].to_numpy(dtype=np.float32)
    y_val = val_df[LABEL].to_numpy(dtype=np.int64)
    return x_val, y_val


def get_last_round_number() -> int:
    ensure_runtime_files()
    log_df = pd.read_csv(RETRAIN_LOG_PATH)
    if log_df.empty:
        return 0
    return int(log_df["round"].max())


def reset_after_round(round_number: int, composition: Optional[dict[str, int]] = None) -> None:
    ensure_runtime_files()
    _empty_dataframe().to_csv(NEW_FEEDBACK, index=False)
    _empty_dataframe().to_csv(RETRAINING_BATCH, index=False)

    timestamp = datetime.utcnow().isoformat()
    log_df = pd.read_csv(RETRAIN_LOG_PATH)
    composition = composition or {}

    if not log_df.empty and (log_df["round"] == round_number).any():
        idx = log_df.index[log_df["round"] == round_number][-1]
        log_df.at[idx, "timestamp"] = timestamp
        log_df.at[idx, "n_new_feedback"] = int(composition.get("n_new_feedback", 0))
        log_df.at[idx, "n_coreset"] = int(composition.get("n_coreset", 0))
        log_df.at[idx, "n_personal_history"] = int(composition.get("n_personal_history", 0))
        log_df.to_csv(RETRAIN_LOG_PATH, index=False)
        print(f"Reset complete for round {round_number}.")
        return

    new_row = {
        "round": int(round_number),
        "timestamp": timestamp,
        "n_new_feedback": int(composition.get("n_new_feedback", 0)),
        "n_coreset": int(composition.get("n_coreset", 0)),
        "n_personal_history": int(composition.get("n_personal_history", 0)),
        "val_accuracy": np.nan,
        "val_f1_macro": np.nan,
        "f1_class_0": np.nan,
        "f1_class_1": np.nan,
        "f1_class_2": np.nan,
    }
    log_df = pd.concat([log_df, pd.DataFrame([new_row])], ignore_index=True)
    log_df.to_csv(RETRAIN_LOG_PATH, index=False)
    print(f"Reset complete for round {round_number}.")


def simulate_feedback(n_rows: int) -> None:
    ensure_runtime_files()
    core_source = load_dataset(CORESET_SOURCE, allow_missing=False)
    core_source = core_source.dropna(subset=FEATURES + [LABEL])
    sampled = class_balanced_sample(
        core_source,
        n_total=n_rows,
        label_col=LABEL,
        classes=CLASSES,
        replace_if_needed=True,
    )

    new_feedback_df = load_dataset(NEW_FEEDBACK)
    merged = pd.concat([new_feedback_df, sampled], ignore_index=True)
    merged.to_csv(NEW_FEEDBACK, index=False)
    print(f"Added {len(sampled)} simulated feedback rows.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Dataset manager for federated stress model")
    parser.add_argument("--init", action="store_true", help="Initialize runtime files + core set")
    parser.add_argument(
        "--simulate-feedback",
        type=int,
        default=0,
        help="Simulate N rows of teacher feedback",
    )
    args = parser.parse_args()

    ensure_runtime_files()

    if args.init:
        initialize_core_set()

    if args.simulate_feedback > 0:
        simulate_feedback(args.simulate_feedback)


if __name__ == "__main__":
    main()
