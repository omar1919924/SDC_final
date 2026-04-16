# This script checks if retraining should be triggered based on the amount of new feedback collected.
# if feedback >= 20 it will retrain 
# new_feedback (20 samples) +core_set (20 samples) + personal_history (40 samples)  = 80 samples for each retraining round


from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

import pandas as pd

from config import LABEL, PERSONAL_HISTORY, RETRAINING_BATCH
from data_manager import (
    check_retrain_trigger,
    ensure_runtime_files,
    flush_feedback_to_history,
    get_last_round_number,
    is_pipeline_running,
    load_dataset,
    reset_after_round,
    assemble_retraining_batch,
)

PROJECT_ROOT = Path(__file__).resolve().parent


def _history_was_empty_before_flush() -> bool:
    history_df = load_dataset(PERSONAL_HISTORY)
    return history_df.empty


def _run_federated_round(round_number: int) -> None:
    server_cmd = [sys.executable, "federated/server.py", "--round", str(round_number)]
    client_cmd = [sys.executable, "federated/client.py"]

    server_proc = subprocess.Popen(server_cmd, cwd=PROJECT_ROOT)
    time.sleep(2.0)

    try:
        client_result = subprocess.run(client_cmd, cwd=PROJECT_ROOT, check=False)
        if client_result.returncode != 0:
            raise RuntimeError(f"Client exited with code {client_result.returncode}")

        server_return = server_proc.wait(timeout=120)
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


def main() -> None:
    ensure_runtime_files()

    if not check_retrain_trigger():
        print("Retraining not triggered: not enough feedback rows.")
        return

    if is_pipeline_running():
        print("Retraining skipped: sensor pipeline is currently active (bracelet is being worn).")
        print("Please stop the pipeline and try again.")
        return

    current_round = get_last_round_number()
    was_empty_before_flush = _history_was_empty_before_flush()
    next_round = current_round + 1
    round_number = 1 if was_empty_before_flush and current_round == 0 else next_round

    flush_feedback_to_history()
    batch_df = assemble_retraining_batch(round_number=round_number)

    if batch_df.empty:
        print("Retraining batch is empty; aborting.")
        return

    batch_counts = batch_df[LABEL].value_counts().to_dict()
    print(f"Starting federated retraining round {round_number}...")

    try:
        _run_federated_round(round_number)
    except Exception as exc:
        print(f"Federated round failed: {exc}")
        print("Skipping reset_after_round due to failure.")
        return

    training_df = pd.read_csv(RETRAINING_BATCH)
    composition = {
        "n_new_feedback": 20 if round_number == 1 else 20,
        "n_coreset": 40 if round_number == 1 else 20,
        "n_personal_history": 0 if round_number == 1 else 40,
    }
    reset_after_round(round_number=round_number, composition=composition)

    val_accuracy, val_f1 = _read_latest_summary(round_number)
    print(
        f"Round {round_number} complete | samples: {len(training_df)} | "
        f"val_accuracy: {val_accuracy:.4f} | val_f1: {val_f1:.4f}"
    )
    print(f"Batch label distribution: {batch_counts}")


if __name__ == "__main__":
    main()
