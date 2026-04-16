from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

import pandas as pd

from config import CLASSES, CORE_SET, LABEL, RETRAINING_BATCH
from data_manager import (
    class_balanced_sample,
    ensure_runtime_files,
    get_last_round_number,
    initialize_core_set,
    load_dataset,
    reset_after_round,
)

PROJECT_ROOT = Path(__file__).resolve().parent


def _run_federated_round(round_number: int) -> None:
    server_cmd = [sys.executable, "federated/server.py", "--round", str(round_number)]
    client_cmd = [sys.executable, "federated/client.py"]

    server_proc = subprocess.Popen(server_cmd, cwd=PROJECT_ROOT)
    time.sleep(2.0)

    try:
        client_result = subprocess.run(client_cmd, cwd=PROJECT_ROOT, check=False)
        if client_result.returncode != 0:
            raise RuntimeError(f"Client exited with code {client_result.returncode}")

        server_return = server_proc.wait(timeout=180)
        if server_return != 0:
            raise RuntimeError(f"Server exited with code {server_return}")
    except Exception:
        if server_proc.poll() is None:
            server_proc.terminate()
            try:
                server_proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server_proc.kill()
        raise


def _read_latest_summary(round_number: int) -> tuple[float, float]:
    from config import RETRAIN_LOG_PATH

    if not RETRAIN_LOG_PATH.exists():
        return 0.0, 0.0

    log_df = pd.read_csv(RETRAIN_LOG_PATH)
    if log_df.empty:
        return 0.0, 0.0

    round_rows = log_df[log_df["round"] == round_number]
    if round_rows.empty:
        return 0.0, 0.0

    row = round_rows.iloc[-1]
    return float(row.get("val_accuracy", 0.0) or 0.0), float(row.get("val_f1_macro", 0.0) or 0.0)


def _load_or_fix_core_set() -> pd.DataFrame:
    core_df = load_dataset(CORE_SET)
    if not core_df.empty:
        return core_df

    dashed_core_set = PROJECT_ROOT / "data" / "core-set.csv"
    if dashed_core_set.exists():
        dashed_df = pd.read_csv(dashed_core_set)
        dashed_df.to_csv(CORE_SET, index=False)
        return load_dataset(CORE_SET)

    initialize_core_set()
    return load_dataset(CORE_SET)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Bootstrap first federated round using only core_set rows"
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=60,
        help="Rows to sample from core_set for this bootstrap round",
    )
    parser.add_argument(
        "--round",
        type=int,
        default=0,
        help="Optional explicit round number (default: auto)",
    )
    args = parser.parse_args()

    ensure_runtime_files()

    core_df = _load_or_fix_core_set()
    if core_df.empty:
        print("core_set is empty; cannot bootstrap round.")
        return

    round_number = args.round if args.round > 0 else max(1, get_last_round_number() + 1)

    batch_df = class_balanced_sample(
        core_df,
        n_total=args.samples,
        label_col=LABEL,
        classes=CLASSES,
        replace_if_needed=True,
    )

    if batch_df.empty:
        print("Could not assemble bootstrap retraining batch.")
        return

    batch_df.to_csv(RETRAINING_BATCH, index=False)
    print(f"Bootstrap batch created from core_set only: {len(batch_df)} rows")
    print(f"Class distribution: {batch_df[LABEL].value_counts().to_dict()}")
    print(f"Starting federated round {round_number}...")

    try:
        _run_federated_round(round_number)
    except Exception as exc:
        print(f"Federated round failed: {exc}")
        print("Skipping reset_after_round due to failure.")
        return

    training_df = pd.read_csv(RETRAINING_BATCH)
    composition = {
        "n_new_feedback": 0,
        "n_coreset": int(len(training_df)),
        "n_personal_history": 0,
    }
    reset_after_round(round_number=round_number, composition=composition)

    val_accuracy, val_f1 = _read_latest_summary(round_number)
    print(
        f"Round {round_number} complete | samples: {len(training_df)} | "
        f"val_accuracy: {val_accuracy:.4f} | val_f1: {val_f1:.4f}"
    )


if __name__ == "__main__":
    main()
